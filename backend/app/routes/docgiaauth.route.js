const express = require("express");
const docgiaAuthController = require("../controllers/docgiaauth.controller");

const router = express.Router();

router.post("/register", docgiaAuthController.register);
router.post("/login", docgiaAuthController.login);

module.exports = router;
