require("dotenv").config();
const express = require("express");
const setupSwagger = require("./swagger"); // Import Swagger setup
const cors = require("cors");

const app = express();
app.use(cors()); // Enable CORS

const PORT = 5001;

// API routes
const api = require("./api/main");
app.use("/api", api);

// Swagger documentation
setupSwagger(app);

app.get("/", (req, res) => {
  res.send("<h1>Baazar Limited Node Backend</h1>");
});

app.listen(PORT, () => {
  console.log(`Baazar Limited listening on port ${PORT}`);
});
