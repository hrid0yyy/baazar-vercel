const express = require("express");
const setupSwagger = require("../swagger"); // Import Swagger setup
const cors = require("cors");

const app = express();
app.use(cors()); // Enable CORS

// API routes
const api = require("../api/main");
app.use("/api", api);

// Swagger documentation
setupSwagger(app);

app.get("/", (req, res) => {
  res.send("<h1>Baazar Limited Node Backend</h1>");
});

// Export the express app as a serverless function (Vercel handler)
module.exports = app;
