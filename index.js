var fs = require("fs");
const https = require("https");
const express = require("express");
const expressGraphQL = require("express-graphql");
///const bodyParser = require("body-parser");
const schema = require("./schema");
const jwt = require("express-jwt");
const cors = require("cors");
const { db } = require("./db-connection");
//const webpush = require("web-push");
const app = express();

var options = {
  key: fs.readFileSync("localhost.key").toString(),
  cert: fs.readFileSync("localhost.crt").toString(),
};

const auth = jwt({
  secret: process.env.APP_SECRET,
  credentialsRequired: false,
});

app.use(
  "/graphql",
  cors(),
  auth,
  expressGraphQL(req => ({
    schema,
    graphiql: true,
    context: {
      user: req.user,
    },
  }))
);

https
  .createServer(options, app)
  .listen(4000, () => console.log("https://localhost:4000"));
