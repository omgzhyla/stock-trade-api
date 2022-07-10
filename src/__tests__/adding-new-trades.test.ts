import { di } from "./di";
import { FastifyInstance } from "fastify";
import { validTradePayload } from "./payload";

describe("Adding new trades", () => {
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
      if (!!instance) {
        return instance
          .inject({
            method: "POST",
            url: "/trades",
            payload: validTradePayload,
          })
          .then((response) => {
            expect(response.statusCode).toEqual(201);
          });
      }
    });
  });
  test.each([
    { ...validTradePayload, type: "exchange" },
    { ...validTradePayload, shares: 9 },
    { ...validTradePayload, shares: 31 },
    { ...validTradePayload, price: 130.41 },
    { ...validTradePayload, price: 195.641 },
    { ...validTradePayload, price: 195.651 },
    { ...validTradePayload, timestamp: "01-22-2022 13:01:01" },
    { ...validTradePayload, timestamp: "2022-13-31 13:01:01" },
  ])("fails to create new trade with invalid payload %j", (invalidPayload) => {
    expect.assertions(1);
    return instancePromise.then((instance) => {
      if (!!instance) {
        return instance
          .inject({
            method: "POST",
            url: "/trades",
            payload: invalidPayload,
          })
          .then((response) => {
            expect(response.statusCode).toEqual(400);
          });
      }
    });
  });
});
