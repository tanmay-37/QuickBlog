import express from "express";
import {
    createBlog, 
    getAllBlogs, 
    getBlogById,
    updateBlog,
    deleteBlog,
    getMyBlogs // 👈 1. Import the new controller function
} from "../controllers/blogController.js";
import { verifyCognitoToken } from "../middlewares/verifyCognitoToken.js";

// --- New Import ---
import upload from "../middlewares/upload.js"; // Adjust path if needed

const router = express.Router();

// ------------------------------------------------------------------
// ⭐ 2. ADDED PROTECTED ROUTE FOR USER'S OWN BLOGS ⭐
// This route must come *before* the public '/:id' route.
router.get("/myblogs", verifyCognitoToken, getMyBlogs);
router.put("/edit/:id", verifyCognitoToken, upload.single("coverPhoto"), updateBlog);
// ------------------------------------------------------------------


// Public routes
router.get("/", getAllBlogs);
router.get("/:id", getBlogById); // This must be last in the GET routes


// Protected routes
router.post("/", verifyCognitoToken, upload.single("coverPhoto"), createBlog);

router.put("edit/:id", verifyCognitoToken, updateBlog);
router.delete("/:id", verifyCognitoToken, deleteBlog);

export default router;