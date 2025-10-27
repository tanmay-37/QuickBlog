import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import blogRoutes from "./routes/blogRoutes.js";
import translateRouter from "./routes/translateRouter.js"
import podcastRouter from "./routes/podcastRouter.js";

// --- New Imports ---
import path from 'path';
import { fileURLToPath } from 'url';

// --- ES Module __dirname Workaround ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- New Line ---
// This makes the 'uploads' folder publicly accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Your Routes ---
app.use("/api/blogs", blogRoutes);

// translate routes
app.use('/api/translate', translateRouter);

// podcast routes
app.use('/api/podcast', podcastRouter);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));