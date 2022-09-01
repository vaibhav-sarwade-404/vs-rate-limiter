import express, { NextFunction, Request, Response } from "express";
import { MongoClient } from "mongodb";

import VsRateLimiter from "./src";

(async () => {
  const app = express();
  const client = await MongoClient.connect(
    "mongodb://localhost:27017/vs-rate-limiter"
  );

  const collection = client.db().collection("test");

  const genericRateLimiter = VsRateLimiter({
    url: "mongodb://localhost:27017/vs-rate-limiter",
    collectionName: "rateLimit",
    loggerLevel: "debug",
    limit: 10,
    resetInSeconds: 10,
    responseMsg: { msg: "Too many requests" },
    updateExpiryOnConsumption: false,
    keepOnConsumingAfterRLHit: true,
    tarpitTimeStepInSeconds: 0,
    keyGenerator: (req: Request) => {
      return req.ip;
    },
    whiteLister: (req: Request) => {
      return false;
    },
    responseHandler: (req: Request, resp: Response, next: NextFunction) => {
      return resp.status(429).send("blahhh");
    }
  });
  app.use(genericRateLimiter);

  app.get("/", (_req: Request, res: Response) => {
    res.send("ok");
  });

  app.listen(3000, () => console.log(`App is listening on port 3000`));
})();
