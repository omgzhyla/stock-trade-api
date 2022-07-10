import { validTradePayload } from "./payload";
import { FastifyInstance } from "fastify";

export const createTrade = async (
  instance: FastifyInstance | undefined,
  altPayload?: typeof validTradePayload
): Promise<unknown> => {
  const payload = altPayload ?? validTradePayload;
  if (!!instance) {
    return instance
      .inject({
        method: "POST",
        url: "/trades",
        payload: payload,
      })
      .then((response) => {
        expect(response.statusCode).toEqual(201);
      });
  }
};
