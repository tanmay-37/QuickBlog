import express from "express";
import {
    createBlog, 
    getAllBlogs, 
    getBlogById,
    updateBlog,
    deleteBlog 
} from "../controllers/blogController.js"
import { verifyCognitoToken } from "../middlewares/verifyCognitoToken.js";

const router = express.Router();

// public route
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// protected routes
router.post("/", verifyCognitoToken, createBlog);
router.put("/:id", verifyCognitoToken, updateBlog);
router.delete("/:id", verifyCognitoToken, deleteBlog);

export default router;