import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// AWS config
aws.config.update({
  accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
  region: import.meta.env.AWS_REGION,
});

const s3 = new aws.S3();

// Multer S3 storage
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read', // ✅ Makes images visible publicly
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
      cb(null, uniqueName);
    },
  }),
});

export default upload;
