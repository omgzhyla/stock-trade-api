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

export type StockPricesMinMaxDTO = [number, number];
//   highest: number;
//   lowest: number;
//   symbol: string;
// };

export type MarginalStockPricesResponseDTO = {
  highest: TradeDTO["price"];
  lowest: TradeDTO["price"];
  symbol: TradeDTO["symbol"];
};

export type StockStatsDTO = {
  stock: TradeDTO["symbol"];
  fluctuations: number;
  max_rise: TradeDTO["price"];
  max_fall: TradeDTO["price"];
};

export type NoTradesDTO = {
  stock: TradeDTO["symbol"];
  message: string;
};

export type StockStatsResponseDTO = Array<StockStatsDTO | NoTradesDTO>;

export interface ITradeService {
  addNew(_trade: TradePayloadDTO): void;
  eraseAll(): void;
  getAll(): Promise<TradeResponseDTO[]>;
  getByUserId(_userId: UserDTO["id"]): Promise<TradeResponseDTO[]>;
  getMarginalStockPrices(
    _stockSymbol: TradeDTO["symbol"],
    _start: string,
    _end: string
  ): Promise<StockPricesMinMaxDTO>;
  getStockStats(_start: string, _end: string): Promise<StockStatsResponseDTO>;
}

export class NoTradesInSelectedPeriod extends Error {
  statusCode: number;
  constructor() {
    super("There are no trades in the given date range");
    this.statusCode = 200;
  }
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
  // async get(id: number): Promise<TradeDTO> {
  //   return this.tradeRepository.get(id);
  // }
  async getByUserId(userId: UserDTO["id"]): Promise<TradeResponseDTO[]> {
    const tradesWithUser = await this.tradeRepository.getByUserId(userId);
    return tradesWithUser.map((tradeWithUser) =>
      TradeResponseMapper(tradeWithUser)
    );
  }
  async getMarginalStockPrices(
    stockSymbol: TradeDTO["symbol"],
    start: string,
    end: string
  ): Promise<StockPricesMinMaxDTO> {
    await this.tradeRepository.checkStockExists(stockSymbol);
    const prices = await this.tradeRepository.getStockPricesForPeriod(
      stockSymbol,
      start,
      end
    );
    if (prices.length === 0) {
      throw new NoTradesInSelectedPeriod();
    }
    const sortedPrices = prices.sort();
    return [sortedPrices[0], sortedPrices[sortedPrices.length - 1]];
  }
  async getStockStats(
    start: string,
    end: string
  ): Promise<StockStatsResponseDTO> {
    const stocks = await this.tradeRepository.getStocks();
    return Promise.all(
      stocks.map(async (stockSymbol): Promise<StockStatsDTO | NoTradesDTO > => {
        const prices = await this.tradeRepository.getStockPricesForPeriod(
          stockSymbol,
          start,
          end
        );
        if (prices.length) {
          const stockStats = this.findFluctuations(prices);
          return {
            stock: stockSymbol,
            fluctuations: stockStats.fluctuations,
            max_rise: stockStats.max_rise,
            max_fall: stockStats.max_fall,
          };
        }
        return {
          stock: stockSymbol,
          message: "There are no trades in the given date range",
        };
      })
    );
  }

  private findFluctuations(prices: number[]): {
    fluctuations: number;
    max_rise: number;
    max_fall: number;
  } {
    if (prices.length >= 3) {
      let previousPrice = prices[0];
      let max_fall = 0;
      let max_rise = 0;
      const fluctuations = new Array<number>();

      for (let i = 1; i < prices.length - 1; i++) {
        const currentPrice = prices[i];
        const nextPrice = prices[i + 1];
        if (previousPrice < currentPrice && currentPrice > nextPrice) {
          fluctuations.push(currentPrice);
        }
        if (previousPrice > currentPrice && currentPrice < nextPrice) {
          fluctuations.push(currentPrice);
        }
        previousPrice = currentPrice;
      }

      if (fluctuations.length) {
        const arr = [...fluctuations, prices[prices.length - 1]];
        let prevPrice = prices[0];
        for (const currentPrice of arr) {
          const diff = currentPrice - prevPrice;
          const rise = diff > 0;
          const absDiff = Math.abs(diff);
          if (rise) {
            if (max_rise < absDiff) {
              max_rise = absDiff;
            }
          } else {
            if (max_fall < absDiff) {
              max_fall = absDiff;
            }
          }
          prevPrice = currentPrice;
        }
      }
      return {
        fluctuations: fluctuations.length,
        max_fall,
        max_rise,
      };
    } else {
      return {
        fluctuations: 0,
        max_fall: 0,
        max_rise: 0,
      };
    }
  }
}
