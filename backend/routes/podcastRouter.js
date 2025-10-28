// --- Inside podcastRouter.js ---

import express from "express";
import { generatePodcastAudio } from "../services/pollyService.js";
import Blog from "../models/BlogSchema.js";
// ✨ 1. Import the 'html-to-text' library ✨
import { htmlToText } from 'html-to-text';

// ❌ Remove JSDOM import completely if it was still there ❌
// const { JSDOM } = await import('jsdom'); // Remove this

const podcastRouter = express.Router();

podcastRouter.post("/:id/podcast", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // ✨ 2. Use htmlToText to extract plain text ✨
    const plainText = htmlToText(blog.content, {
        wordwrap: false, // Prevent adding line breaks
        selectors: [
            { selector: 'img', format: 'skip' }, // Skip images
            { selector: 'a', options: { ignoreHref: true } } // Keep link text, ignore URL
        ]
    });

    if (!plainText) {
        // Handle cases where content might be empty after stripping HTML
        console.warn(`Blog ${blog._id} content resulted in empty text after HTML stripping.`);
        // Decide how to proceed: maybe return an error or generate empty audio?
        // For now, let's proceed, Polly might handle empty string gracefully or error.
    }

    // 3. Generate audio with the extracted text
    const podcastUrl = await generatePodcastAudio(plainText, blog._id);
    blog.podcastUrl = podcastUrl;
    await blog.save();

    res.json({ podcastUrl });
  } catch (err) {
    // Log the actual error causing the 500
    console.error("Podcast generation route error:", err);
    // Include more error detail in development?
    res.status(500).json({
         error: "Failed to generate podcast",
         // message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default podcastRouter;