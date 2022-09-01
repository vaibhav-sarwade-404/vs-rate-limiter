/// <reference types="node" />
import { Request, Response, NextFunction } from "express";
import { VsRateLimiterOptions } from "./types/VsRateLimiter.types";
declare const VsRateLimiter: (options: VsRateLimiterOptions) => (req: Request, resp: Response, next: NextFunction) => Promise<void | NodeJS.Timeout>;
export default VsRateLimiter;
