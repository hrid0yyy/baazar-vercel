const express = require("express");
const router = express.Router();
const multer = require("multer");
const { supabase } = require("../supabase");
const uploadImage = require("../utils/image");

// Use memory storage for file uploads in serverless functions
const upload = multer({ storage: multer.memoryStorage() }); // Save files to the "uploads" directory

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

    const result = await uploadImage(file); // Upload image to external storage
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    const publicUrl = result.publicUrl;

    // Insert the new product into Supabase
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

/**
 * @swagger
 * /api/product/update/coupon/{id}:
 *   put:
 *     summary: Update coupon for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID to update the coupon for
 *         schema:
 *           type: integer
 *       - in: query
 *         name: coupon
 *         required: true
 *         description: Coupon code to apply to the product
 *         schema:
 *           type: string
 *           example: "DISCOUNT2025"
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put("/update/coupon/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { coupon } = req.query; // Changed to extract coupon from query

    if (!coupon) {
      return res
        .status(400)
        .json({ success: false, error: "Coupon code is required" });
    }

    const { data, error } = await supabase
      .from("product")
      .update({ coupon })
      .eq("id", id);

    if (error) {
      throw new Error(`Error updating coupon: ${error.message}`);
    }

    res
      .status(200)
      .json({ success: true, message: "Coupon updated successfully", data });
  } catch (error) {
    console.error("Error updating coupon:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/product/update/discount/{id}:
 *   put:
 *     summary: Update discount for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID to update the discount for
 *         schema:
 *           type: integer
 *       - in: query
 *         name: discount
 *         required: true
 *         description: Discount percentage to apply to the product
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: Discount updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put("/update/discount/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { discount } = req.query; // Changed to extract discount from query

    if (discount === undefined || discount < 0 || discount > 100) {
      return res.status(400).json({
        success: false,
        error:
          "Discount percentage is required and should be between 0 and 100",
      });
    }

    const { data, error } = await supabase
      .from("product")
      .update({ discount })
      .eq("id", id);

    if (error) {
      throw new Error(`Error updating discount: ${error.message}`);
    }

    res
      .status(200)
      .json({ success: true, message: "Discount updated successfully", data });
  } catch (error) {
    console.error("Error updating discount:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Fetch a product by its ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to fetch
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("product")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }

    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/product/category/{category_id}:
 *   get:
 *     summary: Fetch products by category ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         description: The ID of the category to fetch products from
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       404:
 *         description: No products found for this category
 *       500:
 *         description: Server error
 */
router.get("/category/:category_id", async (req, res) => {
  try {
    const { category_id } = req.params;

    const { data, error } = await supabase
      .from("product")
      .select("*")
      .eq("category_id", category_id);

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No products found for this category" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
/**
 * @swagger
 * /api/product/delete/{id}:
 *   delete:
 *     summary: Delete a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID to delete
 *     responses:
 *       200:
 *         description: Successfully deleted the product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Convert the id to an integer
    const productId = parseInt(id, 10);

    // Check if the id is a valid number
    if (isNaN(productId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid product ID" });
    }

    // Check if the product exists
    const { data: product, error: productError } = await supabase
      .from("product")
      .select("id")
      .eq("id", productId)
      .single();

    if (productError) {
      throw new Error(`Error fetching product: ${productError.message}`);
    }

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    // Delete the product
    const { error: productDeleteError } = await supabase
      .from("product")
      .delete()
      .eq("id", productId);

    if (productDeleteError) {
      throw new Error(`Error deleting product: ${productDeleteError.message}`);
    }

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
