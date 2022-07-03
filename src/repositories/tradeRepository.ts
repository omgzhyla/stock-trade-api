import { TradeModel } from "../db/models/tradeModel";
import { TradeMapper } from "../mappers/tradeMapper";
// import { ForeignKeyViolationError } from "objection";

export type TradeType = "buy" | "sell";

export type Trade = {
  id: number;
  type: TradeType;
  userId: number;
  stockSymbol: string;
  shares: number;
  price: number;
  timestamp: Date;
};

export interface ITradeRepository {
  create(_trade: Trade): Promise<boolean>;
  get(_id: number): Promise<Trade>;
}

export class TradeRepository implements ITradeRepository {
  async create(trade: Trade) {
    await TradeModel.query().insert({ ...trade });
    return true;
  }
  async get(id: number): Promise<Trade> {
    const result = await TradeModel.query().findById(id).throwIfNotFound();
    return TradeMapper(result);
  }
}
