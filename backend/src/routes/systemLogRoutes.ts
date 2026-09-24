import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as SystemLogController from "../controllers/SystemLogController";

const systemLogRoutes = Router();

systemLogRoutes.get("/logs/system", isAuth, SystemLogController.getSystemLogs);
systemLogRoutes.delete("/logs/system", isAuth, SystemLogController.clearSystemLogs);

export default systemLogRoutes;
