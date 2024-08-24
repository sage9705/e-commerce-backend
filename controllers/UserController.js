const User = require("../models/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/emailService");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

exports.registerUser = async (req, res, next) => {
  req.logger.info(`POST /api/users/register`);
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return next(new AppError("User already exists", 400));
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");
    user = new User({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message:
        "User registered. Please check your email to verify your account.",
    });
  } catch (err) {
    req.logger.error(`Error in POST /api/users/register`, { error: err });
    next(new AppError("Error registering user", 500));
  }
};

exports.verifyEmail = async (req, res, next) => {
  req.logger.info(`GET /api/users/verify/${req.params.token}`);
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Invalid or expired verification token", 400));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    req.logger.error(`Error in GET /api/users/verify/${req.params.token}`, {
      error: err,
    });
    next(new AppError("Error verifying email", 500));
  }
};

exports.loginUser = async (req, res, next) => {
  req.logger.info(`POST /api/users/login`);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("Invalid credentials", 400));
    }

    if (!user.isVerified) {
      return next(
        new AppError("Please verify your email before logging in", 400)
      );
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new AppError("Invalid credentials", 400));
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    req.logger.error(`Error in POST /api/users/login`, { error: err });
    next(new AppError("Error logging in", 500));
  }
};

exports.refreshToken = async (req, res, next) => {
  req.logger.info(`POST /api/users/refresh-token`);
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 400));
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    req.logger.error(`Error in POST /api/users/refresh-token`, { error: err });
    next(new AppError("Error refreshing token", 500));
  }
};

exports.getUserProfile = async (req, res, next) => {
  req.logger.info(`GET /api/users/profile`);
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json(user);
  } catch (err) {
    req.logger.error(`Error in GET /api/users/profile`, { error: err });
    next(new AppError("Error fetching user profile", 500));
  }
};
