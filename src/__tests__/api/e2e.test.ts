import { di } from "../../di";
import { FastifyInstance } from "fastify";
import { validTradePayload } from "../payload";
import { AwilixContainer } from "awilix";
import { Cradle } from "@fastify/awilix";

describe("Adding new trades", () => {
  let instance: FastifyInstance | undefined;
  let diContainer: AwilixContainer<Cradle>;
  beforeAll(async () => {
    diContainer = di();
    instance = await diContainer.resolve("server").start();
    expect(instance).not.toBeUndefined();
  });
  afterAll(async () => {
    await diContainer.resolve("db").destroy();
    await instance!.close();
  });
  test("creates new trades with valid payload", async () => {
    expect.assertions(1);
    const response = await instance!.inject({
      method: "POST",
      url: "/trades",
      payload: validTradePayload,
    });
    expect(response.statusCode).toEqual(200);
  });
});
