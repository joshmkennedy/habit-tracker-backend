const pgp = require("pg-promise")();
const db = {};
db.conn = pgp({
  user: process.env.DATABASE_USER,
  host: "localhost",
  database: process.env.DATABASE,
  password: "",
  port: process.env.DATABASE_PORT,
});

module.exports = { db };
