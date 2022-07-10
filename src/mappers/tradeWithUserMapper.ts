import { TradeWithUserDTO } from "../repositories/tradeRepository";
import { TradeModel } from "../db/models/tradeModel";

export const TradeWithUserMapper = (row: TradeModel): TradeWithUserDTO => {
  const { userId, name, ...trade } = row as any;
  trade.user = { id: userId, name: name };
  return trade;
};
