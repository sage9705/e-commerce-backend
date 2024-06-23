const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById } = require('../controllers/OrderController');
const { verifyToken } = require('../middlewares/auth');

router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getAllOrders);
router.get('/:id', verifyToken, getOrderById);

module.exports = router;