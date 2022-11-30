const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg, or .jpeg file allowed."));
    }
  },
});

module.exports = upload;