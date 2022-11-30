const {cloudinaryConfig} = require("../Config/CloudinaryConfig");
const cloudinary = require("cloudinary").v2;

cloudinaryConfig();

const uploadImage = async (imagePath, path) => {
  // Upload the image
  const result = await cloudinary.uploader.upload(imagePath, {
    folder: `real_chat/${path}/`,
    use_filename: true,
    unique_filename: false,
  });

  return result;
};

module.exports = {
  uploadImage,
};
