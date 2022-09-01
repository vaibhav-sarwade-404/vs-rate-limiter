import { RateLimitDocument, VsRateLimiterOptions } from "./types/VsRateLimiter.types";
declare class VsRateLimiterMongoStore {
    private options;
    private isConnected;
    private client;
    private rlCollection;
    private expiryIndexName;
    private defaultResetInSeconds;
    constructor(options: VsRateLimiterOptions);
    /**
     * connect
     */
    private connect;
    /**
     * createIndex
     */
    private createIndex;
    /**
     * createCollection
     */
    private createCollection;
    /**
     * getCollection
     */
    private getCollection;
    /**
     * consume
     */
    consume(key: string, points?: number): Promise<RateLimitDocument>;
}
export default VsRateLimiterMongoStore;
