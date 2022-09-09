# vs-rate-limit

This is simple rate limit express middleware implementation with mongo DB.

## Description

VsRateLimiter constructor will always return express middleware and additional function `reset` to reset rate limit for provided key.

## Usage

```
const VsRateLimiter = required("@vs-org/rate-limiter");

const keyGenerator = (req) => {
  return req.ip;
}

const genericRateLimiter = VsRateLimiter({
  url: "mongodb://localhost:27017/vs-rate-limiter",
  collectionName: "rateLimit",
  loggerLevel: "debug",
  limit: 10,
  responseMsg: { msg: "Too many requests" },
  updateExpiryOnConsumption: false,
  keepOnConsumingAfterRLHit: true,
  tarpitTimeStepInSeconds: 0,
  keyGenerator,
  whiteLister: (req) => {
    return false;
  },
  responseHandler: (req, resp, next) => {
    return resp.status(429).send("blahhh");
  }
});
app.use(genericRateLimiter);

```

<br/>

## Examples

1. Custom rate limit for different flows and reset

```

const loginRateLimit = VsRateLimiter({
    url: "mongodb://localhost:27017/vs-rate-limiter",
    collectionName: "loginRateLimit",
    loggerLevel: "debug",
    limit: 10,
    responseMsg: { msg: "Too many requests" },
    updateExpiryOnConsumption: false,
    keepOnConsumingAfterRLHit: true,
    tarpitTimeStepInSeconds: 10,
    responseHandler: (req: Request, resp: Response) => {
      // ... operation for user like blocking IP and sending email
      return resp.send("Too many request");
    }
  });

app.get("/login", loginRateLimit, async (req, resp) => {
  return resp.send("login successful response");
});


/**
* 1. If user is blocked and connot login and has received email of blocked IP.
* 2. User can interact through email to unblock account and reset rate limit
*    (This is important if not rate limit is not cleared for user, user cannot login even after unbloking account)
*/

app.get("/unblock-user", async (req, resp) => {
  loginRateLimit.reset(keyGenerator(req));
  return resp.send("unblock successful response");
});

/**
* 1. If user is blocked and connot login and has received email of blocked IP.
* 2. User can decide to reset password through email, and reset rate limit should be cleared
*/

app.get("/reset-password", async (req, resp) => {
  loginRateLimit.reset(keyGenerator(req));
  return resp.send("reset password successful response");
});

```

<br/>
## Options

| option                      | required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                       | true     | Mongo DB connection URL                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `username`                  | false    | Mongo DB connection username                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `password`                  | false    | Mongo DB connection password                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `loggerLevel`               | false    | Mongo DB logger level for `mongodb` package                                                                                                                                                                                                                                                                                                                                                                                                           |
| `collectionName`            | false    | Mongo DB collection name for rate limit documents                                                                                                                                                                                                                                                                                                                                                                                                     |
| `limit`                     | true     | Rate limit points, if only 10 request allowed then set it as 10                                                                                                                                                                                                                                                                                                                                                                                       |
| `resetInSeconds`            | false    | Rate limit reset time, default it is 24 hours                                                                                                                                                                                                                                                                                                                                                                                                         |
| `keepOnConsumingAfterRLHit` | false    | Default false, if rate limit points needs to be consumed even after limit is reached, set this as true                                                                                                                                                                                                                                                                                                                                                |
| `tarpitTimeStepInSeconds`   | false    | Default 0, if use case to raise response time for every request after rate limit reached. This option works with configuration of `keepOnConsumingAfterRLHit` as it step is calculated based on the consumed points. If `keepOnConsumingAfterRLHit` is false this every request response is delayed only for `tarpitTimeStepInSeconds` but if it is true then response is stepped up by `tarpitTimeStepInSeconds` for every request after rate limit. |
| `updateExpiryOnConsumption` | false    | Default false, update reset date after every request to block user for `resetInSeconds` time from latest request rather than first request                                                                                                                                                                                                                                                                                                            |
| `updateExpiryOnConsumption` | false    | Default false, update reset date after every request to block user for `resetInSeconds` time from latest request rather than first request                                                                                                                                                                                                                                                                                                            |
| `responseMsg`               | false    | If response message needs to be updated, it is possible to pass either `string` or `object` which will be returned in response                                                                                                                                                                                                                                                                                                                        |
| `keyGenerator`              | false    | This function can be used to customize keys, default is IP address. Not this function always needs to return `string` or else default key will be used. This function gets access to request.                                                                                                                                                                                                                                                         |
| `whiteLister`               | false    | This function can be used to skip rate limit for some users based on conditions. Note this function should always return truthy value if rate limit needs to be skipped for the request. This function gets access to request.                                                                                                                                                                                                                        |
| `responseHandler`           | false    | This function can be used to handle whole response as needed. This function gets access to request, response and nextFunction.                                                                                                                                                                                                                                                                                                                        |

<br/>

## License

MIT (see [LICENSE](https://github.com/vaibhav-sarwade-404/vs-rate-limiter/blob/main/LICENSE))

## Note

This package is not tested with concurrent requests and heavy load (Not production ready).
