import { diContainer } from "@fastify/awilix";
import { asClass, asFunction, asValue } from "awilix";

import config from "../config";
import { ITradeService, TradeService } from "../services/tradeService";
import {
  ITradeRepository,
  TradeDTO,
  TradeWithUserDTO,
} from "../repositories/tradeRepository";
import { IRoutesProvider, TradeRoutes } from "../routes/tradeRoutes";
import { IUserRepository, UserDTO } from "../repositories/userRepository";
import { Server } from "../server";
import { NotFoundError } from "objection";
import { TradeWithUserMapper } from "../mappers/tradeWithUserMapper";
import { TradeModel } from "../db/models/tradeModel";

/* eslint-disable no-unused-vars */
declare module "@fastify/awilix" {
  interface Cradle {
    config: object;
    server: Server;
    tradeRoutes: IRoutesProvider;
    tradeService: ITradeService;
    tradeRepository: ITradeRepository;
    userRepository: IUserRepository;
  }
}
/* eslint-enable no-unused-vars */

const trades = new Map<number, TradeDTO>();

const TradeRepository: ITradeRepository = {
  create: jest.fn((trade: TradeDTO): Promise<boolean> => {
    trades.set(trade.id, trade);
    return Promise.resolve(true);
  }),
  get: jest.fn((id: number): Promise<TradeDTO> => {
    const trade = trades.get(id);
    if (!!trade) {
      throw new NotFoundError({ statusCode: 404 });
    }
    return Promise.resolve(trade!);
  }),
  getAll: jest.fn((): Promise<TradeWithUserDTO[]> => {
    return Promise.resolve(
      [...trades.values()].map((trade) => {
        return TradeWithUserMapper({
          ...trade,
          userId: 1,
          name: "Test",
        } as unknown as TradeModel);
      })
    );
  }),
  truncate: jest.fn((): Promise<void> => {
    trades.clear();
    return Promise.resolve(undefined);
  }),
};

const users = new Map<number, UserDTO>();

const UserRepository: IUserRepository = {
  createIfNotExists: jest.fn((user: UserDTO): Promise<UserDTO | null> => {
    users.set(user.id, user);
    return Promise.resolve(user);
  }),
  get: jest.fn((id: number): Promise<UserDTO | null> => {
    return Promise.resolve(users.get(id) || null);
  }),
  truncate: jest.fn((): Promise<void> => {
    return Promise.resolve(undefined);
  }),
  getAll: jest.fn((): Promise<UserDTO[]> => Promise.resolve([])),
};

export function di() {
  return diContainer.register({
    config: asValue(config),
    server: asClass(Server).singleton().proxy(),
    tradeRoutes: asClass(TradeRoutes).singleton().proxy(),
    tradeService: asClass(TradeService).singleton().proxy(),
    tradeRepository: asFunction(() => TradeRepository)
      .singleton()
      .proxy(),
    userRepository: asFunction(() => UserRepository)
      .singleton()
      .proxy(),
  });
}
