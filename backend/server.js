import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import blogRoutes from "./routes/blogRoutes.js"

// env variables configuration
dotenv.config();
// express app 
const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/blogs", blogRoutes)

// DB connection
connectDB();


// starting server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));