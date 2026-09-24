/* eslint-disable eqeqeq */
import { QueryTypes } from "sequelize";

import Ticket from "../../models/Ticket";
import socketEmit from "../../helpers/socketEmit";
import ListSettingsService from "../SettingServices/ListSettingsService";
import CreateMessageSystemService from "../MessageServices/CreateMessageSystemService";

const FindUpdateTicketsInactiveChatBot = async (): Promise<void> => {
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
  `;

  const tickets: any = await Ticket.sequelize?.query(query, {
    type: QueryTypes.SELECT
  });

  Promise.all(
    tickets.map(async (item: any) => {
      if (!item.is_inactive && !item.botInactiveWarningSentAt) return;

      const ticket = await Ticket.findByPk(item.id, { include: ["contact"] });
      if (!ticket) return;

      const settings = await ListSettingsService(ticket.tenantId);
      const closeTimeStr = settings?.find(s => s.key === "botInactiveWarningTime")?.value || "5";
      const closeTime = parseInt(closeTimeStr, 10);
      const warningMessage = settings?.find(s => s.key === "botInactiveWarningMessage")?.value || "Olá, ainda está por aí? Se não houver resposta, o atendimento será encerrado.";
      const closeMessage = settings?.find(s => s.key === "botInactiveCloseMessage")?.value || "Atendimento encerrado por inatividade.";

      if (!ticket.botInactiveWarningSentAt) {
        if (!item.is_inactive) return; 
        
        await CreateMessageSystemService({
          msg: { body: warningMessage, fromMe: true, read: true },
          tenantId: ticket.tenantId,
          ticket,
          sendType: "bot",
          status: "pending"
        });

        await ticket.update({ botInactiveWarningSentAt: new Date() });
      } else {
        const sentAt = new Date(ticket.botInactiveWarningSentAt).getTime();
        const lastMsgAt = ticket.lastMessageAt ? Number(ticket.lastMessageAt) : 0;

        if (lastMsgAt > sentAt) {
          await ticket.update({ botInactiveWarningSentAt: null });
          return;
        }

        const now = new Date().getTime();
        const diffMinutes = Math.floor((now - sentAt) / (1000 * 60));

        if (diffMinutes >= closeTime) {
          await CreateMessageSystemService({
            msg: { body: closeMessage, fromMe: true, read: true },
            tenantId: ticket.tenantId,
            ticket,
            sendType: "bot",
            status: "pending"
          });

          await ticket.update({
            status: "closed",
            botInactiveWarningSentAt: null,
            chatFlowId: null,
            stepChatFlow: null,
            botRetries: 0
          });

          socketEmit({
            tenantId: ticket.tenantId,
            type: "ticket:update",
            payload: ticket
          });
        }
      }
    })
  );
};

export default FindUpdateTicketsInactiveChatBot;
