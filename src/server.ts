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
  readonly instance: FastifyInstance;
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
    this.instance = fastify({
      logger: config.logger,
      schemaController: {
        compilersFactory: {
          buildValidator: adjCompiler(),
        },
      },
      ajv: {
        customOptions: {
          formats: {
            customDateTime: {
              validate: (data: string): boolean => {
                return (
                  /^\d{4}-(?:0|1)\d-\d{2} \d{2}:\d{2}:\d{2}$/.test(data) &&
                  !!Date.parse(data)
                );
              },
              compare: (_data1: string, _data2: string): number => {
                return 0;
              },
              async: false,
            },
            customDate: {
              validate: (data: string): boolean => {
                return (
                  /^\d{4}-(?:0|1)\d-\d{2}$/.test(data) && !!Date.parse(data)
                );
              },
              compare: (_data1: string, _data2: string): number => {
                return 0;
              },
              async: false,
            },
            price: {
              validate: (data: number): boolean => {
                return /^\d{1,5}\.\d{2}$/.test(data.toString());
              },
              compare: (data1: number, data2: number): number => {
                return data1 == data2 ? 0 : data1 > data2 ? 1 : -1;
              },
              async: false,
              type: "number",
            },
          },
        },
      },
    });
  }

  private async configure() {
    await this.instance.register(fastifyAwilixPlugin, {
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
      await this.instance.route(patchedOptions);
    }
  }

  private errorHandler(
    error: Error,
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    console.log("Error: ", error);
    const replyData = errorHandler(error);
    this.instance.log.error(
      !!replyData.logMessage ? replyData.logMessage : replyData.message
    );
    reply.status(replyData.code).send({ message: replyData.message });
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

  async start(): Promise<FastifyInstance | undefined> {
    await this.configure();
    await this.setupRoutes();
    // this.setupErrorHandler();
    try {
      await this.instance.listen({ port: this.config?.port });
      return this.instance;
    } catch (e) {
      this.instance.log.error(e);
    }
  }
}
