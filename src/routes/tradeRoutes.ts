import { Trade } from "../repositories/tradeRepository";
import { User } from "../repositories/userRepository";
import { RouteOptions } from "fastify";
import { ITradeService } from "../services/tradeService";

export type TradePayload = Omit<Trade, "user_id>"> & { user: User };

export interface IRoutesProvider {
  get(): Array<RouteOptions>;
}

export class TradeRoutes implements IRoutesProvider {
  private tradeService: ITradeService;
  constructor({ tradeService }: { tradeService: ITradeService }) {
    this.tradeService = tradeService;
  }
  get(): Array<RouteOptions> {
    return [
      this.addNewRouteOptions(),
      this.eraseAllTradesRouteOptions(),
      this.getAllTradesRouteOptions(),
    ];
  }
  private addNewRouteOptions(): RouteOptions {
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
              format: "price",
              minimum: 130.42,
              maximum: 195.65,
            },
            timestamp: {
              type: "string",
              format: "customDateTime",
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
  private eraseAllTradesRouteOptions(): RouteOptions {
    return {
      method: "DELETE",
      url: "/trades",
      handler: async (_request, reply) => {
        await this.tradeService.eraseAll();
        reply.code(200).send();
      },
    };
  }
  private getAllTradesRouteOptions(): RouteOptions {
    return {
      method: "GET",
      url: "/trades",
      handler: async (_request, reply) => {
        reply.code(200);
        return this.tradeService.getAll();
      },
    };
  }
}
