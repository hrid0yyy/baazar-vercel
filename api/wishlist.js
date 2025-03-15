const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist management APIs
 */

router.get("/", (req, res) => {
  res.json({ message: "Wishlist API working!" });
});

/**
 * @swagger
 * /api/wishlist/add:
 *   post:
 *     summary: Add a product to the wishlist
 *     tags: [Wishlist]
 *     description: Adds a product to a user's wishlist.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               product_id:
 *                 type: integer
 *                 example: 101
 *     responses:
 *       201:
 *         description: Product added to wishlist successfully
 *       400:
 *         description: Missing user_id or product_id
 *       500:
 *         description: Server error
 */
router.post("/add", async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({
        success: false,
        error: "User ID and Product ID are required",
      });
    }

    const { data, error } = await supabase
      .from("wishlist")
      .insert([{ user_id, product_id }]);

    if (error) {
      throw new Error(`Database insertion failed: ${error.message}`);
    }

    res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully",
      data,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/wishlist/fetch:
 *   get:
 *     summary: Get all wishlist items for a user
 *     tags: [Wishlist]
 *     description: Fetches all products in a user's wishlist.
 *     parameters:
 *       - name: user_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       product_id:
 *                         type: integer
 *       400:
 *         description: Missing user_id
 *       500:
 *         description: Server error
 */
router.get("/fetch", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_id", user_id);

    if (error) {
      throw new Error(`Error fetching wishlist: ${error.message}`);
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching wishlist:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
