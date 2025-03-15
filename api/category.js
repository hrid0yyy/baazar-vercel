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

// Simple route to verify API is working
router.get("/", (req, res) => {
  res.json({ message: "Category API working!" });
});

// POST /api/category/add (with image upload)
router.post("/add", upload.single("picture"), async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!title || !file) {
      return res
        .status(400)
        .json({ success: false, error: "Title and picture are required" });
    }

    // Upload the image directly to Supabase storage (or any external service)
    const result = await uploadImage(file);
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    const publicUrl = result.publicUrl;

    // Insert the new category into the Supabase database
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

// GET /api/category/fetch (fetch categories with optional title filter)
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
