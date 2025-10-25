// src/routes/post.routes.js
import { Router } from 'express';
import { Post } from '../models/post.model.js';
import sanitizeHtml from 'sanitize-html';

const router = Router();

// This will handle POST requests to /api/v1/posts/create
router.post('/create', async (req, res) => {
  try {
    // 1. Get the data from the form
    const { title, description, content } = req.body;

    // 2. Simple Validation
    if (!title || !description || !content) {
      return res
        .status(400)
        .json({ error: 'Title, description, and content are all required.' });
    }

    // 3. Sanitize the HTML content (This is the crucial security step)
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: [
        ...sanitizeHtml.defaults.allowedTags,
        'img',
        'h1',
        'h2',
        'span',
      ],
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['style'], // Allow style attributes (for colors, etc.)
      },
    });

    // 4. Create a new post document
    const newPost = new Post({
      title,
      description,
      content: sanitizedContent,
    });

    // 5. Save it to the database
    const savedPost = await newPost.save();

    // 6. Send the saved post back as a success response
    return res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;