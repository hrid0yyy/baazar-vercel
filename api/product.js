const express = require("express");
const router = express.Router();
const multer = require("multer");
const { supabase } = require("../supabase");
const uploadImage = require("../utils/image");

const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */

router.get("/", (req, res) => {
  res.json({ message: "Product API working!" });
});

/**
 * @swagger
 * /api/product/add:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               discount:
 *                 type: number
 *                 description: Optional discount percentage
 *               coupon:
 *                 type: string
 *                 description: Optional coupon code
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/add", upload.single("picture"), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      quantity,
      category_id,
      discount,
      coupon,
    } = req.body;
    const file = req.file;

    if (
      !title ||
      !description ||
      !price ||
      !quantity ||
      !category_id ||
      !file
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Title, description, price, quantity, category_id, and picture are required",
      });
    }

    const productData = {
      title,
      description,
      price,
      quantity,
      category_id,
      discount: discount || 0,
      coupon: coupon || null,
    };

    const result = await uploadImage(file);
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    const publicUrl = result.publicUrl;

    const { data, error } = await supabase
      .from("product")
      .insert([{ ...productData, picture: publicUrl }]);

    if (error) {
      throw new Error(`Database insertion failed: ${error.message}`);
    }

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data,
    });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/product/fetch:
 *   get:
 *     summary: Fetch products
 *     tags: [Products]
 *     parameters:
 *       - name: title
 *         in: query
 *         description: Filter products by title
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
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
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       quantity:
 *                         type: integer
 *                       category_id:
 *                         type: integer
 *                       discount:
 *                         type: number
 *                       coupon:
 *                         type: string
 *                       picture:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get("/fetch", async (req, res) => {
  try {
    const { title } = req.query;

    let query = supabase.from("product").select("*");

    if (title) {
      query = query.ilike("title", `%${title}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
