import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Load environment variables (ensure .env file is in the root of your project)
dotenv.config();

const router = express.Router();

let genAI; // Declare genAI outside

// Check if the API key is loaded and initialize the client
if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in the environment variables.");
    // Optionally throw an error or handle differently to prevent startup without a key
    // throw new Error("GEMINI_API_KEY is missing!");
} else {
    console.log("Gemini API Key loaded for enhanceRoutes.");
    try {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log("GoogleGenerativeAI client initialized successfully.");
    } catch (initError) {
        console.error("Failed to initialize GoogleGenerativeAI:", initError);
        genAI = null; // Ensure genAI is null if initialization fails
    }
}

router.post('/enhance-text', async (req, res) => {
    // ✨ Log the incoming request body ✨
    console.log('Backend received request body:', req.body);

    // Check if genAI was initialized correctly
    if (!genAI) {
        console.error("GoogleGenerativeAI client not initialized.");
        return res.status(500).json({ message: 'AI service initialization failed.' });
    }

    const { textToEnhance, enhanceType } = req.body; // Expect 'grammar' or 'full_enhance'

    // Check if properties exist and have content
    if (!textToEnhance || !enhanceType) {
        console.error('Validation failed: Missing textToEnhance or enhanceType.'); // Log why it failed
        return res.status(400).json({ message: 'Text and enhancement type are required.' });
    }

    if (textToEnhance.length < 30) { // Add a minimum length check
        console.error('Validation failed: Text too short.'); // Log why it failed
        return res.status(400).json({ message: 'Text is too short for enhancement (minimum 30 characters).' });
    }

    let prompt = '';

    // --- Select Prompt Based on Type ---
    if (enhanceType === 'grammar') {
        prompt = `Correct only the grammatical errors and spelling mistakes in the following text. Do not change the wording, style, or meaning otherwise. Return only the corrected text, without any introductory phrases like "Here's the corrected text:":\n\n"${textToEnhance}"`;
    } else if (enhanceType === 'full_enhance') {
        prompt = `You are a professional blog post editor. Review the following blog post content. Correct any grammatical errors and spelling mistakes. Enhance the text for clarity, flow, readability, and engagement, while preserving the original author's core message and voice. Return only the enhanced text, without any introductory phrases:\n\n"${textToEnhance}"`;
    } else {
        console.error(`Validation failed: Invalid enhanceType: ${enhanceType}`); // Log why it failed
        return res.status(400).json({ message: 'Invalid enhancement type provided.' });
    }
    // --- End Prompt Selection ---

    // ✨ FIX: Use gemini-2.5-flash-preview-09-2025 as the model name ✨
    let modelName = "gemini-2.5-flash-preview-09-2025"; 

    try {
        console.log(`Calling Gemini API for type: ${enhanceType}`);
        console.log(`Attempting to use model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Successfully got model instance for: ${modelName}`);

        // Generate content
        console.log("Generating content...");
        const result = await model.generateContent(prompt);
        console.log("Received result from API.");
        const response = await result.response;
        console.log("Extracted response from result.");


        // Basic check for response validity
        if (!response || typeof response.text !== 'function') { // Check if text() method exists
             console.error("Gemini API returned an invalid response structure:", response);
             throw new Error("Invalid response from AI service.");
        }

        // Optional: Check for safety ratings or blocked content
        // console.log("Prompt Feedback:", response.promptFeedback);
        // console.log("Candidate Finish Reason:", response.candidates?.[0]?.finishReason);
        // if (response.promptFeedback?.blockReason) { ... }


        const enhancedText = response.text(); // Call the function to get text
        console.log(`Gemini API response received successfully. Text length: ${enhancedText.length}`);

        res.json({ enhancedText });

    } catch (error) {
        // Log more detailed error information if available
        console.error("Error during Gemini API call:", error.message); // Log the core error message

        // modelName is accessible here
        if (error.response) { // Check if it's an Axios-like error object (less likely with SDK)
            console.error("Error Response Data:", error.response.data);
        } else if (error.message && error.message.includes('SAFETY')) {
             // Specific handling for safety blocks
             return res.status(400).json({ message: 'Content generation blocked due to safety policies.' });
        } else if (error.message && (error.message.includes('404') || error.message.includes('Not Found') || error.message.includes('is not found'))) {
             // Specific handling for 404 errors related to models
             console.error(`Model not found or incompatible. Ensure "${modelName}" is available and supported for generateContent.`);
             return res.status(404).json({ message: `AI Model "${modelName}" not found or incompatible with the API version/method.` });
        } else if (error.message && error.message.includes('API key not valid')) {
             console.error("Invalid API Key detected.");
             return res.status(401).json({ message: 'Authentication failed. Please check the API key.' });
        }
        // General fallback error
        res.status(500).json({ message: 'Failed to enhance text due to an internal AI service error.' });
    }
});

// Use export default for ES Modules
export default router;

