import express from 'express';
import { getJSONReport, getCSVReport, getReportPreview } from '../controllers/report.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/:missionId/json', getJSONReport);
router.get('/:missionId/csv', getCSVReport);
router.get('/:missionId/preview', getReportPreview);

export default router;
