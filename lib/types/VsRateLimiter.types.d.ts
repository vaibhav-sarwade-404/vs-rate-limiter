import { NextFunction, Request, Response } from "express";
import { LoggerLevel } from "mongodb";
export declare type VsRateLimiterOptions = {
    /**
     * Mongo DB URL - "mongodb://localhost:27017/vs-rate-limiter"
     */
    url: string;
    /**
     * Mongo DB username - if required
     */
    username?: string;
    /**
     * Mongo DB password - if required
     */
    password?: string;
    /**
     * Mongo DB logger level
     */
    loggerLevel?: LoggerLevel;
    /**
     * Collection Name for DB
     */
    collectionName?: string;
    /**
     * Max points / request limit
     */
    limit: number;
    /**
     * Reset rate limit for `key` in seconds (default 24 hours) --> this will generate RateLimit-Reset response header
     */
    resetInSeconds?: number;
    /**
     * Default false, if system doesn't want to update rate limit points in DB set it as true.
     * Note if this set as true then only `tarpitTimeStepInSeconds` will have effect of stepping up.
     *
     * Eg:
     * 1. {keepOnConsumingAfterRLHit: true, tarpitTimeStepInSeconds:6 } -
     *    For every rate limit respone it will step up from last 6 seconds.
     *    So first rate limit response will be in 6 seconds but next will be 12 seconds and next 18 and so on....
     * 2. {keepOnConsumingAfterRLHit: false, tarpitTimeStepInSeconds:6 } - For every rate limit respone it will take 6 seconds
     *
     */
    keepOnConsumingAfterRLHit?: boolean;
    /**
     * Update document expiry date for every request
     */
    updateExpiryOnConsumption?: boolean;
    /**
     * This option provides possibility to customize response msg, it can be either string or JSON
     */
    responseMsg?: string | object;
    /**
     * If tarpit (slow response) needed then set this in seconds.
     *
     * Eg:
     *  { tarpitTimeStepInSeconds: 6} --> Then for every 429 (rate limit response) server will send response after 6 seconds.
     *
     * If need to have this incremental then set this as true and `keepOnConsumingAfterRLHit` as true. Refer `keepOnConsumingAfterRLHit`
     */
    tarpitTimeStepInSeconds?: number;
    /**
     * This option provides flexibility for application to provide key. Make sure this always returns a string. This options will take in function and that function has access to request.
     * IP address is used as default
     *
     * eg:
     *  {
     *     ...
     *     keyGenerator: (req:Request)=> {return `${req.ip}_flow_1`;}
     *  }
     */
    keyGenerator?: (req: Request) => string;
    /**
     * This option provides flexibility for application to whitelist requests. Make sure this function always returns truthy or falsy value. This options will take in function and that function has access to request.
     *
     * eg:
     *  const whitelistedIPs = ['0.0.0.0'];
     *  {
     *     ...
     *     whiteLister: (req:Request)=> {return whitelistedIPs.includes(req.ip);}
     *  }
     *
     */
    whiteLister?: (req: Request) => boolean;
    /**
     * This option provides flexibility for application to handle response for 439 (Rate limit). Make sure this function always returns response. This options will take in function and that function has access to request, response, nextFunction.
     *
     * eg:
     *  {
     *     ...
     *     responseHandler: (req: Request, resp: Response, next: NextFunction)=> { return resp.status(429).send("blahhh"); }
     *  }
     *
     */
    responseHandler?: (req: Request, resp: Response, next: NextFunction) => void;
};
export declare type RateLimitDocument = {
    _id: string;
    points: number;
    expiry: Date;
};
export declare type GenericObject = {
    [key: string]: any;
};
