const express = require("express");
const sachController = require("../controllers/sach.controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Import module fs để xử lý file/thư mục

const {
  // Độc giả
  verifyToken: verifyTokenDocGia,
  authorizeRoleDocGia,
} = require("../middlewares/auth.docgia.middleware");

const {
  // Nhân viên
  verifyToken: verifyTokenNhanVien,
  authorizeRoleNhanVien,
} = require("../middlewares/auth.nhanvien.middleware");

const router = express.Router();

const UPLOAD_DIR = "uploads/sach/";

// *** ĐẢM BẢO THƯ MỤC UPLOAD TỒN TẠI ***
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`Created upload directory: ${UPLOAD_DIR}`);
  }
} catch (error) {
  console.error("ERROR creating upload directory for Sách:", error);
}
// ****************************************

const storageSach = multer.diskStorage({
  destination: function (req, file, cb) {
    // Sử dụng thư mục đã được đảm bảo tồn tại
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Tên file: sach-timestamp.ext
    cb(null, `sach-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadBiaSach = multer({
  storage: storageSach,
  limits: { fileSize: 1024 * 1024 * 5 }, // Giới hạn 5MB cho ảnh sách
});
// ----------------------------------------------------------------------
// ROUTE CHO ĐỘC GIẢ (Chỉ xem)
// ----------------------------------------------------------------------

router.get(
  "/search/book",
  verifyTokenDocGia,
  authorizeRoleDocGia(),
  sachController.search
);

// GET /api/sach/available (Tìm sách có sẵn)
router.get(
  "/available",
  verifyTokenDocGia, // Sử dụng verifyToken của Độc giả
  authorizeRoleDocGia(), // Ủy quyền chỉ cho Độc giả
  sachController.findAvailable
);

router.get(
  "/:id",
  verifyTokenDocGia, // Sử dụng verifyToken của Độc giả
  authorizeRoleDocGia(), // Ủy quyền chỉ cho Độc giả
  sachController.findOne
);
// ----------------------------------------------------------------------
// ROUTE CHO NHÂN VIÊN (Xem, Thêm, Sửa, Xóa)
router
  .route("/") // GET /api/sach/ (Tìm tất cả - Dành cho Nhân viên)
  .get(
    verifyTokenNhanVien, // Sử dụng verifyToken của Nhân viên
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu", "HoTro"]), // Ủy quyền cho Nhân viên
    sachController.findAll
  ) // POST /api/sach/ (Thêm mới - Dành cho Nhân viên)
  .post(
    verifyTokenNhanVien, // Sử dụng verifyToken của Nhân viên
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu"]),
    uploadBiaSach.single("BiaSach"),
    sachController.create
  );

router
  .route("/:id") // GET /api/sach/:id (Xem chi tiết - Dành cho Nhân viên)
  .get(
    verifyTokenNhanVien, // Sử dụng verifyToken của Nhân viên
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu", "HoTro"]),
    sachController.findOne
  ) // PUT /api/sach/:id (Cập nhật - Dành cho Nhân viên)
  .put(
    verifyTokenNhanVien, // Sử dụng verifyToken của Nhân viên
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu"]),
    uploadBiaSach.single("BiaSach"),
    sachController.update
  )
  .delete(
    verifyTokenNhanVien, // Sử dụng verifyToken của Nhân viên
    authorizeRoleNhanVien(["Admin"]),
    sachController.delete
  );

module.exports = router;
