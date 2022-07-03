import {
  fastify,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import adjCompiler from "@fastify/ajv-compiler";
import { fastifyAwilixPlugin } from "@fastify/awilix";
import { IRoutesProvider } from "./routes/tradeRoutes";
import { errorHandler } from "./errors";

// type _AddTradeRequest = FastifyRequest<{
//   Body: TradePayload;
// }>;

export class Server {
  private server: FastifyInstance;
  private config;
  private tradeRoutes;

  constructor({
    config,
    tradeRoutes,
  }: {
    config: { port: number; logger: object };
    tradeRoutes: IRoutesProvider;
  }) {
    this.config = config;
    this.tradeRoutes = tradeRoutes;
    this.server = fastify({
      logger: config.logger,
      schemaController: {
        compilersFactory: {
          buildValidator: adjCompiler(),
        },
      },
    });
  }

  private async configure() {
    await this.server.register(fastifyAwilixPlugin, {
      disposeOnClose: false,
      disposeOnResponse: false,
    });
  }

  private async setupRoutes() {
    for (const options of this.tradeRoutes.get()) {
      const patchedOptions = {
        ...options,
        errorHandler: this.errorHandler.bind(this),
      };
      await this.server.route(patchedOptions);
    }
  }

  private errorHandler(
    error: Error,
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    const replyData = errorHandler(error);
    this.server.log.error(
      !!replyData.logMessage ? replyData.logMessage : replyData.message
    );
    reply.status(replyData.code).send(replyData.message);
  }

  // Doesn't work with fastify.route() for an unknown reason
  // private setupErrorHandler() {
  //   this.server.setErrorHandler(function (error, _request, reply) {
  //     console.log("General Error Handler");
  //     const replyData = errorHandler(error);
  //     // Send error response
  //     reply.status(replyData.code).send(replyData.message);
  //   });
  // }

  async start() {
    await this.configure();
    await this.setupRoutes();
    // this.setupErrorHandler();
    try {
      await this.server.listen({ port: this.config?.port });
    } catch (e) {
      this.server.log.error(e);
    }
  }
}
