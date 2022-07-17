import { config } from "dotenv";

config({
  path: process.env.DOTENV_CONFIG_PATH,
});

const required: string[] = ["NODE_ENV", "PORT", "DATABASE_URL"];

required.forEach((variable) => {
  if (!(variable in process.env)) {
    throw new Error(`Variable ${variable} not found in the environment!`);
  }
});

export default {
  env: process.env.NODE_ENV,
  port: parseInt(`${process.env.PORT}`, 10),
  isDev: process.env.NODE_ENV === "development",
  dbUrl: String(process.env.DATABASE_URL),
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
};
