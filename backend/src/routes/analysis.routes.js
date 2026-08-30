import express from 'express';
import { startAnalysis, getAnalysisResults, getAnalysisStatus } from '../controllers/analysis.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/:missionId/start', startAnalysis);
router.get('/:missionId', getAnalysisResults);
router.get('/:missionId/status', getAnalysisStatus);

export default router;
