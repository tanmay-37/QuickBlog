import Blog from "../models/BlogSchema.js"

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

// get blogs created by the currently authenticated user
export const getMyBlogs = async (req, res) => {
    try {
        const userId = req.user.sub; 

        if (!userId) {
            return res.status(401).json({ message: "User ID not found in token payload." });
        }

        const userBlogs = await Blog.find({ authorId: userId }).sort({ createdAt: -1 });

        res.status(200).json(userBlogs);
    } catch (error) {
        console.error("Error fetching user's blogs:", error);
        res.status(500).json({ message: "Error retrieving your blogs.", error: error.message });
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
        // ⭐ TIP: Add check for valid MongoDB ID format to prevent 500 on bad IDs
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ message: "Invalid blog ID format" });
        }

        const blog = await Blog.findById(req.params.id);
        if(!blog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json(blog);
    } catch (error) {
        console.error("Error fetching blog by ID:", error);
        res.status(500).json({ message: "Error fetching blog", error });
    }
};

// ⭐ UPDATED: update blog by ID to handle file uploads
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub; 
    
    // Data from req.body (text fields)
    const updateData = { ...req.body };

    // 1. Find existing blog and check authorization
    const blog = await Blog.findById(id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.authorId !== userId)
      return res.status(403).json({ message: "Not authorized to edit this blog" });

    // 2. Handle new cover photo upload if present
    if (req.file) {
        // Build the new image URL
        const coverImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        updateData.coverImage = coverImageUrl;
    }
    
    // 3. Handle tags which might come as a comma-separated string if not array-parsed by Multer
    // (This ensures consistency when manually updating or if the frontend sends it as a string)
    if (updateData.tags && typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }


    // 4. Update the blog
    const updated = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a blog by ID
export const deleteBlog = async (req, res) => {
    try {
        // ⭐ TIP: Add check for valid MongoDB ID format to prevent 500 on bad IDs
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ message: "Invalid blog ID format" });
        }

        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json({ message: "Error deleting blog", error });
    }
};