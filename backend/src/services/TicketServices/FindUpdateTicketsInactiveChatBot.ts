/* eslint-disable eqeqeq */
import { QueryTypes, Op } from "sequelize";

import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import socketEmit from "../../helpers/socketEmit";
import ListSettingsService from "../SettingServices/ListSettingsService";
import CreateMessageSystemService from "../MessageServices/CreateMessageSystemService";
import { logger } from "../../utils/logger";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const FindUpdateTicketsInactiveChatBot = async (): Promise<void> => {
  try {
    const query = `
      select
      t.id,
      t."tenantId",
      t."botInactiveWarningSentAt",
      config->'configurations'->'notResponseMessage'->'type' as type_action,
      config->'configurations'->'notResponseMessage'->'destiny' as destiny,
      (t."lastInteractionBot" < CURRENT_TIMESTAMP - concat(COALESCE(NULLIF(config->'configurations'->'notResponseMessage'->>'time', ''), s2.value, '5'), ' MINUTES')::interval) as is_inactive
      from "Tickets" t
      inner join "ChatFlow" cf on t."tenantId" = cf."tenantId" and cf.id = t."chatFlowId"
      inner join "Settings" s on s."tenantId" = cf."tenantId" and s."key" = 'botTicketActive'
      left join "Settings" s2 on s2."tenantId" = cf."tenantId" and s2."key" = 'botInactiveWarningTime'
      cross join lateral json_array_elements(cf.flow->'nodeList') as config
      where t."chatFlowId"::text = s.value
      and t.status = 'pending'
      and config->>'type' = 'configurations'
      and (t."queueId" is null and t."userId" is null)
      limit 25
    `;

    const tickets: any = await Ticket.sequelize?.query(query, {
      type: QueryTypes.SELECT
    });

    if (!tickets || tickets.length === 0) return;

    // Cache settings per tenant to avoid hammering database
    const settingsCache = new Map<number | string, any[]>();

    for (const item of tickets) {
      if (!item.is_inactive && !item.botInactiveWarningSentAt) continue;

      try {
        const ticket = await Ticket.findByPk(item.id, { include: ["contact"] });
        if (!ticket || ticket.status !== "pending") continue;

        let settings = settingsCache.get(ticket.tenantId);
        if (!settings) {
          settings = await ListSettingsService(ticket.tenantId);
          settingsCache.set(ticket.tenantId, settings || []);
        }

        const closeTimeStr = settings?.find((s: any) => s.key === "botInactiveWarningTime")?.value || "5";
        const closeTime = parseInt(closeTimeStr, 10);
        const warningMessage = settings?.find((s: any) => s.key === "botInactiveWarningMessage")?.value || "Olá, ainda está por aí? Se não houver resposta, o atendimento será encerrado.";
        const closeMessage = settings?.find((s: any) => s.key === "botInactiveCloseMessage")?.value || "Atendimento encerrado por inatividade.";

        if (!ticket.botInactiveWarningSentAt) {
          if (!item.is_inactive) continue;

          // Trava atômica no banco: só quem conseguir atualizar de null -> now envia a mensagem!
          // Isso impede 100% o envio de 2 mensagens duplicadas em caso de concorrência de jobs.
          const [affectedRows] = await Ticket.update(
            { botInactiveWarningSentAt: new Date() },
            { where: { id: ticket.id, botInactiveWarningSentAt: null, status: "pending" } }
          );

          if (affectedRows === 0) {
            // Outro processo concorrente já atualizou este ticket
            continue;
          }

          try {
            await CreateMessageSystemService({
              msg: { body: warningMessage, fromMe: true, read: true },
              tenantId: ticket.tenantId,
              ticket,
              sendType: "bot",
              status: "pending"
            });
            await sleep(1500);
          } catch (e) {
            logger.error("FindUpdateTicketsInactiveChatBot > CreateMessageSystemService (warning)", e);
          }
        } else {
          const lastMessage = await Message.findOne({ where: { ticketId: ticket.id }, order: [["createdAt", "DESC"]] });

          if (lastMessage && lastMessage.fromMe === false) {
            await ticket.update({ botInactiveWarningSentAt: null });
            continue;
          }

          const sentAt = new Date(ticket.botInactiveWarningSentAt).getTime();
          const now = new Date().getTime();
          const diffMinutes = Math.floor((now - sentAt) / (1000 * 60));

          if (diffMinutes >= closeTime) {
            // Trava atômica no encerramento: só encerra e envia se ainda estiver pendente
            const [affectedClose] = await Ticket.update(
              {
                status: "closed",
                botInactiveWarningSentAt: null,
                chatFlowId: null,
                stepChatFlow: null,
                botRetries: 0
              },
              { where: { id: ticket.id, status: "pending" } }
            );

            if (affectedClose === 0) {
              // Outro processo já encerrou
              continue;
            }

            try {
              await CreateMessageSystemService({
                msg: { body: closeMessage, fromMe: true, read: true },
                tenantId: ticket.tenantId,
                ticket,
                sendType: "bot",
                status: "pending"
              });
              await sleep(1500);
            } catch (e) {
              logger.error("FindUpdateTicketsInactiveChatBot > CreateMessageSystemService (close)", e);
            }

            socketEmit({
              tenantId: ticket.tenantId,
              type: "ticket:update",
              payload: ticket
            });
          }
        }
      } catch (errTicket) {
        logger.error(`FindUpdateTicketsInactiveChatBot > error processing ticket ${item.id}`, errTicket);
      }
    }
  } catch (err) {
    logger.error("FindUpdateTicketsInactiveChatBot error", err);
  }
};

export default FindUpdateTicketsInactiveChatBot;
