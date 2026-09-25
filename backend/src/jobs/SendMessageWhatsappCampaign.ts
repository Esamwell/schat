/* eslint-disable @typescript-eslint/no-explicit-any */
import { join } from "path";
import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
import { logger } from "../utils/logger";
import { getWbot } from "../libs/wbot";
import CampaignContacts from "../models/CampaignContacts";

export default {
  key: "SendMessageWhatsappCampaign",
  options: {
    delay: 15000,
    attempts: 3,
    removeOnComplete: true,
    // removeOnFail: true,
    backoff: {
      type: "fixed",
      delay: 60000 * 2 // 2 min
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: any) {
    try {
      const wbot = getWbot(data.whatsappId);
      let message = {} as WbotMessage;

      let targetId = `${data.number}@c.us`;
      try {
        const idNumber = await wbot.getNumberId(data.number);
        if (idNumber && idNumber._serialized) {
          targetId = idNumber._serialized;
        } else {
          logger.warn(
            `SendMessageWhatsappCampaign | Contato não possui WhatsApp válido: ${data.number}`
          );
          await CampaignContacts.update(
            {
              body: "Número inválido ou sem WhatsApp",
              jobId: data.jobId,
              ack: -1
            },
            { where: { id: data.campaignContact.id } }
          );
          return null;
        }
      } catch (checkErr) {
        logger.warn(
          `SendMessageWhatsappCampaign | Falha ao consultar getNumberId para ${data.number}: ${checkErr}`
        );
      }

      if (data.mediaUrl) {
        const customPath = join(__dirname, "..", "..", "public");
        const mediaPath = join(customPath, data.mediaName);
        const newMedia = MessageMedia.fromFilePath(mediaPath);
        message = await wbot.sendMessage(targetId, newMedia, {
          sendAudioAsVoice: true,
          caption: data.message
        });
      } else {
        message = await wbot.sendMessage(targetId, data.message, {
          linkPreview: false
        });
      }

      await CampaignContacts.update(
        {
          messageId: message.id.id,
          messageRandom: data.messageRandom,
          body: data.message,
          mediaName: data.mediaName,
          timestamp: message.timestamp,
          jobId: data.jobId,
          ack: message.ack || 1
        },
        { where: { id: data.campaignContact.id } }
      );

      return message;
    } catch (error) {
      logger.error(`Error enviar message campaign: ${error}`);
      throw new Error(error);
    }
  }
};
