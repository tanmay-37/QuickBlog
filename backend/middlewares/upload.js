import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// 1. Create the new S3Client (from AWS SDK v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// 2. Configure Multer S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3Client, // <-- Pass the v3 client here
    bucket: process.env.S3_BUCKET_COVER,
    acl: 'public-read', // Optional: You can often remove this and set bucket policy instead
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${file.originalname}`; // Changed for a cleaner name
      cb(null, uniqueName);
    },
  }),
});

export default upload;