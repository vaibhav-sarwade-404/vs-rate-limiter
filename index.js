const express = require("express");
var VsRateLimiter = require("./lib").default;

const app = express();
const port = 3000;

app.use(
  VsRateLimiter({ url: "mongodb://localhost:27017/vs-rate-limiter", limit: 10 })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
