const supabase = require("../supabase"); // Adjust path if needed

/**
 * Upload an image to Supabase Storage
 * @param {Object} file - The uploaded file object
 * @param {string} storageBucket - The name of the storage bucket
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
const uploadImage = async (file, storageBucket = "images") => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const uniqueFileName = `${Date.now()}_${file.originalname}`;

  const { data, error } = await supabase.storage
    .from(storageBucket)
    .upload(uniqueFileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    throw new Error(`Error uploading file to Supabase: ${error.message}`);
  }

  // Construct the public URL
  return `https://hwqkmfzdpsmyeuabszuy.supabase.co/storage/v1/object/public/${storageBucket}/${uniqueFileName}`;
};

module.exports = {
  uploadImage,
};
