const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("image"), (req, res) => {
  const imageUrl = `/uploads/${req.file.filename}`;

  res.json({ message: "Tải ảnh lên thành công", imageUrl: imageUrl });
});

module.exports = router;
