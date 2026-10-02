const Database = require("better-sqlite3");
const fs = require("fs");

const db = new Database("gpushare.db");
db.exec(fs.readFileSync("database/schema.sql", "utf8"));
console.log("Database ready");