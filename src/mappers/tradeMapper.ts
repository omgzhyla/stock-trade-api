import { TradeModel } from "../db/models/tradeModel";
import { TradeDTO } from "../repositories/tradeRepository";
// import { format, formatRFC3339 } from "date-fns";

export const TradeMapper = (tradeModel: TradeModel): TradeDTO => {
  const untypedTrade = tradeModel as any;
  return {
    id: untypedTrade.id,
    type: untypedTrade.type,
    userId: untypedTrade.userId,
    symbol: untypedTrade.symbol,
    shares: untypedTrade.shares,
    price: untypedTrade.price,
    timestamp: new Date(untypedTrade.timestamp),
  };
};
