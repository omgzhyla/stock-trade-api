import { diContainer } from "@fastify/awilix";
import { asClass, asFunction, Lifetime } from "awilix";

import { Config, GenericConfig } from "./config";

diContainer.register({
  config: asClass(Config, {
    lifetime: Lifetime.SINGLETON,
  }),
});
