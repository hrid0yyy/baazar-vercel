const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");
const cors = require("cors");

router.use(cors());

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Review management APIs
 */

router.get("/", (req, res) => {
  res.json({ message: "Review API working!" });
});

/**
 * @swagger
 * /api/reviews/{pid}:
 *   get:
 *     summary: Get all reviews for a product
 *     tags: [Review]
 *     description: Fetches all reviews for a given product ID from the review table.
 *     parameters:
 *       - name: pid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID to fetch reviews for
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   pid:
 *                     type: string
 *                   stars:
 *                     type: integer
 *                   feedback:
 *                     type: string
 *       404:
 *         description: No reviews found for this pid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    // Query Supabase review table for rows matching the pid
    const { data, error } = await supabase
      .from("review")
      .select("*")
      .eq("pid", pid);

    if (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No reviews found for this pid" });
    }

    res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/reviews/add:
 *   post:
 *     summary: Add a new review for a product
 *     tags: [Review]
 *     description: Adds a new review to the review table with product ID, star rating, and feedback.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pid:
 *                 type: string
 *                 example: "123"
 *               stars:
 *                 type: integer
 *                 example: 5
 *               feedback:
 *                 type: string
 *                 example: "Great product!"
 *             required:
 *               - pid
 *               - stars
 *               - feedback
 *     responses:
 *       201:
 *         description: Review added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pid:
 *                   type: string
 *                 stars:
 *                   type: integer
 *                 feedback:
 *                   type: string
 *       400:
 *         description: Missing pid, stars, or feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/add", async (req, res) => {
  try {
    console.log("Request body:", req.body); // Keep for debugging
    const { pid, stars, feedback } = req.body;

    // Validate required fields
    if (!pid || !stars || !feedback) {
      return res.status(400).json({ error: "pid, stars, and feedback are required" });
    }

    // Insert new review into Supabase review table
    const { data, error } = await supabase
      .from("review")
      .insert([{ pid, stars, feedback }])
      .select();

    if (error) {
      console.error("Error creating review:", error);
      return res.status(500).json({ error: "Failed to create review" });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;