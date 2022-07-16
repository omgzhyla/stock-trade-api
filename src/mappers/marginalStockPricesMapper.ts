import { TradeDTO } from "../repositories/tradeRepository";
import {
  MarginalStockPricesResponseDTO,
  StockPricesMinMaxDTO,
} from "../services/tradeService";

export const MarginalStockPricesMapper = (
  stockSymbol: TradeDTO["symbol"],
  stockPrices: StockPricesMinMaxDTO
): MarginalStockPricesResponseDTO => {
  return {
    symbol: stockSymbol,
    lowest: stockPrices[0],
    highest: stockPrices[1],
  };
};
