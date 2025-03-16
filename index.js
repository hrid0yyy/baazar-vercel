const express = require("express");
const app = express();
const cors = require("cors"); // Import CORS
const setupSwagger = require("./swagger");
const PORT = 4000;

// Enable CORS for all origins
app.use(cors());

// API routes
const api = require("./api/main");
app.use("/api", api);

app.get("/", (req, res) => {
  res.status(200).json("Welcome, baazar limit app is working well");
});

setupSwagger(app);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
