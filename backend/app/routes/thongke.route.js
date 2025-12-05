const express = require("express");
const thongke = require("../controllers/thongke.controller");

const verifyToken = require("../middlewares/authJwt");
const authorizeRole = require("../middlewares/role");

const router = express.Router();

const STATS_ROLES = ["Admin", "QuanLy"];

router.get("/general", thongke.getGeneralStats);

router.get(
  "/publisher-stats",
  verifyToken,
  authorizeRole(STATS_ROLES),
  thongke.getBooksByPublisher
);

router.get(
  "/staff-by-role",
  verifyToken,
  authorizeRole(STATS_ROLES),
  thongke.getStaffByRole
);
router.get(
  "/top-borrowed",
  verifyToken,
  authorizeRole(STATS_ROLES),
  thongke.getTopBorrowedBooks
);

module.exports = router;
