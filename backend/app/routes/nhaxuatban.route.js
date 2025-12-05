const express = require("express");
const nxb = require("../controllers/nhaxuatban.controller");
const verifyToken = require("../middlewares/authJwt");
const authorizeRole = require("../middlewares/role");
const router = express.Router();

router
  .route("/")
  .get(
    verifyToken,
    authorizeRole(["Admin", "QuanLy", "ThuThu", "HoTro"]),
    nxb.findAll
  )
  .post(verifyToken, authorizeRole(["Admin", "QuanLy", "ThuThu"]), nxb.create)
  .delete(verifyToken, authorizeRole(["Admin"]), nxb.deleteAll);

router
  .route("/:id")
  .get(
    verifyToken,
    authorizeRole(["Admin", "QuanLy", "ThuThu", "HoTro"]),
    nxb.findOne
  )
  .put(verifyToken, authorizeRole(["Admin", "QuanLy"]), nxb.update)
  .delete(verifyToken, authorizeRole(["Admin"]), nxb.delete);

module.exports = router;
