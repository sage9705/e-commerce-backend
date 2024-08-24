const express = require("express");
const router = express.Router();
const { handleOrderStatusUpdate } = require("../controllers/WebHookController");

router.post("/order-status", handleOrderStatusUpdate);

module.exports = router;
