const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  registerUser,
  loginUser,
  getUserProfile,
  verifyEmail,
  refreshToken,
} = require("../controllers/UserController");
const { verifyToken } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const userValidationRules = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const loginValidationRules = [
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

router.post("/register", userValidationRules, validate, registerUser);
router.post("/login", loginValidationRules, validate, loginUser);
router.post("/refresh-token", refreshToken);
router.get("/profile", verifyToken, getUserProfile);
router.get("/verify/:token", verifyEmail);

module.exports = router;
