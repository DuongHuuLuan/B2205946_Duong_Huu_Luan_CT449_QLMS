const express = require("express");
const sachController = require("../controllers/sach.controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  verifyToken: verifyTokenDocGia,
  authorizeRoleDocGia,
} = require("../middlewares/auth.docgia.middleware");

const {
  verifyToken: verifyTokenNhanVien,
  authorizeRoleNhanVien,
} = require("../middlewares/auth.nhanvien.middleware");

const router = express.Router();

const UPLOAD_DIR = "uploads/sach/";

try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`Created upload directory: ${UPLOAD_DIR}`);
  }
} catch (error) {
  console.error("ERROR creating upload directory for Sách:", error);
}

const storageSach = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, `sach-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadBiaSach = multer({
  storage: storageSach,
  limits: { fileSize: 1024 * 1024 * 5 },
});

router.get(
  "/search/book",
  verifyTokenDocGia,
  authorizeRoleDocGia(),
  sachController.search
);

router.get(
  "/available",
  verifyTokenDocGia,
  authorizeRoleDocGia(),
  sachController.findAvailable
);

router.get(
  "/:id",
  verifyTokenDocGia,
  authorizeRoleDocGia(),
  sachController.findOne
);
router
  .route("/")
  .get(
    verifyTokenNhanVien,
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu", "HoTro"]),
    sachController.findAll
  )
  .post(
    verifyTokenNhanVien,
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu"]),
    uploadBiaSach.single("BiaSach"),
    sachController.create
  );

router
  .route("/:id")
  .get(
    verifyTokenNhanVien,
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu", "HoTro"]),
    sachController.findOne
  )
  .put(
    verifyTokenNhanVien,
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu"]),
    uploadBiaSach.single("BiaSach"),
    sachController.update
  )
  .delete(
    verifyTokenNhanVien,
    authorizeRoleNhanVien(["Admin"]),
    sachController.delete
  );

module.exports = router;
