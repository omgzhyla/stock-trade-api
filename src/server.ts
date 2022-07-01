import { fastify, FastifyInstance } from "fastify";
import { GenericConfig } from "./config";
import { fastifyAwilixPlugin } from "@fastify/awilix";

export class Server {
  private server?: FastifyInstance;

  async start() {
    this.server = fastify({ logger: true });
    await this.server.register(fastifyAwilixPlugin, {
      disposeOnClose: false,
      disposeOnResponse: false,
    });
    try {
      const config: GenericConfig = this.server.diContainer.resolve("config");
      this.server.get("/", async (_, reply) =>
        "HELLO"
      )
      this.server.get("/health", async (_, reply) =>
        reply.code(200).send()
      );
      await this.server.listen({ port: config.get("api_port") });
    } catch (e) {
      this.server.log.error(e);
    }
  }
}
