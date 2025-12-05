const express = require("express");
const nhanvien = require("../controllers/nhanvien.controller");
const verifyToken = require("../middlewares/authJwt");
const authorizeRole = require("../middlewares/role");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const UPLOAD_DIR = "uploads/nhanvien";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `nhanvien-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, webp)"));
  },
});
// Lấy danh sách nhân viên -> chỉ Admin và Quản lý được quyền xem
router.get(
  "/",
  verifyToken,
  authorizeRole(["Admin", "QuanLy"]),
  nhanvien.findAll
);

router.post(
  "/",
  verifyToken,
  authorizeRole(["Admin"]),
  uploadAvatar.single("Avatar"),
  nhanvien.create
);

router.get("/:id", verifyToken, nhanvien.findOne);
router.put(
  "/:id",
  verifyToken,
  uploadAvatar.single("Avatar"),
  (req, res, next) => {
    if (req.user.ChucVu === "Admin" || req.user.ChucVu === "QuanLy")
      return next();
    if (req.user.id === req.params.id) return next();
    return res
      .status(403)
      .json({ message: "Bạn không có quyền cập nhật nhân viên khác" });
  },
  nhanvien.update
);

// Xóa nhân viên -> chỉ Admin
router.delete("/:id", verifyToken, authorizeRole(["Admin"]), nhanvien.delete);

module.exports = router;
