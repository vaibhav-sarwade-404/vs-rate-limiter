import { VsRateLimiterMiddleware, VsRateLimiterOptions } from "./types/VsRateLimiter.types";
declare const VsRateLimiter: (options: VsRateLimiterOptions) => VsRateLimiterMiddleware;
export default VsRateLimiter;
