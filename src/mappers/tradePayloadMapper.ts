import { addHours } from "date-fns";
import { TradePayloadDTO } from "../services/tradeService";
import { TradeWithUserDTO } from "../repositories/tradeRepository";

export const TradePayloadMapper = (
  tradePayload: TradePayloadDTO
): TradeWithUserDTO => {
  const { timestamp, ...rest } = tradePayload;
  const timestampUtc = addHours(new Date(timestamp), 4);
  return { ...rest, timestamp: timestampUtc };
};
