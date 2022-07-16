import { Knex } from "knex";
import { TradeModel } from "../models/tradeModel";
import { UserModel } from "../models/userModel";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(UserModel.tableName, (table) => {
    table.integer("id").unsigned().unique().notNullable();
    table.string("name");
  });

  await knex.schema.createTable(TradeModel.tableName, (table) => {
    table.bigint("id").unsigned().unique().notNullable();
    table.enu("type", ["buy", "sell"], {
      useNative: true,
      enumName: "trade_type",
    });
    table
      .integer("user_id")
      .index()
      .unsigned()
      .notNullable()
      .references("id")
      .inTable(UserModel.tableName);
    table.string("symbol").index();
    table.integer("shares").unsigned().notNullable();
    table.decimal("price", 5, 2).unsigned().notNullable();
    table.timestamp("timestamp").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TradeModel.tableName);
  await knex.schema.dropTable(UserModel.tableName);
}
