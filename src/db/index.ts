import knex from "knex";
import { knexSnakeCaseMappers, Model } from "objection";
import config from "../config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getKnexConfig = (config: any) => ({
  pool: {
    min: 2,
    max: 10,
  },
  client: "pg",
  connection: config.dbUrl,
  migrations: {
    tableName: "knex_migrations",
    directory: "./src/db/migrations",
  },
  debug: config.isDev,
  ...knexSnakeCaseMappers(),
});

export function initDb() {
  const db = knex(getKnexConfig(config));
  Model.knex(db);
  return db;
}
