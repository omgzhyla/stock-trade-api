import { di } from "../../di";
import { FastifyInstance } from "fastify";
import { AwilixContainer } from "awilix";
import { Cradle } from "@fastify/awilix";
import trades from "../payload/post-trades.json";
import tradesByDavid from "../payload/get-trades-user.json";
import stockPrice from "../payload/stock-price.json";
import stockStats from "../payload/stock-stats.json";
import stockStats2 from "../payload/stock-stats-2.json";

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
    expect.assertions(trades.length + 1);
    for (const trade of trades) {
      const response = await instance!.inject({
        method: "POST",
        url: "/trades",
        payload: trade,
      });
      expect(response.statusCode).toEqual(201);
    }
  });
  test("gets all trades", async () => {
    expect.assertions(1);
    const response = await instance!.inject({
      method: "GET",
      url: "/trades",
    });
    expect(response.statusCode).toEqual(200);
  });
  test("gets trades for user", async () => {
    expect.assertions(2);
    const response = await instance!.inject({
      method: "GET",
      url: "/trades/users/1",
    });
    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual(tradesByDavid);
  });
  test("get stock price for a period", async () => {
    expect.assertions(2);
    const response = await instance!.inject({
      method: "GET",
      url: "/stocks/ACC/price?start=2014-06-25&end=2014-06-26",
    });
    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual(stockPrice);
  });
  test("get stock stats", async () => {
    expect.assertions(2);
    const response = await instance!.inject({
      method: "GET",
      url: "/stocks/stats?start=2014-06-14&end=2014-06-26",
    });
    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual(stockStats);
  });
  test("get stock stats 2", async () => {
    expect.assertions(2);
    const response = await instance!.inject({
      method: "GET",
      url: "/stocks/stats?start=2014-06-14&end=2014-06-27",
    });
    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual(stockStats2);
  });
  test("erases all trades", async () => {
    expect.assertions(1);
    const response = await instance!.inject({
      method: "DELETE",
      url: "/trades",
    });
    expect(response.statusCode).toEqual(200);
  });
  test("trades list is empty after erase", async () => {
    expect.assertions(2);
    const response = await instance!.inject({
      method: "GET",
      url: "/trades",
    });
    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual([]);
  });
});
