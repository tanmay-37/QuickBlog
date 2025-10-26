import express from "express";
import {
    createBlog, 
    getAllBlogs, 
    getBlogById,
    updateBlog,
    deleteBlog 
} from "../controllers/blogController.js";
import { verifyCognitoToken } from "../middlewares/verifyCognitoToken.js";

// --- New Import ---
import upload from "../middlewares/upload.js"; // Adjust path if needed

const router = express.Router();

// public route
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// protected routes
// --- Updated Line ---
// 'upload.single("coverPhoto")' now runs *after* token verification
// and *before* the createBlog controller function.
router.post("/", verifyCognitoToken, upload.single("coverPhoto"), createBlog);

router.put("edit/:id", verifyCognitoToken, updateBlog);
router.delete("/:id", verifyCognitoToken, deleteBlog);

export default router;