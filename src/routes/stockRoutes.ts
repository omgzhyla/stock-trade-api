import { RouteOptions } from "fastify";
import { ITradeService, IUserService } from "../services";
import { MarginalStockPricesMapper } from "../mappers";
import { IRoutesProvider } from ".";

export class StockRoutes implements IRoutesProvider {
  private tradeService: ITradeService;
  constructor({
    tradeService,
  }: {
    tradeService: ITradeService;
    userService: IUserService;
  }) {
    this.tradeService = tradeService;
  }
  get(): Array<RouteOptions> {
    return [
      this.getMarginalStockPricesRouteOptions(),
      this.getStockStatsRouteOptions(),
    ];
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
