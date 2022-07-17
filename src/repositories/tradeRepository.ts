import { TradeModel, UserModel } from "../db/models";
import { TradeMapper, TradeWithUserMapper } from "../mappers";
import { UserDTO } from ".";
import { QueryBuilder } from "objection";

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
    const trades = await this.buildGetPricesQueryForPeriod(start, end).where(
      "symbol",
      "=",
      stockSymbol
    );

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
