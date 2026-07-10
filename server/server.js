import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/delivery", deliveryRoutes);

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crossmart";

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB successfully.");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/", (req, res) => {
  res.send("Server is Live!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "An unexpected error occurred.", error: err.message });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.use(cors({
  origin: [
    "https://crossmart.vercel.app/"
  ],
  credentials: true
}));