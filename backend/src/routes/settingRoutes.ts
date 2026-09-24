import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";

import * as SettingController from "../controllers/SettingController";

const settingRoutes = Router();
const upload = multer(uploadConfig);

settingRoutes.get("/settings", isAuth, SettingController.index);

// endpoint publico (sem isAuth) so pra logo, usado na tela de Login antes de autenticar
settingRoutes.get("/public-settings/logo", SettingController.publicLogo);

// routes.get("/settings/:settingKey", isAuth, SettingsController.show);

// change setting key to key in future
settingRoutes.put("/settings/:settingKey", isAuth, SettingController.update);

settingRoutes.post(
  "/settings/logo/:tipo",
  isAuth,
  upload.single("logo"),
  SettingController.uploadLogo
);

export default settingRoutes;
