import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import blogRoutes from "./routes/blogRoutes.js";
import translateRouter from "./routes/translateRouter.js";
import podcastRouter from "./routes/podcastRouter.js";
import enhanceRoutes from "./routes/enhanceRoutes.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "50mb" }));

// ✅ NO Local Upload Serving Now
// REMOVE this:
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/blogs", blogRoutes);
app.use("/api/translate", translateRouter);
app.use("/api/podcast", podcastRouter);
app.use("/api", enhanceRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Running on port ${PORT}`));
