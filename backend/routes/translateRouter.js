import express from 'express';
import AWS from 'aws-sdk';

const translateRouter = express.Router();

// Configure AWS Translate
AWS.config.update({
  region: 'us-east-1', // choose your region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const translate = new AWS.Translate();

translateRouter.post('/', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ message: 'Text and targetLanguage are required' });
    }

    const params = {
      Text: text,
      SourceLanguageCode: targetLanguage === 'hi' ? 'en' : 'hi',
      TargetLanguageCode: targetLanguage,
    };

    const result = await translate.translateText(params).promise();
    res.json({ translatedText: result.TranslatedText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Translation failed' });
  }
});

export default translateRouter;
