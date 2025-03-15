const path = require("path");
const fs = require("fs/promises");
const { supabase } = require("../supabase"); // Ensure correct import

const BUCKET_NAME = "images";

const uploadImage = async (file) => {
  try {
    if (!file) {
      throw new Error("No file uploaded");
    }

    const filePath = path.resolve(file.path);
    const fileBuffer = await fs.readFile(filePath);

    const uniqueFileName = `${Date.now()}_${file.originalname}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${uniqueFileName}`, fileBuffer, {
        contentType: file.mimetype,
      });

    await fs.unlink(filePath);

    if (error) {
      throw new Error(`Error uploading file to Supabase: ${error.message}`);
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/images/${uniqueFileName}`;

    return { success: true, publicUrl };
  } catch (error) {
    console.error("Error during file upload:", error.message);
    return { success: false, error: error.message };
  }
};

// Correctly export the function
module.exports = uploadImage;
