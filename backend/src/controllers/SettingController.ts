import { Request, Response } from "express";
import { Op } from "sequelize";

import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import Setting from "../models/Setting";
import Tenant from "../models/Tenant";

import UpdateSettingService from "../services/SettingServices/UpdateSettingService";
import ListSettingsService from "../services/SettingServices/ListSettingsService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  // if (req.user.profile !== "admin") {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }
  const { tenantId } = req.user;

  const settings = await ListSettingsService(tenantId);

  return res.status(200).json(settings);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tenantId } = req.user;
  // const { settingKey: key } = req.params;
  const { value, key } = req.body;

  const setting = await UpdateSettingService({
    key,
    value,
    tenantId
  });

  const io = getIO();
  io.emit(`${tenantId}:settings`, {
    action: "update",
    setting
  });

  return res.status(200).json(setting);
};

// Endpoint publico (sem isAuth) - usado na tela de Login, antes de autenticar.
// So retorna as duas chaves de logo, nada de sensivel. Como o login ainda nao
// tem tenantId (sem token), usamos o primeiro tenant cadastrado.
export const publicLogo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tenant = await Tenant.findOne({ order: [["id", "ASC"]] });
  if (!tenant) {
    return res.status(200).json({ logoLightUrl: null, logoDarkUrl: null });
  }

  const settings = await Setting.findAll({
    where: {
      tenantId: tenant.id,
      key: { [Op.in]: ["logoLightUrl", "logoDarkUrl"] }
    }
  });

  const logoLightUrl =
    settings.find(s => s.key === "logoLightUrl")?.value || null;
  const logoDarkUrl =
    settings.find(s => s.key === "logoDarkUrl")?.value || null;

  return res.status(200).json({ logoLightUrl, logoDarkUrl });
};

export const uploadLogo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tipo } = req.params;
  if (!["light", "dark"].includes(tipo)) {
    throw new AppError("ERR_INVALID_LOGO_TYPE", 400);
  }
  if (!req.file) {
    throw new AppError("ERR_NO_LOGO_FILE", 400);
  }

  const { tenantId } = req.user;
  const key = tipo === "dark" ? "logoDarkUrl" : "logoLightUrl";
  const value = `/public/${req.file.filename}`;

  const setting = await UpdateSettingService({
    key,
    value,
    tenantId
  });

  const io = getIO();
  io.emit(`${tenantId}:settings`, {
    action: "update",
    setting
  });

  return res.status(200).json(setting);
};
