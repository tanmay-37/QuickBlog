import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import blogRoutes from "./routes/blogRoutes.js";
import translateRouter from "./routes/translateRouter.js";
import podcastRouter from "./routes/podcastRouter.js";
// ✨ 1. Import the enhanceRoutes (make sure the path is correct)
import enhanceRoutes from "./routes/enhanceRoutes.js";

// --- New Imports ---
import path from 'path';
import { fileURLToPath } from 'url';

// --- ES Module __dirname Workaround ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✨ 2. Ensure dotenv.config() is called early, before routes might need it
dotenv.config();

const app = express();

// --- Middleware ---
// Configure CORS - Allow requests from your frontend (adjust port if needed)
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));
 // Example: Allowing Vite default port
app.use(express.json({limit: '50mb', extended: true})); // To parse JSON request bodies
// Serve static files from 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ... other middleware

// --- Routes ---
app.use("/api/blogs", blogRoutes);
app.use('/api/translate', translateRouter);
app.use('/api/podcast', podcastRouter);
// ✨ 3. Mount the enhancement route with the /api prefix
app.use('/api', enhanceRoutes);
// ... other routes

// --- Database Connection ---
connectDB(); // Assuming this handles connection logic

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
