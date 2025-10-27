import express from "express";
import { generatePodcastAudio } from "../services/pollyService.js";
import Blog from "../models/BlogSchema.js";
import { JSDOM } from "jsdom";

function stripHtml(html) {
  const dom = new JSDOM(html);
  return dom.window.document.body.textContent || "";
}

const podcastRouter = express.Router();

podcastRouter.post("/:id/podcast", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const plainText = stripHtml(blog.content);

    const podcastUrl = await generatePodcastAudio(plainText, blog._id);
    blog.podcastUrl = podcastUrl;
    await blog.save();

    res.json({ podcastUrl });
  } catch (err) {
    console.error("Polly error:", err);
    res.status(500).json({ error: "Failed to generate podcast" });
  }
});

export default podcastRouter;
