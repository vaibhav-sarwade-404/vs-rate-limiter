"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var VsRateLimiterMongoStore_1 = __importDefault(require("./VsRateLimiterMongoStore"));
var generateKey = function (req, keyGenerator) {
    var _a;
    var key = ((_a = req.headers["x-forwarded-for"]) === null || _a === void 0 ? void 0 : _a.toString()) ||
        req.socket.remoteAddress ||
        "";
    if (typeof keyGenerator === "function") {
        var generateKey_1 = keyGenerator(req);
        key = generateKey_1 && typeof generateKey_1 === "string" ? generateKey_1 : key;
    }
    return key;
};
var VsRateLimiter = function (options) {
    if (!options.url || isNaN(options.limit)) {
        throw new TypeError("options.url or options.limit is missing");
    }
    var keyGenerator = options.keyGenerator, whiteLister = options.whiteLister, responseHandler = options.responseHandler, responseMsg = options.responseMsg, limit = options.limit, _a = options.tarpitTimeStepInSeconds, tarpitTimeStepInSeconds = _a === void 0 ? 0 : _a;
    try {
        var vsRateLimiterMongoStore_1 = new VsRateLimiterMongoStore_1.default(options);
        var vsRateLimiterMiddleware = function (req, resp, next) { return __awaiter(void 0, void 0, void 0, function () {
            var key, rlDocument, _a, points, _b, expiry, remainingRateLimit, tarpitBlockTimeInSeconds, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        key = generateKey(req, keyGenerator);
                        if (typeof whiteLister === "function") {
                            if (whiteLister(req))
                                return [2 /*return*/, next()];
                        }
                        return [4 /*yield*/, vsRateLimiterMongoStore_1
                                .consume(key)
                                .catch(function (err) {
                                throw err;
                            })];
                    case 1:
                        rlDocument = _c.sent();
                        _a = rlDocument.points, points = _a === void 0 ? 1 : _a, _b = rlDocument.expiry, expiry = _b === void 0 ? new Date() : _b;
                        remainingRateLimit = limit - points;
                        resp.setHeader("RateLimit-Limit", limit);
                        resp.setHeader("RateLimit-Remaining", remainingRateLimit <= 0 ? 0 : remainingRateLimit);
                        resp.setHeader("RateLimit-Reset", expiry.toISOString());
                        if (points >= limit) {
                            tarpitBlockTimeInSeconds = (Math.abs(points - limit) || 1) * (tarpitTimeStepInSeconds * 1000);
                            setTimeout(function () {
                                if (typeof responseHandler === "function") {
                                    return responseHandler(req, resp, next);
                                }
                                resp.status(429);
                                if (responseMsg) {
                                    return resp.send(responseMsg);
                                }
                                return resp.json({
                                    msg: "Too many requests, please try again later."
                                });
                            }, tarpitBlockTimeInSeconds);
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        throw error_1;
                    case 3:
                        next();
                        return [2 /*return*/];
                }
            });
        }); };
        vsRateLimiterMiddleware.reset = function (key) {
            return vsRateLimiterMongoStore_1.reset(key);
        };
        return vsRateLimiterMiddleware;
    }
    catch (error) {
        console.error("Something went wrong while consuming rate limit with error: ".concat(error));
        throw error;
    }
};
exports.default = VsRateLimiter;
