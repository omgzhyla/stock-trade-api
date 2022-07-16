import { getKnexConfig } from ".";
import config from "../config";

module.exports = { ...getKnexConfig(config) };
