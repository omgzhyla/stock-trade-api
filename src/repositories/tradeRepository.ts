import { TradeModel } from "../db/models/tradeModel";
import { TradeMapper } from "../mappers/tradeMapper";
import { UserDTO } from "./userRepository";
import { UserModel } from "../db/models/userModel";
import { TradeWithUserMapper } from "../mappers/tradeWithUserMapper";
import { QueryBuilder } from "objection";
import { addDays, addHours } from "date-fns";

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
  get(_id: TradeDTO["id"]): Promise<TradeDTO>;
  getByUserId(_userId: UserDTO["id"]): Promise<TradeWithUserDTO[]>;
  checkStockExists(_stockSymbol: TradeDTO["symbol"]): Promise<boolean>;
  getStockPricesForPeriod(
    _stockSymbol: string,
    _start: string,
    _end: string
  ): Promise<number[]>;
  getStocks(): Promise<TradeDTO["symbol"][]>;
}

export class TradeRepository implements ITradeRepository {
  private _buildQueryWithUser(): QueryBuilder<TradeModel> {
    return TradeModel.query()
      .select(`${TradeModel.tableName}.*`)
      .select(`${UserModel.tableName}.name`)
      .joinRelated({ users: true })
      .orderBy(`${TradeModel.tableName}.${TradeModel.idColumn}`);
  }
  async getAll(): Promise<TradeWithUserDTO[]> {
    const tradesWithUsers = await this._buildQueryWithUser();
    return tradesWithUsers.map((row) => TradeWithUserMapper(row));
  }
  async getByUserId(userId: UserDTO["id"]): Promise<TradeWithUserDTO[]> {
    const tradesWithUsers = await this._buildQueryWithUser().where(
      "userId",
      "=",
      userId
    );
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
  async checkStockExists(stockSymbol: TradeDTO["symbol"]): Promise<boolean> {
    await TradeModel.query().findOne({ symbol: stockSymbol }).throwIfNotFound();
    return true;
  }
  private buildGetPricesQueryForPeriod(
    start: string,
    end: string
  ): QueryBuilder<TradeModel> {
    return TradeModel.query()
      .select("price")
      .andWhereBetween("timestamp", [start, end])
      .orderBy("timestamp");
  }
  async getStockPricesForPeriod(
    stockSymbol: string,
    start: string,
    end: string
  ): Promise<number[]> {
    const [adjStart, adjEnd] = ((start, end) => {
      return [
        addHours(new Date(start), 4).toDateString(),
        addDays(addHours(new Date(end), 4), 1).toDateString(),
      ];
    })(start, end);
    const trades = await this.buildGetPricesQueryForPeriod(
      adjStart,
      adjEnd
    ).where("symbol", "=", stockSymbol);

    return [...trades].map((trade) => {
      const { price } = trade as any;
      return price;
    });
  }
  async getStocks(): Promise<TradeDTO["symbol"][]> {
    const stocks = await TradeModel.query()
      .distinct("symbol")
      .orderBy("symbol");

    return stocks.map((stock) => {
      const { symbol } = stock as any;
      return symbol;
    });
  }
}
