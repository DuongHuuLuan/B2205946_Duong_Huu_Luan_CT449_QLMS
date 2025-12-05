const express = require("express");
const tdms = require("../controllers/theodoimuonsach.controller");

const {
  verifyToken: verifyTokenDocGia,
  authorizeRoleDocGia,
} = require("../middlewares/auth.docgia.middleware");

const {
  verifyToken: verifyTokenNhanVien,
  authorizeRoleNhanVien,
} = require("../middlewares/auth.nhanvien.middleware");

const router = express.Router();

router
  .route("/docgia")
  .get(verifyTokenDocGia, authorizeRoleDocGia(), tdms.findByDocGia)
  .post(verifyTokenDocGia, authorizeRoleDocGia(), tdms.createByDocGia);

router
  .route("/")
  .get(
    verifyTokenNhanVien,
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu", "HoTro"]),
    tdms.findAll
  )
  .post(
    verifyTokenNhanVien,
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu"]),
    tdms.create
  )
  .delete(
    verifyTokenNhanVien,
    authorizeRoleNhanVien(["Admin"]),
    tdms.deleteAll
  );

router
  .route("/:id")
  .get(
    verifyTokenNhanVien,
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu", "HoTro"]),
    tdms.findOne
  )
  .put(
    verifyTokenNhanVien,
    authorizeRoleNhanVien(["Admin", "QuanLy", "ThuThu"]),
    tdms.update
  )
  .delete(verifyTokenNhanVien, authorizeRoleNhanVien(["Admin"]), tdms.delete);

module.exports = router;
