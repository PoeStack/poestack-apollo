import Client from "@axiomhq/axiom-node";
import winston from "winston";
import { WinstonTransport as AxiomTransport } from "@axiomhq/axiom-node";

export class Logger {
  static axiomTransport = new AxiomTransport({
    dataset: "test",
    token: process.env.AXIOM_TOKEN,
    orgId: "poestack-70vq",
  });

  static logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [Logger.axiomTransport],
  });

  public static init() {}

  public static info(message: string, ...meta: any[]) {
    Logger.logger.info(message, meta);
    console.log(message, ...meta);
  }

  public static error(message: string, ...meta: any[]) {
    console.error(message, ...meta);
  }

  public static debug(message: string, ...meta: any[]) {
    console.debug(message, ...meta);
  }
}
