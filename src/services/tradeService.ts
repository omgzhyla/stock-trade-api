import {
  TradeDTO,
  UserDTO,
  ITradeRepository,
  IUserRepository,
} from "../repositories";
import { TradePayloadMapper, TradeResponseMapper } from "../mappers";
import { Money, Currencies } from "ts-money";

export type TradePayloadDTO = Omit<TradeDTO, "user_id" | "timestamp"> & {
  user: UserDTO;
} & {
  timestamp: string;
};
export type TradeResponseDTO = TradePayloadDTO;

export type StockPricesMinMaxDTO = [number, number];

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
      stocks.map(async (stockSymbol): Promise<StockStatsDTO | NoTradesDTO> => {
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
      let maxFall = new Money(0, Currencies.USD);
      let maxRise = new Money(0, Currencies.USD);
      const fluctuations = new Array<number>();

      for (let i = 1; i < prices.length; i++) {
        const previousPrice = Money.fromDecimal(prices[i - 1], Currencies.USD);
        const currentPrice = Money.fromDecimal(prices[i], Currencies.USD);
        const nextPrice =
          i < prices.length - 1
            ? Money.fromDecimal(prices[i + 1], Currencies.USD)
            : currentPrice;
        const diff = currentPrice.subtract(previousPrice);
        const absDiff = diff.isNegative() ? diff.multiply(-1) : diff;
        if (diff.isPositive()) {
          if (absDiff.greaterThan(maxRise)) {
            maxRise = absDiff;
          }
          if (currentPrice.greaterThan(nextPrice)) {
            fluctuations.push(currentPrice.toDecimal());
          }
        }
        if (diff.isNegative()) {
          if (absDiff.greaterThan(maxFall)) {
            maxFall = absDiff;
          }
          if (currentPrice.lessThan(nextPrice)) {
            fluctuations.push(currentPrice.toDecimal());
          }
        }
      }

      return {
        fluctuations: fluctuations.length,
        max_fall: maxFall.toDecimal(),
        max_rise: maxRise.toDecimal(),
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
