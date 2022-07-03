import { Trade, ITradeRepository } from "../repositories/tradeRepository";
import { IUserRepository, User } from "../repositories/userRepository";

export type TradePayload = Omit<Trade, "user_id>"> & { user: User };

export interface ITradeService {
  addNew(_trade: TradePayload): void;
  eraseAll(): void;
  getAll(): Promise<Array<Trade>>;
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
  async eraseAll() {
    await this.tradeRepository.truncate();
    await this.userRepository.truncate();
  }
  getAll(): Promise<Array<Trade>> {
    return this.tradeRepository.getAll();
  }
  async get(id: number): Promise<Trade> {
    return this.tradeRepository.get(id);
  }
}
