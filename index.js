const express = require("express");
const app = express();
const cors = require("cors"); // Import CORS
const setupSwagger = require("./swagger");
const PORT = 4000;
const path = require("path");

// Enable CORS for all origins
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// Optional: If your client sends URL-encoded form data, add this
app.use(express.urlencoded({ extended: true }));

// API routes
const api = require("./api/main");
app.use("/api", api);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

setupSwagger(app);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
