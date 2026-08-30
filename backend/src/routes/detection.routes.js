import express from 'express';
import { getDetections, getDetectionById, getDetectionsByMission, getHighRiskAnomalies, deleteDetection } from '../controllers/detection.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDetections);
router.get('/high-risk', getHighRiskAnomalies);
router.get('/mission/:missionId', getDetectionsByMission);
router.get('/:id', getDetectionById);
router.delete('/:id', deleteDetection);

export default router;
