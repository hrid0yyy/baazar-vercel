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
/**
 * @swagger
 * /api/category/fetch:
 *   get:
 *     summary: Fetch categories with their products
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: title
 *         required: false
 *         description: Filter categories by title
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categories with products fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/fetch", async (req, res) => {
  try {
    const { title } = req.query;

    let categoryQuery = supabase.from("category").select("*");

    if (title) {
      categoryQuery = categoryQuery.ilike("title", `%${title}%`);
    }

    const { data: categories, error: categoryError } = await categoryQuery;

    if (categoryError) {
      throw new Error(`Error fetching categories: ${categoryError.message}`);
    }

    // Fetch all products
    const { data: products, error: productError } = await supabase
      .from("product")
      .select("*");

    if (productError) {
      throw new Error(`Error fetching products: ${productError.message}`);
    }

    // Map products into their respective categories
    const categoriesWithProducts = categories.map((category) => ({
      ...category,
      products: products.filter(
        (product) => product.category_id === category.id
      ),
    }));

    res.status(200).json({ success: true, data: categoriesWithProducts });
  } catch (error) {
    console.error("Error fetching categories with products:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     summary: Fetch a category by its ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the category to fetch
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Electronics"
 *                     picture:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *       404:
 *         description: Category not found
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
 *                   example: "Category not found"
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
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch category
    const { data: category, error: categoryError } = await supabase
      .from("category")
      .select("*")
      .eq("id", id)
      .single();

    if (categoryError) {
      throw new Error(`Error fetching category: ${categoryError.message}`);
    }

    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }

    // Fetch products for this category
    const { data: products, error: productError } = await supabase
      .from("product")
      .select("*")
      .eq("category_id", id);

    if (productError) {
      throw new Error(`Error fetching products: ${productError.message}`);
    }

    // Add products inside the category object
    category.products = products;

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error("Error fetching category with products:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
