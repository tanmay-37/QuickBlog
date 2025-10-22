import Blog from "../models/BlogSchema.js"

// create blog logic
export const createBlog = async (req, res) => {
    try {
        const { title, subtitle, content, author, date, coverImage } = req.body;

        if(!coverImage) {
            return res.status(400).json({message: "Cover image URL required"});
        }

        const newBlog = new Blog({ title, subtitle, content, author, date, coverImage, 
            authorId: req.user.sub,
         });

        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (error) {   
        res.status(500).json({ message: "Error creating blog", error });
    }
};

// get all blogs
export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({createdAt: -1});
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blogs", error });
    }
};

// get blog by ID
export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if(!blog) res.status(404).json({ message: "Blog not found" });
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blog", error });
    }
};

// update blog by ID
export const updateBlog = async (req, res) => {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedBlog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json(updatedBlog);
    } catch (error) {
        res.status(500).json({ message: "Error updating blog", error });
    }
};

// Delete a blog by ID
export const deleteBlog = async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting blog", error });
    }
};

