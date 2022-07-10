import { TradeDTO, ITradeRepository } from "../repositories/tradeRepository";
import { IUserRepository, UserDTO } from "../repositories/userRepository";
import { TradePayloadMapper } from "../mappers/tradePayloadMapper";
import { TradeResponseMapper } from "../mappers/tradeResponseMapper";

export type TradePayloadDTO = Omit<TradeDTO, "user_id" | "timestamp"> & {
  user: UserDTO;
} & {
  timestamp: string;
};
export type TradeResponseDTO = TradePayloadDTO;

export interface ITradeService {
  addNew(_trade: TradePayloadDTO): void;
  eraseAll(): void;
  getAll(): Promise<TradeResponseDTO[]>;
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
  async addNew(tradePayload: TradePayloadDTO) {
    const { user, ...tradeFields } = TradePayloadMapper(tradePayload);
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
  async getAll(): Promise<TradeResponseDTO[]> {
    const tradesWithUser = await this.tradeRepository.getAll();
    return tradesWithUser.map((tradeWithUser) =>
      TradeResponseMapper(tradeWithUser)
    );
  }
  async get(id: number): Promise<TradeDTO> {
    return this.tradeRepository.get(id);
  }
}
