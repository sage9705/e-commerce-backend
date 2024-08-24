const Order = require("../models/order");

exports.handleOrderStatusUpdate = async (req, res) => {
  req.logger.info(`POST /api/webhooks/order-status`);
  try {
    const { orderId, status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      req.logger.warn(`Order not found for ID: ${orderId}`);
      return res.status(404).json({ message: "Order not found" });
    }

    req.app.get("io").emit("orderStatusUpdate", { orderId, status });

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    req.logger.error(`Error in POST /api/webhooks/order-status`, { error });
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
};
