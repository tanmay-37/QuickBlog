import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// AWS config
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

// Multer S3 storage
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_COVER,
    acl: 'public-read', 
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
      cb(null, uniqueName);
    },
  }),
});

export default upload;
