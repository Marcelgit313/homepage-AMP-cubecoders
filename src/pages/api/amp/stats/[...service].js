import cache from "memory-cache";

import { getAmpConfig } from "utils/config/ampInstance";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("ampStatsService");
const sessionIdCacheKey = `AmpInstance__sessionId`;

export default async function handler(req, res)  {
  const { service } = req.query;

  const [ampInstanceId] = service;


  try {
    const ampConfig = await getAmpConfig();

    if (!ampConfig) {
      return res.status(500).send({
        error: "Amp server configuration not found",
      });
    }

    const serverConfig =
      ampConfig && ampConfig.url && ampConfig.username && ampConfig.password
        ? {
            url: ampConfig.url,
            username: ampConfig.username,
            password: ampConfig.password,
          }
        : null;

    if (!serverConfig) {
      return res.status(400).json({
        error: "Amp server configuration not found, no variables in file",
      });
    }

    const ampSessionId = cache.get(`${sessionIdCacheKey}.${service}`);

    const baseUrl = `${serverConfig.url}/API`;

    let sessionId;
    if (!ampSessionId) {
      sessionId = await fetchAmpSessionId(baseUrl, serverConfig);
      cache.put(`${sessionIdCacheKey}.${service}`, sessionId);
    }

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${ampSessionId ?? sessionId}`,
      "User-Agent": "HomepageClient/1.0",
    };

    const statusUrl = `${baseUrl}/ADSModule/GetInstance`;

    const [status, , data] = await httpProxy(statusUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        InstanceId: ampInstanceId,
      })
    });

    if (status !== 200) {
      logger.error("HTTP Error %d calling Amp API", status);
      cache.del(`${sessionIdCacheKey}.${service}`);
      return res.status(status).send({
        error: `Failed to fetch Amp API status`,
      });
    }

    let parsedData = JSON.parse(Buffer.from(data).toString());

    if (!parsedData) {
      return res.status(500).send({
        error: "Invalid response from Amp API",
      });
    }

    const ampStatus = parsedData["Running"] ? parsedData["AppState"] : -1;

    return res.status(200).json({
      status: ampStatus ?? "unknown",
      cpu: parsedData["Metrics"]["CPU Usage"]["Percent"] ?? "unknown",
      mem: parsedData["Metrics"]["Memory Usage"]["RawValue"] ?? "unknown",
      players: parsedData["Metrics"]["Active Users"]["RawValue"] ?? "unknown",
    });
  } catch (error) {
    logger.error("Error fetching Amp status:", error);
    return res.status(500).send({
      error: "Failed to fetch Amp status",
    });
  }
}

async function fetchAmpSessionId(baseUrl, serverConfig) {
  const loginUrl = `${baseUrl}/Core/Login`;
  const headers = {
    Accept: "application/json",
  };
  const [status, , data] = await httpProxy(loginUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      username: serverConfig.username,
      password: serverConfig.password,
      token: "",
      rememberMe: false,
    }),
  });

  if (status !== 200) {
    logger.error("HTTP Error %d calling Amp API", status);
  }

  let parsedData = JSON.parse(Buffer.from(data).toString());

  return parsedData.sessionID;
}
