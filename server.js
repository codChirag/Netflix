// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Simple mock login (do NOT use in production)
app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email+password required" });
  // demo: accept any login, return a fake token
  const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");
  res.json({ token, user: { email, name: email.split("@")[0] } });
});

// Return movie catalog (movies.json)
app.get("/api/movies", (req, res) => {
  const file = path.join(__dirname, "movies.json");
  fs.readFile(file, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "failed to read data" });
    res.header("Content-Type", "application/json");
    res.send(data);
  });
});

// Serve index.html for unknown routes (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Streamix demo running on http://localhost:${PORT}`));
