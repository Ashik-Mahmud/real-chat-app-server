const { cloudinaryConfig } = require("../Config/CloudinaryConfig");
const cloudinary = require("cloudinary").v2;

cloudinaryConfig();

// Upload the image
const uploadImage = async (imagePath, path) => {
  const result = await cloudinary.uploader.upload(imagePath, {
    folder: `real_chat/${path}/`,
    use_filename: true,
    unique_filename: false,
  });

  return result;
};

//delete the image
const deleteImage = async (public_id, path) => {
  const result = await cloudinary.uploader.destroy(public_id, {
    folder: `real_chat/${path}/`,
    use_filename: true,
    unique_filename: false,
  });
  return result;
};

module.exports = {
  uploadImage,deleteImage
};
