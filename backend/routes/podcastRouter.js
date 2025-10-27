import express from "express";
import { generatePodcastAudio } from "../services/pollyService.js";
import Blog from "../models/BlogSchema.js";
// ❌ REMOVE/COMMENT OUT THIS LINE:
// import { JSDOM } from "jsdom"; 

// ❌ REMOVE/COMMENT OUT THIS FUNCTION:
/*
function stripHtml(html) {
  const dom = new JSDOM(html);
  return dom.window.document.body.textContent || "";
}
*/

const podcastRouter = express.Router();

podcastRouter.post("/:id/podcast", async (req, res) => {
  try {
    // 1. Dynamic Import JSDOM here to avoid the static loading conflict
    const { JSDOM } = await import('jsdom');
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // 2. Perform HTML stripping inside the async function
    const dom = new JSDOM(blog.content);
    const plainText = dom.window.document.body.textContent || "";

    const podcastUrl = await generatePodcastAudio(plainText, blog._id);
    blog.podcastUrl = podcastUrl;
    await blog.save();

    res.json({ podcastUrl });
  } catch (err) {
    console.error("Polly error:", err);
    // If the error is still related to jsdom, it will be caught here.
    res.status(500).json({ error: "Failed to generate podcast" });
  }
});

export default podcastRouter;