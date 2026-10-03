const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "gpushare.db"));
db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
console.log("Database ready");
