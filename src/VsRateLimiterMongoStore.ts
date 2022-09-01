import {
  Collection,
  ModifyResult,
  MongoClient,
  MongoClientOptions
} from "mongodb";

import {
  GenericObject,
  RateLimitDocument,
  VsRateLimiterOptions
} from "./types/VsRateLimiter.types";

//"mongodb://localhost:27017/vs-rate-limiter"
const getDbName = (dbUrl: string) => {
  return dbUrl.split("/").pop();
};

class VsRateLimiterMongoStore {
  private options: VsRateLimiterOptions;
  private isConnected: boolean = false;
  private client!: MongoClient;
  private rlCollection!: Collection;
  private expiryIndexName: string = `expiry`;
  private defaultResetInSeconds: number = 24 * 60 * 60;

  constructor(options: VsRateLimiterOptions) {
    const {
      collectionName = `rl_${getDbName(options.url)}`,
      resetInSeconds = this.defaultResetInSeconds,
      ...restOptions
    } = options;
    this.options = { collectionName, resetInSeconds, ...restOptions };
  }

  /**
   * connect
   */
  private async connect() {
    const { url, username, password, loggerLevel, collectionName } =
      this.options;
    const connectionOptions: MongoClientOptions = {};
    if (username && password) {
      connectionOptions["auth"] = { username, password };
      const dbName = getDbName(url);
      connectionOptions.authSource = dbName || collectionName;
    }
    if (loggerLevel) {
      connectionOptions.loggerLevel = loggerLevel;
    }
    const client = await MongoClient.connect(url, {
      ...connectionOptions,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000
    }).catch(err => {
      console.error(
        `Something went wrong while connecting to DB with error: ${err}`
      );
      throw new Error(`Unable to connect to DB`);
    });

    if (client) {
      this.isConnected = true;
      this.client = client;
      return client;
    } else {
      throw new Error(`Unable to connect to DB`);
    }
  }

  /**
   * createIndex
   */
  private createIndex = async (collection: Collection) => {
    collection.createIndex(
      { [this.expiryIndexName]: 1 },
      { expireAfterSeconds: 0 }
    );
  };

  /**
   * createCollection
   */
  private async createCollection() {
    if (this.client) {
      const collection: Collection = await this.client
        .db(getDbName(this.options.url))
        .createCollection(this.options.collectionName || "");
      await this.createIndex(collection);
      this.rlCollection = collection;
    }
  }

  /**
   * getCollection
   */
  private async getCollection(): Promise<Collection | null | undefined> {
    if (!this.isConnected) {
      await this.connect();
    }
    if (this.rlCollection) {
      return this.rlCollection;
    } else if (this.client) {
      const collections = await this.client
        .db()
        .collections({ nameOnly: true });
      if (collections.length) {
        const collection = collections.find(
          (collection: Collection) =>
            collection.collectionName === this.options.collectionName
        );
        if (collection) {
          const indexExist = await collection.indexExists(this.expiryIndexName);
          if (!indexExist) {
            await this.createIndex(collection);
          }
          this.rlCollection = collection;
          return collection;
        } else {
          await this.createCollection();
          return this.rlCollection;
        }
      } else {
        await this.createCollection();
        return this.rlCollection;
      }
    }
    return null;
  }

  /**
   * consume
   */
  public async consume(
    key: string,
    points: number = 1
  ): Promise<RateLimitDocument> {
    const rlCollection = await this.getCollection();
    const {
      keepOnConsumingAfterRLHit,
      limit,
      resetInSeconds,
      updateExpiryOnConsumption
    } = this.options;
    let rlDocument = {
      _id: "",
      points: 1,
      expiry: new Date(Date.now() + this.defaultResetInSeconds)
    };
    if (rlCollection) {
      const filter = keepOnConsumingAfterRLHit
        ? { _id: key }
        : { $and: [{ _id: key }, { points: { $lt: limit } }] };

      const expiryDate = new Date(
        Date.now() + (resetInSeconds || this.defaultResetInSeconds) * 1000
      );
      const findOneAndUpdateOptions: GenericObject = {
        $inc: { points: 1 }
      };
      if (updateExpiryOnConsumption) {
        findOneAndUpdateOptions["$set"] = {
          expiry: expiryDate
        };
      } else {
        findOneAndUpdateOptions["$setOnInsert"] = {
          _id: key,
          expiry: expiryDate
        };
      }
      return rlCollection
        .findOneAndUpdate(filter, findOneAndUpdateOptions, {
          upsert: true,
          returnDocument: "after"
        })
        .then((_rlDocument: ModifyResult) => {
          const {
            _id = "",
            points = rlDocument.points,
            expiry = rlDocument.expiry
          } = _rlDocument?.value || {
            points: 1,
            expiry: new Date()
          };
          return {
            _id: _id.toString() || "",
            points: points,
            expiry: expiry
          };
        })
        .catch(error => {
          if (error && error.code === 11000) {
            return rlCollection.findOne({ _id: key }).then(_rlDocument => {
              return {
                _id: _rlDocument?._id.toString() || "",
                points: _rlDocument?.points || rlDocument.points,
                expiry: _rlDocument?.expiry || rlDocument.expiry
              };
            });
          }
          return rlDocument;
        });
    }
    console.warn(`Collection not found, so no points consumed for key(${key})`);
    return rlDocument;
  }
}

export default VsRateLimiterMongoStore;
