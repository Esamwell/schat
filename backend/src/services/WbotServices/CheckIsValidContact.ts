import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";

const CheckIsValidContact = async (
  number: string,
  tenantId: string | number
): Promise<any> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(tenantId);

  const wbot = getWbot(defaultWhatsapp.id);

  try {
    const cleanNumber = number.replace(/\D/g, "");
    const idNumber = await wbot.getNumberId(cleanNumber);
    if (!idNumber) {
      throw new AppError("invalidNumber", 400);
    }
    // Se o WhatsApp Web retornar um LID (@lid em vez de @c.us),
    // mantemos o número de telefone real digitado para não salvar o LID interno
    if (idNumber.server === "lid") {
      return {
        ...idNumber,
        user: cleanNumber,
        server: "c.us",
        _serialized: `${cleanNumber}@c.us`
      };
    }
    return idNumber;
  } catch (err: any) {
    logger.error(`CheckIsValidContact | Error: ${err}`);
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    throw new AppError("ERR_WAPP_CHECK_CONTACT");
  }
};

export default CheckIsValidContact;
