import { Request, Response, NextFunction } from "express";

import {
  VsRateLimiterMiddleware,
  VsRateLimiterOptions
} from "./types/VsRateLimiter.types";
import VsRateLimiterMongoStore from "./VsRateLimiterMongoStore";

const generateKey = (req: Request, keyGenerator: Function | undefined) => {
  let key =
    req.headers["x-forwarded-for"]?.toString() ||
    req.socket.remoteAddress ||
    "";
  if (typeof keyGenerator === "function") {
    const generateKey = keyGenerator(req);
    key = generateKey && typeof generateKey === "string" ? generateKey : key;
  }
  return key;
};

const VsRateLimiter = (
  options: VsRateLimiterOptions
): VsRateLimiterMiddleware => {
  if (!options.url || isNaN(options.limit)) {
    throw new TypeError(`options.url or options.limit is missing`);
  }

  const {
    keyGenerator,
    whiteLister,
    responseHandler,
    responseMsg,
    limit,
    tarpitTimeStepInSeconds = 0
  } = options;
  try {
    const vsRateLimiterMongoStore = new VsRateLimiterMongoStore(options);
    const vsRateLimiterMiddleware = async (
      req: Request,
      resp: Response,
      next: NextFunction
    ) => {
      try {
        let key = generateKey(req, keyGenerator);
        if (typeof whiteLister === "function") {
          if (whiteLister(req)) return next();
        }

        // req.resetRateLimit = async (): Promise<boolean> =>
        //   vsRateLimiterMongoStore.reset(key);
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
          setTimeout(() => {
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
          return;
        }
      } catch (error) {
        throw error;
      }
      next();
    };

    vsRateLimiterMiddleware.reset = (key: string) =>
      vsRateLimiterMongoStore.reset(key);

    return vsRateLimiterMiddleware;
  } catch (error) {
    console.error(
      `Something went wrong while consuming rate limit with error: ${error}`
    );
    throw error;
  }
};

export default VsRateLimiter;
