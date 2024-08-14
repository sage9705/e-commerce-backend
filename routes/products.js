const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductController");
const { verifyAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const productValidationRules = [
  body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
  body("description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("category")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Category is required"),
];

router.post("/", verifyAdmin, productValidationRules, validate, createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put(
  "/:id",
  verifyAdmin,
  productValidationRules,
  validate,
  updateProduct
);
router.delete("/:id", verifyAdmin, deleteProduct);

module.exports = router;
