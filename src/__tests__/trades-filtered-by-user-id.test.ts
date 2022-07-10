import { di } from "./di";
import { FastifyInstance } from "fastify";
import { validTradePayload } from "./payload";
import { createTrade } from "./helpers";

describe("Returning the trade records filtered by the user ID", () => {
  let instancePromise: Promise<FastifyInstance | undefined>;
  beforeAll(() => {
    instancePromise = di().resolve("server").start();
  });
  afterAll(() => {
    return instancePromise.then((instance) => {
      !!instance && instance.close();
    });
  });
  test("creates new trade with valid payload", () => {
    expect.assertions(1);
    return instancePromise.then((instance) => {
      return Promise.all([
        createTrade(instance),
        createTrade(instance, {
          ...validTradePayload,
          id: validTradePayload.id + 1,
        }),
        createTrade(instance, {
          ...validTradePayload,
          id: validTradePayload.id + 2,
        }),
        createTrade(instance, {
          ...validTradePayload,
          id: validTradePayload.id + 3,
          user: {
            ...validTradePayload.user,
            id: validTradePayload.user.id + 1,
          },
        }),
      ]);
    });
  });
  test("returns list of trades", () => {
    expect.assertions(2);
    return instancePromise.then((instance) => {
      if (!!instance) {
        return instance
          .inject({
            method: "GET",
            url: "/trades",
          })
          .then((response) => {
            expect(response.statusCode).toEqual(200);
          });
      }
    });
  });
});
