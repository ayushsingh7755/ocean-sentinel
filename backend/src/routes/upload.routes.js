import express from 'express';
import { uploadSonarImages, uploadMetadataCSV } from '../controllers/upload.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadSonarImages as uploadMiddleware, uploadMetadataCSV as csvMiddleware } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/sonar', uploadMiddleware, uploadSonarImages);
router.post('/metadata', csvMiddleware, uploadMetadataCSV);

export default router;
