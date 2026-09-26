import { QueryTypes } from "sequelize";
import Campaign from "../../models/Campaign";
import AppError from "../../errors/AppError";

interface Request {
  campaignId: string | number;
  tenantId: string | number;
}

const ReportCampaignService = async ({
  campaignId,
  tenantId
}: Request): Promise<any> => {
  const campaign = await Campaign.findOne({
    where: { id: campaignId, tenantId }
  });

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  // 1. Métricas agregadas de CampaignContacts
  const querySummary = `
    SELECT 
      COUNT(cc.id)::int AS "totalContatos",
      COUNT(CASE WHEN cc.ack = 0 OR cc.ack IS NULL THEN 1 END)::int AS "pendentesEnvio",
      COUNT(CASE WHEN cc.ack >= 1 THEN 1 END)::int AS "enviadas",
      COUNT(CASE WHEN cc.ack >= 2 THEN 1 END)::int AS "entregues",
      COUNT(CASE WHEN cc.ack = 3 THEN 1 END)::int AS "lidas",
      COUNT(CASE WHEN cc.ack = -1 THEN 1 END)::int AS "falhas",
      COUNT(CASE WHEN cc."messageRandom" = 'message1' THEN 1 END)::int AS "msg1Total",
      COUNT(CASE WHEN cc."messageRandom" = 'message1' AND cc.ack = 3 THEN 1 END)::int AS "msg1Lidas",
      COUNT(CASE WHEN cc."messageRandom" = 'message2' THEN 1 END)::int AS "msg2Total",
      COUNT(CASE WHEN cc."messageRandom" = 'message2' AND cc.ack = 3 THEN 1 END)::int AS "msg2Lidas",
      COUNT(CASE WHEN cc."messageRandom" = 'message3' THEN 1 END)::int AS "msg3Total",
      COUNT(CASE WHEN cc."messageRandom" = 'message3' AND cc.ack = 3 THEN 1 END)::int AS "msg3Lidas"
    FROM "CampaignContacts" cc
    WHERE cc."campaignId" = :campaignId
  `;

  const [summary]: any = await campaign.sequelize!.query(querySummary, {
    replacements: { campaignId: campaign.id },
    type: QueryTypes.SELECT
  });

  // 2. Lista detalhada de contatos
  const queryContacts = `
    SELECT 
      c.id AS "contactId",
      c.name,
      c.number,
      c."profilePicUrl",
      cc.id AS "campaignContactId",
      COALESCE(cc.ack, 0) AS ack,
      cc."messageRandom",
      cc.body AS "mensagemEnviada",
      cc.timestamp,
      cc."createdAt",
      cc."updatedAt"
    FROM "CampaignContacts" cc
    JOIN "Contacts" c ON cc."contactId" = c.id
    WHERE cc."campaignId" = :campaignId
    ORDER BY c.name ASC
  `;

  const contacts: any = await campaign.sequelize!.query(queryContacts, {
    replacements: { campaignId: campaign.id },
    type: QueryTypes.SELECT
  });

  const total = summary?.totalContatos || 0;
  const entregues = summary?.entregues || 0;
  const lidas = summary?.lidas || 0;
  const falhas = summary?.falhas || 0;
  const enviadas = summary?.enviadas || 0;
  const pendentesEnvio = summary?.pendentesEnvio || 0;

  const taxaEntrega = total > 0 ? ((entregues / total) * 100).toFixed(1) : "0.0";
  const taxaLeitura = entregues > 0 ? ((lidas / entregues) * 100).toFixed(1) : "0.0";
  const taxaFalha = total > 0 ? ((falhas / total) * 100).toFixed(1) : "0.0";

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      start: campaign.start,
      status: campaign.status,
      message1: campaign.message1,
      message2: campaign.message2,
      message3: campaign.message3,
      mediaUrl: campaign.mediaUrl
    },
    metrics: {
      total,
      pendentesEnvio,
      enviadas,
      entregues,
      lidas,
      falhas,
      taxaEntrega,
      taxaLeitura,
      taxaFalha
    },
    variations: {
      message1: {
        total: summary?.msg1Total || 0,
        lidas: summary?.msg1Lidas || 0,
        text: campaign.message1
      },
      message2: {
        total: summary?.msg2Total || 0,
        lidas: summary?.msg2Lidas || 0,
        text: campaign.message2
      },
      message3: {
        total: summary?.msg3Total || 0,
        lidas: summary?.msg3Lidas || 0,
        text: campaign.message3
      }
    },
    contacts
  };
};

export default ReportCampaignService;
