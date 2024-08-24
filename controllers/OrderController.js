const Order = require("../models/order");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

exports.createOrder = async (req, res, next) => {
  req.logger.info(`POST /api/orders`);
  const { products, total } = req.body;
  try {
    const newOrder = new Order({ user: req.user, products, total });
    await newOrder.save();

    // Emit socket event
    req.app.get("io").emit("newOrder", newOrder);

    res.status(201).json(newOrder);
  } catch (err) {
    req.logger.error(`Error in POST /api/orders`, { error: err });
    next(new AppError("Error creating order", 500));
  }
};

exports.getAllOrders = async (req, res, next) => {
  req.logger.info(`GET /api/orders`);
  try {
    const cacheKey = `orders_${req.user}_${JSON.stringify(req.query)}`;
    const cachedData = req.cache.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Order.countDocuments({ user: req.user });
    const orders = await Order.find({ user: req.user })
      .populate("products.product")
      .skip(startIndex)
      .limit(limit);

    const responseData = {
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };

    req.cache.set(cacheKey, responseData);

    res.status(200).json(responseData);
  } catch (err) {
    req.logger.error(`Error in GET /api/orders`, { error: err });
    next(new AppError("Error fetching orders", 500));
  }
};

exports.getOrderById = async (req, res, next) => {
  req.logger.info(`GET /api/orders/${req.params.id}`);
  try {
    const order = await Order.findById(req.params.id).populate(
      "products.product"
    );
    if (!order) {
      return next(new AppError("Order not found", 404));
    }
    res.status(200).json(order);
  } catch (err) {
    req.logger.error(`Error in GET /api/orders/${req.params.id}`, {
      error: err,
    });
    next(new AppError("Error fetching order", 500));
  }
};
