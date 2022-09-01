import { Request, Response, NextFunction } from "express";

import { VsRateLimiterOptions } from "./types/VsRateLimiter.types";
import VsRateLimiterMongoStore from "./VsRateLimiterMongoStore";

const VsRateLimiter = (options: VsRateLimiterOptions) => {
  if (!options.url || isNaN(options.limit)) {
    throw new TypeError(`options.url or options.limit is missing`);
  }
  return async (req: Request, resp: Response, next: NextFunction) => {
    const vsRateLimiterMongoStore = new VsRateLimiterMongoStore(options);
    try {
      const {
        keyGenerator,
        whiteLister,
        responseHandler,
        responseMsg,
        limit,
        tarpitTimeStepInSeconds = 0
      } = options;

      let key =
        req.headers["x-forwarded-for"]?.toString() ||
        req.socket.remoteAddress ||
        "";
      if (typeof keyGenerator === "function") {
        const generateKey = keyGenerator(req);
        key =
          generateKey && typeof generateKey === "string" ? generateKey : key;
      }
      if (typeof whiteLister === "function") {
        if (whiteLister(req)) return next();
      }
      const rlDocument = await vsRateLimiterMongoStore
        .consume(key)
        .catch(err => {
          throw err;
        });
      const { points = 1, expiry = new Date() } = rlDocument;
      const remainingRateLimit = limit - points;
      resp.setHeader("RateLimit-Limit", limit);
      resp.setHeader(
        "RateLimit-Remaining",
        remainingRateLimit <= 0 ? 0 : remainingRateLimit
      );
      resp.setHeader("RateLimit-Reset", expiry.toISOString());
      if (points >= limit) {
        const tarpitBlockTimeInSeconds =
          (Math.abs(points - limit) || 1) * (tarpitTimeStepInSeconds * 1000);
        return setTimeout(() => {
          if (typeof responseHandler === "function") {
            return responseHandler(req, resp, next);
          }
          resp.status(429);
          if (responseMsg) {
            return resp.send(responseMsg);
          }
          return resp.json({
            msg: `Too many requests, please try again later.`
          });
        }, tarpitBlockTimeInSeconds);
      }
    } catch (error) {
      console.error(
        `Something went wrong while consuming rate limit with error: ${error}`
      );
    }
    next();
  };
};

export default VsRateLimiter;
