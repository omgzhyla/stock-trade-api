import { getKnexConfig } from "./src/db";

import config from "./src/config";

module.exports = { ...getKnexConfig(config) };
