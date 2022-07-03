import { TradeModel } from "../db/models/tradeModel";
import { Trade } from "../repositories/tradeRepository";
// import { format, formatRFC3339 } from "date-fns";

export const TradeMapper = (tradeModel: TradeModel): Trade => {
  const untypedTrade = tradeModel as any;
  return {
    id: untypedTrade.id,
    type: untypedTrade.type,
    userId: untypedTrade.userId,
    stockSymbol: untypedTrade.stockSymbol,
    shares: untypedTrade.stockSymbol,
    price: untypedTrade.price,
    timestamp: new Date(untypedTrade.ts),
  };
};
