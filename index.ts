import { Request, Response, NextFunction } from "express";
import express from "express";

import VsRateLimiter from "./src";

(async () => {
  const app = express();

  const loginRateLimit = VsRateLimiter({
    url: "mongodb://localhost:27017/vs-rate-limiter",
    collectionName: "loginRateLimit",
    loggerLevel: "debug",
    limit: 10,
    responseMsg: { msg: "Too many requests" },
    updateExpiryOnConsumption: false,
    keepOnConsumingAfterRLHit: true,
    tarpitTimeStepInSeconds: 10,
    responseHandler: (req: Request, resp: Response) => {
      // Block user IP
      return resp.send("Too many request");
    }
  });

  app.get("/login", loginRateLimit, async (req: Request, resp: Response) => {
    return resp.send("Vs Rate limiter World!");
  });

  app.get("/reset", (req, res) => {
    loginRateLimit.reset(req.ip);
    res.send("Vs Rate limiter World!");
  });

  app.listen(3000, () => console.log(`App is listening on port 3000`));
})();
