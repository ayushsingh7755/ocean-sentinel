import express from 'express';
import { createMission, getMissions, getMissionById, deleteMission, getMissionStats } from '../controllers/mission.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createMission)
  .get(getMissions);

router.get('/stats/overview', getMissionStats);
router.route('/:id')
  .get(getMissionById)
  .delete(deleteMission);

export default router;
