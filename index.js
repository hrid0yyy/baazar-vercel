const express = require("express");
const app = express();
const PORT = 4000;

// API routes
const api = require("./api/main");
app.use("/api", api);

app.get("/", (req, res) => {
  res.status(200).json("Welcome, baazar limit app is working well");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
