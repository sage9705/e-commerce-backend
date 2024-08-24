const Product = require("../models/product");

// Custom error class for better error handling
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      category,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    next(new AppError("Error creating product", 500));
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const cacheKey = `products_${JSON.stringify(req.query)}`;
    const cachedData = req.cache.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    let query = Product.find();

    // Search functionality
    if (req.query.search) {
      query = query.or([
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ]);
    }

    // Filtering
    if (req.query.category) {
      query = query.where("category").equals(req.query.category);
    }
    if (req.query.minPrice) {
      query = query.where("price").gte(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      query = query.where("price").lte(req.query.maxPrice);
    }

    const total = await Product.countDocuments(query);
    const products = await query.skip(startIndex).limit(limit);

    req.cache.set(cacheKey, {
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });

    res.status(200).json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (err) {
    next(new AppError("Error fetching products", 500));
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError("Product not found", 404));
    }
    res.status(200).json(product);
  } catch (err) {
    next(new AppError("Error fetching product", 500));
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return next(new AppError("Product not found", 404));
    }
    res.status(200).json(updatedProduct);
  } catch (err) {
    next(new AppError("Error updating product", 500));
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return next(new AppError("Product not found", 404));
    }
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    next(new AppError("Error deleting product", 500));
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } catch (err) {
    next(new AppError("Error adding review", 500));
  }
};
