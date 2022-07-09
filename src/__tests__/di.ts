import { diContainer } from "@fastify/awilix";
import { asClass, asValue } from "awilix";

import config from "../config";
import { ITradeService, TradeService } from "../services/tradeService";
import { ITradeRepository, Trade } from "../repositories/tradeRepository";
import { IRoutesProvider, TradeRoutes } from "../routes/tradeRoutes";
import { IUserRepository, User } from "../repositories/userRepository";
import { Server } from "../server";
import { NotFoundError } from "objection";

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

class TradeRepository implements ITradeRepository {
  trades: Map<number, Trade>;
  userRepository: IUserRepository;
  constructor({ userRepository }: { userRepository: IUserRepository }) {
    this.userRepository = userRepository;
    this.trades = new Map<number, Trade>();
  }
  create(trade: Trade): Promise<boolean> {
    this.trades.set(trade.id, trade);
    return Promise.resolve(true);
  }
  get(id: number): Promise<Trade> {
    const trade = this.trades.get(id);
    if (!!trade) {
      throw new NotFoundError({ statusCode: 404 });
    }
    return Promise.resolve(trade!);
  }
  getAll(_cursor?: number): Promise<Array<Trade>> {
    return Promise.resolve([...this.trades.values()]);
  }
  truncate(): Promise<void> {
    this.trades.clear();
    return Promise.resolve(undefined);
  }
}

class UserRepository implements IUserRepository {
  users: Map<number, User>;
  constructor() {
    this.users = new Map<number, User>();
  }
  createIfNotExists(user: User): Promise<User | null> {
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }
  get(id: number): Promise<User | null> {
    return Promise.resolve(this.users.get(id) || null);
  }
  truncate(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export function di() {
  return diContainer.register({
    config: asValue(config),
    server: asClass(Server).singleton().proxy(),
    tradeRoutes: asClass(TradeRoutes).singleton().proxy(),
    tradeService: asClass(TradeService).singleton().proxy(),
    tradeRepository: asClass(TradeRepository).singleton().proxy(),
    userRepository: asClass(UserRepository).singleton().proxy(),
  });
}
