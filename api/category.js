const express = require("express");
const router = express.Router();
const multer = require("multer");
const { supabase } = require("../supabase");
const uploadImage = require("../utils/image");
const upload = multer({ dest: "uploads/" });

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
 *     description: Adds a new category with an image upload.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category added successfully
 *       400:
 *         description: Missing title or picture
 *       500:
 *         description: Server error
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

    res
      .status(201)
      .json({ success: true, message: "Category added successfully", data });
  } catch (error) {
    console.error("Error adding category:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/category/fetch:
 *   get:
 *     summary: Fetch categories
 *     tags: [Categories]
 *     description: Fetch categories with optional title filtering.
 *     parameters:
 *       - name: title
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       500:
 *         description: Server error
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
