import Blog from "../models/BlogSchema.js"

// create blog logic
// create blog logic
export const createBlog = async (req, res) => {
  try {
    // 1. Get text data from req.body (thanks to multer)
    const { title, subtitle, content, author, tags } = req.body;

    // 2. Get the authorId from the token middleware
    const authorId = req.user.sub;

    // 3. Get file info from req.file (if it exists)
    let coverImageUrl = null;
    if (req.file) {
      // req.file.filename is the unique name we created in multer
      // We build the full URL to save in the database
      coverImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else {
      // You can decide if a cover image is required or not
      // return res.status(400).json({message: "Cover image is required"});
    }

    // 4. Create the new blog object for the database
    const newBlog = new Blog({ 
      title, 
      subtitle, 
      content, 
      author, 
      authorId: authorId,
      coverImage: coverImageUrl, // Save the URL, not the file
      tags: tags // Multer automatically parses the 'tags[]' array for you
      // 'date' will be set by default from your schema
    });

    // 5. Save to MongoDB
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);

  } catch (error) {   
    console.error("Error in createBlog:", error); // Log the full error
    res.status(500).json({ message: "Error creating blog", error: error.message });
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
    const { id } = req.params;
    const userId = req.user.sub; // assuming Cognito user ID from verifyToken middleware
    const blog = await Blog.findById(id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.authorId !== userId)
      return res.status(403).json({ message: "Not authorized to edit this blog" });

    const updated = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ message: "Internal server error" });
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

