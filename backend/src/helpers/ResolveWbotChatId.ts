import { Client as Session } from "whatsapp-web.js";
import { logger } from "../utils/logger";

const ResolveWbotChatId = async (
  wbot: Session,
  number: string,
  isGroup = false
): Promise<string> => {
  if (isGroup) {
    return `${number}@g.us`;
  }

  const cleanNum = String(number || "").replace(/\D/g, "");
  const defaultChatId = `${cleanNum}@c.us`;

  if (!cleanNum) {
    return defaultChatId;
  }

  try {
    // 1. Tenta com o número informado
    let numberId = await wbot.getNumberId(cleanNum);

    // 2. Se não encontrou e for Brasil (55), testa variantes do 9º dígito
    if (!numberId && cleanNum.startsWith("55")) {
      if (cleanNum.length === 12) {
        // Ex: 55 71 86541928 -> inserir 9 -> 55 71 9 86541928
        const withNine = `${cleanNum.slice(0, 4)}9${cleanNum.slice(4)}`;
        numberId = await wbot.getNumberId(withNine);
      } else if (cleanNum.length === 13 && cleanNum.charAt(4) === "9") {
        // Ex: 55 71 9 86541928 -> remover 9 -> 55 71 86541928
        const withoutNine = `${cleanNum.slice(0, 4)}${cleanNum.slice(5)}`;
        numberId = await wbot.getNumberId(withoutNine);
      }
    }

    if (numberId && numberId._serialized) {
      logger.info(`ResolveWbotChatId: ${cleanNum} -> ${numberId._serialized}`);
      return numberId._serialized;
    }
  } catch (err) {
    logger.warn(`ResolveWbotChatId: error resolving ${cleanNum}: ${err}`);
  }

  return defaultChatId;
};

export default ResolveWbotChatId;
