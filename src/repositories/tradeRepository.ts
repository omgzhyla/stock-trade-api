import { TradeModel } from "../db/models/tradeModel";
import { TradeMapper } from "../mappers/tradeMapper";
import { UserDTO } from "./userRepository";
import { UserModel } from "../db/models/userModel";
import { TradeWithUserMapper } from "../mappers/tradeWithUserMapper";
import { QueryBuilder } from "objection";
// import { ForeignKeyViolationError } from "objection";

export type TradeType = "buy" | "sell";

export type TradeDTO = {
  id: number;
  type: TradeType;
  userId: number;
  symbol: string;
  shares: number;
  price: number;
  timestamp: Date;
};

export type TradeWithUserDTO = Omit<TradeDTO, "user_id>"> & { user: UserDTO };

export interface ITradeRepository {
  create(_trade: TradeDTO): Promise<boolean>;
  truncate(): Promise<void>;
  getAll(): Promise<TradeWithUserDTO[]>;
  get(_id: number): Promise<TradeDTO>;
}

export class TradeRepository implements ITradeRepository {
  private _buildQuery(): QueryBuilder<TradeModel> {
    return TradeModel.query()
      .select(`${TradeModel.tableName}.*`)
      .select(`${UserModel.tableName}.name`)
      .joinRelated({ users: true })
      .orderBy(`${TradeModel.tableName}.${TradeModel.idColumn}`);
  }
  async getAll(): Promise<TradeWithUserDTO[]> {
    const tradesWithUsers = await this._buildQuery();
    return tradesWithUsers.map((row) => TradeWithUserMapper(row));
  }
  async create(trade: TradeDTO) {
    await TradeModel.query().insert({ ...trade });
    return true;
  }
  async truncate(): Promise<void> {
    await TradeModel.query().truncate();
  }
  async get(id: number): Promise<TradeDTO> {
    const result = await TradeModel.query().findById(id).throwIfNotFound();
    return TradeMapper(result);
  }
}
