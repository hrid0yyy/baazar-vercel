// api/main.js
const express = require("express");
const router = express.Router();

// category API route
const cat = require("./category");
router.use("/category", cat);

// product API routes
const pro = require("./product");
router.use("/product", pro);

// wishlist API routes
const wish = require("./wishlist");
router.use("/wishlist", wish);

// Base route
router.get("/", (req, res) => {
  res.json({ message: "Api route is working" });
});

// Wrapping the Express app into a serverless function handler
const app = express();
app.use(router);

module.exports = (req, res) => app(req, res);
