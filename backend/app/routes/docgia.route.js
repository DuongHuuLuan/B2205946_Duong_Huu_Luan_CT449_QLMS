const express = require("express");
const router = express.Router();
const docgiaController = require("../controllers/docgia.controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  verifyToken: verifyNhanVien,
  authorizeRoleNhanVien,
} = require("../middlewares/auth.nhanvien.middleware");
const {
  verifyToken: verifyDocGia,
  authorizeRoleDocGia,
} = require("../middlewares/auth.docgia.middleware");

const UPLOAD_DIR = "uploads/docgia/";
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`Created upload directory: ${UPLOAD_DIR}`);
  }
} catch (error) {
  console.error("ERROR creating upload directory:", error);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const maDocGia = req.body.MaDocGia || "unknown";
    cb(
      null,
      `docgia-${maDocGia}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 },
});

router
  .route("/")
  .get(
    verifyNhanVien,
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu", "HoTro"]),
    docgiaController.findAll
  )
  .post(
    verifyNhanVien,
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu"]),
    docgiaController.create
  )
  .delete(
    verifyNhanVien,
    authorizeRoleNhanVien(["Admin"]),
    docgiaController.deleteAll
  );

router.post(
  "/with-avatar",
  verifyNhanVien,
  authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu"]),
  uploadAvatar.single("Avatar"),
  docgiaController.createWithAvatar
);

router
  .route("/:id")
  .get(
    verifyNhanVien,
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu", "HoTro"]),
    docgiaController.findOne
  )
  .put(
    verifyNhanVien,
    authorizeRoleNhanVien(["Admin", "QuanLy"]),
    uploadAvatar.single("Avatar"),
    docgiaController.update
  )
  .delete(
    verifyNhanVien,
    authorizeRoleNhanVien(["Admin"]),
    docgiaController.delete
  );

router.get(
  "/profile/me",
  verifyDocGia,
  authorizeRoleDocGia(),
  docgiaController.getProfile
);

router.put(
  "/profile/update",
  verifyDocGia,
  authorizeRoleDocGia(),
  uploadAvatar.single("Avatar"),
  docgiaController.updateProfile
);

module.exports = router;
