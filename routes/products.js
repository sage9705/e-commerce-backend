const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/ProductController');
const { verifyAdmin } = require('../middlewares/auth');

router.post('/', verifyAdmin, createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', verifyAdmin, updateProduct);
router.delete('/:id', verifyAdmin, deleteProduct);

module.exports = router;