import { Request, Response } from "express";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export const getSystemLogs = async (req: Request, res: Response): Promise<Response> => {
  const logFile = path.join(__dirname, "..", "..", "logs", "app.logg");
  
  if (!fs.existsSync(logFile)) {
    return res.status(200).json({ logs: "Nenhum log de sistema encontrado." });
  }

  // Lendo as últimas 1000 linhas para não travar o frontend
  exec(`tail -n 1000 ${logFile}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: "Erro ao ler os logs." });
    }
    
    // O arquivo está em JSONL (JSON Lines) pelo Winston. Vamos converter para texto legível.
    const logs = stdout.split("\n").filter((line) => line.trim() !== "");
    let formattedLogs = "";
    
    logs.forEach(line => {
      try {
        const parsed = JSON.parse(line);
        const date = parsed.timestamp ? new Date(parsed.timestamp).toLocaleString("pt-BR") : "";
        formattedLogs += `[${date}] [${parsed.level ? parsed.level.toUpperCase() : "INFO"}] ${parsed.message}\n`;
        if (parsed.stack) {
          formattedLogs += `${parsed.stack}\n`;
        }
      } catch (e) {
        formattedLogs += `${line}\n`;
      }
    });

    return res.status(200).json({ logs: formattedLogs });
  });
};

export const clearSystemLogs = async (req: Request, res: Response): Promise<Response> => {
  const logFile = path.join(__dirname, "..", "..", "logs", "app.logg");
  
  if (fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, ""); // Zera o arquivo
  }
  
  return res.status(200).json({ message: "Logs limpos com sucesso." });
};
