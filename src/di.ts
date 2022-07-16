import { diContainer } from "@fastify/awilix";
import { asClass, asValue } from "awilix";

import config from "./config";
import { ITradeService, TradeService } from "./services/tradeService";
import { IUserService, UserService } from "./services/userService";
import {
  ITradeRepository,
  TradeRepository,
} from "./repositories/tradeRepository";
import { IRoutesProvider, TradeRoutes } from "./routes/tradeRoutes";
import { IUserRepository, UserRepository } from "./repositories/userRepository";
import { Server } from "./server";
// eslint-disable-next-line no-unused-vars
import { initDb } from "./db";
// import { Knex } from "knex";

declare module "@fastify/awilix" {
  interface Cradle {
    config: object;
    server: Server;
    tradeRoutes: IRoutesProvider;
    tradeService: ITradeService;
    userService: IUserService;
    tradeRepository: ITradeRepository;
    // userService: IUserService;
    userRepository: IUserRepository;
  }
}

initDb();

export function di() {
  return diContainer.register({
    config: asValue(config),
    server: asClass(Server).singleton().proxy(),
    tradeRoutes: asClass(TradeRoutes).singleton().proxy(),
    tradeService: asClass(TradeService).singleton().proxy(),
    userService: asClass(UserService).singleton().proxy(),
    tradeRepository: asClass(TradeRepository).singleton().proxy(),
    userRepository: asClass(UserRepository).singleton().proxy(),
  });
}
