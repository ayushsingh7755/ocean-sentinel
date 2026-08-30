import Mission from '../models/Mission.js';
import Detection from '../models/Detection.js';
import SonarImage from '../models/SonarImage.js';
import { generateJSONReport, generateCSVReport } from '../services/reportGenerator.service.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getJSONReport = asyncHandler(async (req, res) => {
  const { missionId } = req.params;

  const mission = await Mission.findById(missionId);
  if (!mission) throw new ApiError(404, 'Mission not found');

  if (req.user.role !== 'admin' && mission.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  const [detections, images] = await Promise.all([
    Detection.find({ mission: missionId }).sort({ hazardScore: -1 }),
    SonarImage.find({ mission: missionId })
  ]);

  const report = generateJSONReport(mission, detections, images);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=${mission.name.replace(/\s+/g, '_')}_report.json`);
  res.status(200).json(report);
});

export const getCSVReport = asyncHandler(async (req, res) => {
  const { missionId } = req.params;

  const mission = await Mission.findById(missionId);
  if (!mission) throw new ApiError(404, 'Mission not found');

  if (req.user.role !== 'admin' && mission.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  const detections = await Detection.find({ mission: missionId }).sort({ hazardScore: -1 });
  const csv = generateCSVReport(mission, detections);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${mission.name.replace(/\s+/g, '_')}_report.csv`);
  res.status(200).send(csv);
});

export const getReportPreview = asyncHandler(async (req, res) => {
  const { missionId } = req.params;

  const mission = await Mission.findById(missionId);
  if (!mission) throw new ApiError(404, 'Mission not found');

  if (req.user.role !== 'admin' && mission.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  const [detections, images] = await Promise.all([
    Detection.find({ mission: missionId }).sort({ hazardScore: -1 }),
    SonarImage.find({ mission: missionId })
  ]);

  const report = generateJSONReport(mission, detections, images);

  res.status(200).json({
    success: true,
    data: report
  });
});
