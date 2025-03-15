const express = require("express");
const router = express.Router();

// category api route
const cat = require("./category");
router.use("/category", cat);

// product api routes
const pro = require("./product");
router.use("/product", pro);

// wishlist api routes
const wish = require("./wishlist");
router.use("/wishlist", wish);

router.get("/", (req, res) => {
  res.json({ message: "Api route is working" });
});

module.exports = router;
