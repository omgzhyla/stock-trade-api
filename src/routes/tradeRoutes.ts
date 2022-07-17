import { RouteOptions } from "fastify";
import { ITradeService, TradePayloadDTO } from "../services/tradeService";
import { IUserService } from "../services/userService";
import { MarginalStockPricesMapper } from "../mappers/marginalStockPricesMapper";

export interface IRoutesProvider {
  get(): Array<RouteOptions>;
}

export class TradeRoutes implements IRoutesProvider {
  private tradeService: ITradeService;
  private userService: IUserService;
  constructor({
    tradeService,
    userService,
  }: {
    tradeService: ITradeService;
    userService: IUserService;
  }) {
    this.tradeService = tradeService;
    this.userService = userService;
  }
  get(): Array<RouteOptions> {
    return [
      this.addNewRouteOptions(),
      this.eraseAllTradesRouteOptions(),
      this.getAllTradesRouteOptions(),
      this.getTradesByUserIdRouteOptions(),
      this.getMarginalStockPricesRouteOptions(),
      this.getStockStatsRouteOptions(),
    ];
  }
  private addNewRouteOptions(): RouteOptions {
    return {
      method: "POST",
      url: "/trades",
      handler: async (request, reply) => {
        const tradePayload = request.body;
        await this.tradeService.addNew(
          tradePayload as unknown as TradePayloadDTO
        );
        reply.code(201).send();
      },
      schema: {
        body: {
          $ref: "api-schema#/definitions/trade",
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
      schema: {
        response: {
          "2xx": {
            type: "array",
            items: {
              $ref: "api-schema#/definitions/trade",
            },
          },
        },
      },
    };
  }
  private getTradesByUserIdRouteOptions(): RouteOptions {
    return {
      method: "GET",
      url: "/trades/users/:userId",
      handler: async (request, reply) => {
        const { userId } = request.params as { userId: number };
        await this.userService.checkIfExists(userId);
        reply.code(200);
        return this.tradeService.getByUserId(userId);
      },
      schema: {
        params: {
          type: "object",
          properties: {
            userId: { type: "number" },
          },
          required: ["userId"],
        },
        response: {
          "2xx": {
            type: "array",
            items: {
              $ref: "api-schema#/definitions/trade",
            },
          },
        },
      },
    };
  }
  private getMarginalStockPricesRouteOptions(): RouteOptions {
    return {
      method: "GET",
      url: "/stocks/:stockSymbol/price",
      handler: async (request, reply) => {
        const { stockSymbol } = request.params as { stockSymbol: string };
        const { start, end } = request.query as { start: string; end: string };
        reply.code(200);
        const prices = await this.tradeService.getMarginalStockPrices(
          stockSymbol,
          start,
          end
        );
        return MarginalStockPricesMapper(stockSymbol, prices);
      },
      schema: {
        params: {
          type: "object",
          properties: {
            stockSymbol: {
              type: "string",
              minLength: 1,
            },
          },
          required: ["stockSymbol"],
        },
        querystring: {
          type: "object",
          properties: {
            start: {
              type: "string",
              format: "date",
            },
            end: {
              type: "string",
              format: "date",
            },
          },
          required: ["start", "end"],
        },
        response: {
          "2xx": {
            type: "object",
            properties: {
              symbol: {
                type: "string",
              },
              highest: {
                type: "number",
              },
              lowest: {
                type: "number",
              },
            },
          },
        },
      },
    };
  }
  private getStockStatsRouteOptions(): RouteOptions {
    return {
      method: "GET",
      url: "/stocks/stats",
      handler: async (request, reply) => {
        const { start, end } = request.query as { start: string; end: string };
        reply.code(200);
        return this.tradeService.getStockStats(start, end);
      },
      schema: {
        querystring: {
          type: "object",
          properties: {
            start: {
              type: "string",
              format: "date",
            },
            end: {
              type: "string",
              format: "date",
            },
          },
          required: ["start", "end"],
        },
      },
    };
  }
}
