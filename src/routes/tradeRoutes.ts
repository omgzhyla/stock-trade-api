import { RouteOptions } from "fastify";
import { ITradeService, TradePayloadDTO, IUserService } from "../services";
import { IRoutesProvider } from ".";

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
}
