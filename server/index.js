import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import UserRoutes from "./routes/User.js";
// Agar aapke paas workout ki alag route file hai, toh use yahan import karein:
// import WorkoutRoutes from "./routes/Workout.js"; 

dotenv.config();

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true })); // for form data

// Serverless DB Connection Logic
let isConnected = false;

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URL);
    isConnected = db.connections[0].readyState === 1;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect with MongoDB:", err);
    throw err;
  }
};

// Middleware: Database connect hone ka wait karein har request se pehle
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Database connection error",
      error: err.message,
    });
  }
});

app.use("/api/user/", UserRoutes);
// Agar workout routes alag hain toh unhe yahan mount karein (e.g., /api/workouts/):
// app.use("/api/workouts/", WorkoutRoutes);

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Hello developers from GFG",
  });
});

// error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

// Sirf local development ke liye listen karein
if (process.env.NODE_ENV !== "production") {
  app.listen(8080, () => console.log("Server started on port 8080"));
}

// Vercel Serverless Function ke liye App Export
export default app;
// this is it 