const multer = require("multer");
const path = require('path');
storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + "/public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
exports.upload = multer({ storage: storage, limits: { fileSize: 500000 } });
