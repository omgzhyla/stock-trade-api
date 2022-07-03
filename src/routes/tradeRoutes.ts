import { Trade } from "../repositories/tradeRepository";
import { User } from "../repositories/userRepository";
// import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import { RouteOptions } from "fastify";
import { ITradeService } from "../services/tradeService";

export type TradePayload = Omit<Trade, "user_id>"> & { user: User };
// type Request = FastifyRequest;
// type Reply = FastifyReply;
// type AddTradeRequest = FastifyRequest<{
//   Body: TradePayload;
// }>;

export interface ITradeRoutes {
  // deleteAllTrades(_req: Request, _res: Response): void;
  // getDeleteAllTradesRouteOptions(): RouteOptions;
  getAddNewRouteOptions(): RouteOptions;
  // addNew(_req: Request, _res: Response): void;
  // getTrades(_req: Request, _res: Response): void;
  // getStocks(_req: Request, _res: Response): void;
  // getStockStats(_req: Request, _res: Response): void;
}

export interface IRoutesProvider {
  get(): Array<RouteOptions>;
}

export class TradeRoutes implements IRoutesProvider {
  private tradeService: ITradeService;
  constructor({ tradeService }: { tradeService: ITradeService }) {
    this.tradeService = tradeService;
  }
  get(): Array<RouteOptions> {
    return [this.getAddNewRouteOptions()];
  }

  getAddNewRouteOptions(): RouteOptions {
    return {
      method: "POST",
      url: "/trades",
      handler: async (request, reply) => {
        const tradePayload = request.body as unknown as TradePayload;
        await this.tradeService.addNew(tradePayload as unknown as TradePayload);
        reply.code(201).send();
      },
      schema: {
        body: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
            type: {
              type: "string",
              enum: ["buy", "sell"],
            },
            user: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                },
                name: {
                  type: "string",
                },
              },
              required: ["id", "name"],
            },
            symbol: {
              type: "string",
            },
            shares: {
              type: "integer",
              minimum: 10,
              maximum: 30,
            },
            price: {
              type: "number",
              minimum: 130.42,
              maximum: 195.65,
            },
            timestamp: {
              type: "string",
            },
          },
          required: [
            "id",
            "type",
            "user",
            "symbol",
            "shares",
            "price",
            "timestamp",
          ],
        },
      },
    };
  }
}
