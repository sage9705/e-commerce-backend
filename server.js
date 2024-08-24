const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");
const NodeCache = require("node-cache");
const winston = require("winston");
const http = require("http");
const socketIo = require("socket.io");

dotenv.config();
connectDB();

// Import models to ensure they are registered
require("./models/user");
require("./models/product");
require("./models/order");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Caching
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Logging
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "e-commerce-api" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(passport.initialize());

app.use((req, res, next) => {
  req.cache = cache;
  req.logger = logger;
  next();
});

require("./config/passport")(passport);

const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");
const webhookRoutes = require("./routes/webhooks");

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/webhooks", webhookRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  logger.error(`${err.status} - ${err.message}`, { error: err });

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
});

app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
