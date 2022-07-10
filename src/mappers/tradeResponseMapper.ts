import { format, subHours } from "date-fns";
import { TradeWithUserDTO } from "../repositories/tradeRepository";
import { TradeResponseDTO } from "../services/tradeService";

export const TradeResponseMapper = (
  tradeWithUser: TradeWithUserDTO
): TradeResponseDTO => {
  const { timestamp, ...rest } = tradeWithUser;
  const timestampEst = format(subHours(timestamp, 4), " yyyy-MM-dd HH:mm:ss");
  return { ...rest, timestamp: timestampEst };
};
