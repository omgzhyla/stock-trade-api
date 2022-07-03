import { Trade, ITradeRepository } from "../repositories/tradeRepository";
import { IUserRepository, User } from "../repositories/userRepository";

export type TradePayload = Omit<Trade, "user_id>"> & { user: User };

export interface ITradeService {
  // deleteAllTrades(_req: Request, _res: Response): void;
  // getDeleteAllTradesRouteOptions(): RouteOptions;
  addNew(_trade: TradePayload): void;
  // getTrades(_req: Request, _res: Response): void;
  // getStocks(_req: Request, _res: Response): void;
  // getStockStats(_req: Request, _res: Response): void;
}

export class TradeService implements ITradeService {
  private tradeRepository: ITradeRepository;
  private userRepository: IUserRepository;
  constructor({
    tradeRepository,
    userRepository,
  }: {
    tradeRepository: ITradeRepository;
    userRepository: IUserRepository;
  }) {
    this.tradeRepository = tradeRepository;
    this.userRepository = userRepository;
  }

  async addNew(tradePayload: TradePayload) {
    const { user, ...tradeFields } = tradePayload;
    const existingUser = await this.userRepository.createIfNotExists(user);
    if (existingUser) {
      tradeFields.userId = existingUser.id;
      await this.tradeRepository.create(tradeFields);
    }
  }
  async get(id: number): Promise<Trade> {
    return this.tradeRepository.get(id);
  }
}
