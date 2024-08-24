const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createOrder,
  getAllOrders,
  getOrderById,
} = require("../controllers/OrderController");
const { verifyToken } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const orderValidationRules = [
  body("products").isArray().withMessage("Products must be an array"),
  body("products.*.product").isMongoId().withMessage("Invalid product ID"),
  body("products.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("total")
    .isFloat({ min: 0 })
    .withMessage("Total must be a positive number"),
];

router.post("/", verifyToken, orderValidationRules, validate, createOrder);
router.get("/", verifyToken, getAllOrders);
router.get("/:id", verifyToken, getOrderById);

module.exports = router;
