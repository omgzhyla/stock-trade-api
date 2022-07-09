import { di } from "./di";
import { FastifyInstance } from "fastify";
import { validTradePayload } from "./payload";

describe("Get requests", () => {
  let instancePromise: Promise<FastifyInstance | undefined>;
  beforeAll(() => {
    instancePromise = di().resolve("server").start();
  });
  afterAll(() => {
    instancePromise.then((instance) => {
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
  test("returns list of trades", () => {
    expect.assertions(1);
    return instancePromise.then((instance) => {
      if (!!instance) {
        return instance
          .inject({
            method: "GET",
            url: "/trades",
            // query: Object,
            // payload: Object,
            // headers: Object,
            // cookies: Object
          })
          .then((response) => {
            expect(response.statusCode).toEqual(200);
          });
      }
    });
  });
});
