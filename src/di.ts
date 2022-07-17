import { diContainer } from "@fastify/awilix";
import { asClass, asValue } from "awilix";

import config from "./config";
import {
  ITradeService,
  TradeService,
  IUserService,
  UserService,
} from "./services";
import {
  IUserRepository,
  UserRepository,
  ITradeRepository,
  TradeRepository,
} from "./repositories";
import { IRoutesProvider, TradeRoutes, StockRoutes } from "./routes";
import { Server } from "./server";
// eslint-disable-next-line no-unused-vars
import { initDb } from "./db";
import { Knex } from "knex";

declare module "@fastify/awilix" {
  interface Cradle {
    db: Knex;
    config: object;
    server: Server;
    tradeRoutes: IRoutesProvider;
    stockRoutes: IRoutesProvider;
    tradeService: ITradeService;
    userService: IUserService;
    tradeRepository: ITradeRepository;
    userRepository: IUserRepository;
  }
}

export function di() {
  return diContainer.register({
    db: asValue(initDb()),
    config: asValue(config),
    server: asClass(Server).singleton().proxy(),
    tradeRoutes: asClass(TradeRoutes).singleton().proxy(),
    stockRoutes: asClass(StockRoutes).singleton().proxy(),
    tradeService: asClass(TradeService).singleton().proxy(),
    userService: asClass(UserService).singleton().proxy(),
    tradeRepository: asClass(TradeRepository).singleton().proxy(),
    userRepository: asClass(UserRepository).singleton().proxy(),
  });
}
