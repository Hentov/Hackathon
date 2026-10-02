const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello, GPU Share!" });
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));