const express = require("express");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.post("/prompt", (req, res) => {
  const inputJson = JSON.stringify(req.body);

  const process = spawn(
    "node",
    ["node_modules/mongodb-lens/mongodb-lens.js", MONGO_URI],
    { stdio: ["pipe", "pipe", "pipe"] }
  );

  let result = "";
  let error = "";

  process.stdout.on("data", (data) => (result += data.toString()));
  process.stderr.on("data", (data) => (error += data.toString()));

  process.on("close", () => {
    if (error) return res.status(500).send(error);
    try {
      const lastLine = result.trim().split("\n").pop();
      res.json(JSON.parse(lastLine));
    } catch (err) {
      res.status(500).json({ error: "Parse error", raw: result });
    }
  });

  process.stdin.write(inputJson + "\n");
  process.stdin.end();
});

app.listen(PORT, () => console.log(`✅ MongoLens HTTP server on port ${PORT}`));
