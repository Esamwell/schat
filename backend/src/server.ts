process.on("unhandledRejection", (err) => { console.error("UNHANDLED REJECTION (não fatal):", err); });
process.on("uncaughtException", (err) => { console.error("UNCAUGHT EXCEPTION (não fatal):", err); });
import __init from "./app";
import { logger } from "./utils/logger";

__init().then((app: any) => {
  app.start().catch((err: any) => logger.error("START ERROR: ", err));
  logger.info("Started system!!");
});
