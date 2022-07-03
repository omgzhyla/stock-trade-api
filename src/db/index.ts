import knex from "knex";
import { knexSnakeCaseMappers, Model } from "objection";
import config from "../config";

export function initDb() {
  const db = knex({
    pool: {
      min: 2,
      max: 10,
    },
    client: "pg",
    connection: config.dbUrl,
    debug: config.logger.level === "debug",
    ...knexSnakeCaseMappers(),
  });
  Model.knex(db);
}
