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
    next(new AppError("Error registering user", 500));
  }
};

exports.verifyEmail = async (req, res, next) => {
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
    next(new AppError("Error verifying email", 500));
  }
};

exports.loginUser = async (req, res, next) => {
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

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token });
  } catch (err) {
    next(new AppError("Error logging in", 500));
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json(user);
  } catch (err) {
    next(new AppError("Error fetching user profile", 500));
  }
};
