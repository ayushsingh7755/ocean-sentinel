import multer from 'multer';
import path from 'path';

// Use memory storage for Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/tiff',
    'image/tif',
    'application/zip',
    'application/x-zip-compressed',
    'text/csv',
    'application/vnd.ms-excel'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.zip', '.csv'];
  
  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, TIFF, ZIP, CSV`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 20
  }
});

export const uploadSonarImages = upload.array('sonarImages', 20);
export const uploadSingle = upload.single('file');
export const uploadMetadataCSV = upload.single('metadata');

export default upload;
