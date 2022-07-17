import { RouteOptions } from "fastify";
export * from "./tradeRoutes";
export * from "./stockRoutes";
export interface IRoutesProvider {
  get(): Array<RouteOptions>;
}
