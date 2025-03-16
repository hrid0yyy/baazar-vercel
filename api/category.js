const express = require("express");
const router = express.Router();
const multer = require("multer");
const { supabase } = require("../supabase");
const uploadImage = require("../utils/image");
const upload = multer(); // Keep it in memory for serverless

// Swagger tags
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management APIs
 */

router.get("/", (req, res) => {
  res.json({ message: "Category API working!" });
});

/**
 * @swagger
 * /api/category/add:
 *   post:
 *     summary: Add a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - picture
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Electronics"
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category added successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Title and picture are required"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 */
router.post("/add", upload.single("picture"), async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!title || !file) {
      return res
        .status(400)
        .json({ success: false, error: "Title and picture are required" });
    }

    const result = await uploadImage(file);
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    const publicUrl = result.publicUrl;

    const { data, error } = await supabase
      .from("category")
      .insert([{ title, picture: publicUrl }]);

    if (error) {
      throw new Error(`Database insertion failed: ${error.message}`);
    }

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      data,
    });
  } catch (error) {
    console.error("Error adding category:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/category/fetch:
 *   get:
 *     summary: Fetch all categories or filter by title
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter categories by title
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Electronics"
 *                       picture:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 */
router.get("/fetch", async (req, res) => {
  try {
    const { title } = req.query;

    let query = supabase.from("category").select("*");

    if (title) {
      query = query.ilike("title", `%${title}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
