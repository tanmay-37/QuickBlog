import express from 'express';
// ✨ THIS is the correct V3 Import ✨
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
// ❌ REMOVE any line that says: import AWS from 'aws-sdk'; ❌

const translateRouter = express.Router();

// V3 Client Initialization
const translateClient = new TranslateClient({
  region: process.env.AWS_REGION || "us-east-1",
  // Credentials are automatically picked up from environment variables
});

translateRouter.post('/', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ message: 'Text and targetLanguage are required' });
    }

    // V3 Command Structure
    const command = new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: targetLanguage === 'hi' ? 'en' : 'hi',
      TargetLanguageCode: targetLanguage,
    });

    // V3 Send Command
    const result = await translateClient.send(command);
    res.json({ translatedText: result.TranslatedText });

  } catch (err) {
    console.error("AWS Translate Error:", err);
    res.status(500).json({ message: 'Translation failed' });
  }
});

export default translateRouter;