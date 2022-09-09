"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
//"mongodb://localhost:27017/vs-rate-limiter"
var getDbName = function (dbUrl) {
    return dbUrl.split("/").pop();
};
var VsRateLimiterMongoStore = /** @class */ (function () {
    function VsRateLimiterMongoStore(options) {
        var _this = this;
        this.isConnected = false;
        this.expiryIndexName = "expiry";
        this.defaultResetInSeconds = 24 * 60 * 60;
        /**
         * createIndex
         */
        this.createIndex = function (collection) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                collection.createIndex((_a = {}, _a[this.expiryIndexName] = 1, _a), { expireAfterSeconds: 0 });
                return [2 /*return*/];
            });
        }); };
        var _a = options.collectionName, collectionName = _a === void 0 ? "rl_".concat(getDbName(options.url)) : _a, _b = options.resetInSeconds, resetInSeconds = _b === void 0 ? this.defaultResetInSeconds : _b, restOptions = __rest(options, ["collectionName", "resetInSeconds"]);
        this.options = __assign({ collectionName: collectionName, resetInSeconds: resetInSeconds }, restOptions);
    }
    /**
     * connect
     */
    VsRateLimiterMongoStore.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, url, username, password, loggerLevel, collectionName, connectionOptions, dbName, client;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.options, url = _a.url, username = _a.username, password = _a.password, loggerLevel = _a.loggerLevel, collectionName = _a.collectionName;
                        connectionOptions = {};
                        if (username && password) {
                            connectionOptions["auth"] = { username: username, password: password };
                            dbName = getDbName(url);
                            connectionOptions.authSource = dbName || collectionName;
                        }
                        if (loggerLevel) {
                            connectionOptions.loggerLevel = loggerLevel;
                        }
                        return [4 /*yield*/, mongodb_1.MongoClient.connect(url, __assign(__assign({}, connectionOptions), { socketTimeoutMS: 10000, connectTimeoutMS: 10000 })).catch(function (err) {
                                console.error("Something went wrong while connecting to DB with error: ".concat(err));
                                throw new Error("Unable to connect to DB");
                            })];
                    case 1:
                        client = _b.sent();
                        if (client) {
                            this.isConnected = true;
                            this.client = client;
                            return [2 /*return*/, client];
                        }
                        else {
                            throw new Error("Unable to connect to DB");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * createCollection
     */
    VsRateLimiterMongoStore.prototype.createCollection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var collection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.client) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.client
                                .db(getDbName(this.options.url))
                                .createCollection(this.options.collectionName || "")];
                    case 1:
                        collection = _a.sent();
                        return [4 /*yield*/, this.createIndex(collection)];
                    case 2:
                        _a.sent();
                        this.rlCollection = collection;
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * getCollection
     */
    VsRateLimiterMongoStore.prototype.getCollection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var collections, collection, indexExist;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isConnected) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this.rlCollection) return [3 /*break*/, 3];
                        return [2 /*return*/, this.rlCollection];
                    case 3:
                        if (!this.client) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.client
                                .db()
                                .collections({ nameOnly: true })];
                    case 4:
                        collections = _a.sent();
                        if (!collections.length) return [3 /*break*/, 11];
                        collection = collections.find(function (collection) {
                            return collection.collectionName === _this.options.collectionName;
                        });
                        if (!collection) return [3 /*break*/, 8];
                        return [4 /*yield*/, collection.indexExists(this.expiryIndexName)];
                    case 5:
                        indexExist = _a.sent();
                        if (!!indexExist) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.createIndex(collection)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        this.rlCollection = collection;
                        return [2 /*return*/, collection];
                    case 8: return [4 /*yield*/, this.createCollection()];
                    case 9:
                        _a.sent();
                        return [2 /*return*/, this.rlCollection];
                    case 10: return [3 /*break*/, 13];
                    case 11: return [4 /*yield*/, this.createCollection()];
                    case 12:
                        _a.sent();
                        return [2 /*return*/, this.rlCollection];
                    case 13: return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * consume
     */
    VsRateLimiterMongoStore.prototype.consume = function (key, points) {
        if (points === void 0) { points = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var rlCollection, _a, keepOnConsumingAfterRLHit, limit, resetInSeconds, updateExpiryOnConsumption, rlDocument, filter, expiryDate, findOneAndUpdateOptions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCollection()];
                    case 1:
                        rlCollection = _b.sent();
                        _a = this.options, keepOnConsumingAfterRLHit = _a.keepOnConsumingAfterRLHit, limit = _a.limit, resetInSeconds = _a.resetInSeconds, updateExpiryOnConsumption = _a.updateExpiryOnConsumption;
                        rlDocument = {
                            _id: "",
                            points: 1,
                            expiry: new Date(Date.now() + this.defaultResetInSeconds)
                        };
                        if (rlCollection) {
                            filter = keepOnConsumingAfterRLHit
                                ? { _id: key }
                                : { $and: [{ _id: key }, { points: { $lt: limit } }] };
                            expiryDate = new Date(Date.now() + (resetInSeconds || this.defaultResetInSeconds) * 1000);
                            findOneAndUpdateOptions = {
                                $inc: { points: 1 }
                            };
                            if (updateExpiryOnConsumption) {
                                findOneAndUpdateOptions["$set"] = {
                                    expiry: expiryDate
                                };
                            }
                            else {
                                findOneAndUpdateOptions["$setOnInsert"] = {
                                    _id: key,
                                    expiry: expiryDate
                                };
                            }
                            return [2 /*return*/, rlCollection
                                    .findOneAndUpdate(filter, findOneAndUpdateOptions, {
                                    upsert: true,
                                    returnDocument: "after"
                                })
                                    .then(function (_rlDocument) {
                                    var _a = (_rlDocument === null || _rlDocument === void 0 ? void 0 : _rlDocument.value) || {
                                        points: 1,
                                        expiry: new Date()
                                    }, _b = _a._id, _id = _b === void 0 ? "" : _b, _c = _a.points, points = _c === void 0 ? rlDocument.points : _c, _d = _a.expiry, expiry = _d === void 0 ? rlDocument.expiry : _d;
                                    return {
                                        _id: _id.toString() || "",
                                        points: points,
                                        expiry: expiry
                                    };
                                })
                                    .catch(function (error) {
                                    if (error && error.code === 11000) {
                                        return rlCollection.findOne({ _id: key }).then(function (_rlDocument) {
                                            return {
                                                _id: (_rlDocument === null || _rlDocument === void 0 ? void 0 : _rlDocument._id.toString()) || "",
                                                points: (_rlDocument === null || _rlDocument === void 0 ? void 0 : _rlDocument.points) || rlDocument.points,
                                                expiry: (_rlDocument === null || _rlDocument === void 0 ? void 0 : _rlDocument.expiry) || rlDocument.expiry
                                            };
                                        });
                                    }
                                    return rlDocument;
                                })];
                        }
                        console.warn("Collection not found, so no points consumed for key(".concat(key, ")"));
                        return [2 /*return*/, rlDocument];
                }
            });
        });
    };
    /**
     * reset
     */
    VsRateLimiterMongoStore.prototype.reset = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var rlCollection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection()];
                    case 1:
                        rlCollection = _a.sent();
                        if (rlCollection) {
                            return [2 /*return*/, rlCollection
                                    .findOneAndDelete({ _id: key })
                                    .then(function (result) { return result.ok === 1; })
                                    .catch(function (error) {
                                    throw error;
                                })];
                        }
                        console.warn("Collection not found, so cannot reset rate limit for key(".concat(key, ")"));
                        return [2 /*return*/, false];
                }
            });
        });
    };
    return VsRateLimiterMongoStore;
}());
exports.default = VsRateLimiterMongoStore;
