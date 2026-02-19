import { readFileSync } from "fs";
import path from "path";

import yaml from "js-yaml";

import checkAndCopyConfig, { CONF_DIR, substituteEnvironmentVars } from "utils/config/config";

export function getAmpConfig() {
  checkAndCopyConfig("ampInstance.yaml");
  const configFile = path.join(CONF_DIR, "ampInstance.yaml");
  const rawConfigData = readFileSync(configFile, "utf8");
  const configData = substituteEnvironmentVars(rawConfigData);
  return yaml.load(configData);
}
