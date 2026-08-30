import Detection from '../models/Detection.js';
import Mission from '../models/Mission.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDetections = asyncHandler(async (req, res) => {
  const { 
    missionId, 
    objectType, 
    hazardLevel, 
    minConfidence,
    search,
    page = 1, 
    limit = 20,
    sortBy = 'hazardScore',
    order = 'desc'
  } = req.query;

  let query = {};

  // Role-based filtering
  if (req.user.role !== 'admin') {
    const userMissions = await Mission.find({ uploadedBy: req.user._id }).distinct('_id');
    query.mission = { $in: userMissions };
  }

  if (missionId) query.mission = missionId;
  if (objectType) query.objectType = objectType;
  if (hazardLevel) query.hazardLevel = hazardLevel;
  if (minConfidence) query.confidence = { $gte: parseFloat(minConfidence) };
  if (search) {
    query.$or = [
      { objectType: { $regex: search, $options: 'i' } },
      { imageName: { $regex: search, $options: 'i' } }
    ];
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [detections, total] = await Promise.all([
    Detection.find(query)
      .populate('mission', 'name locationName')
      .populate('sonarImage', 'imageUrl originalName')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit)),
    Detection.countDocuments(query)
  ]);

  res.status(200).json(new ApiResponse(200, {
    detections,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  }, 'Detections fetched'));
});

export const getDetectionById = asyncHandler(async (req, res) => {
  const detection = await Detection.findById(req.params.id)
    .populate('mission')
    .populate('sonarImage');

  if (!detection) {
    throw new ApiError(404, 'Detection not found');
  }

  // Check ownership if not admin
  if (req.user.role !== 'admin') {
    const mission = await Mission.findById(detection.mission._id);
    if (mission.uploadedBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized');
    }
  }

  res.status(200).json(new ApiResponse(200, { detection }, 'Detection fetched'));
});

export const getDetectionsByMission = asyncHandler(async (req, res) => {
  const { missionId } = req.params;
  
  const mission = await Mission.findById(missionId);
  if (!mission) throw new ApiError(404, 'Mission not found');

  if (req.user.role !== 'admin' && mission.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  const detections = await Detection.find({ mission: missionId })
    .populate('sonarImage')
    .sort({ hazardScore: -1 });

  res.status(200).json(new ApiResponse(200, { detections, count: detections.length }, 'Mission detections fetched'));
});

export const getHighRiskAnomalies = asyncHandler(async (req, res) => {
  let query = {
    hazardLevel: { $in: ['HIGH', 'CRITICAL'] }
  };

  if (req.user.role !== 'admin') {
    const userMissions = await Mission.find({ uploadedBy: req.user._id }).distinct('_id');
    query.mission = { $in: userMissions };
  }

  const anomalies = await Detection.find(query)
    .populate('mission', 'name locationName')
    .sort({ hazardScore: -1 })
    .limit(50);

  res.status(200).json(new ApiResponse(200, { anomalies }, 'High-risk anomalies fetched'));
});

export const deleteDetection = asyncHandler(async (req, res) => {
  const detection = await Detection.findById(req.params.id);
  if (!detection) throw new ApiError(404, 'Detection not found');

  const mission = await Mission.findById(detection.mission);
  if (req.user.role !== 'admin' && mission.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  await Detection.findByIdAndDelete(req.params.id);
  
  // Update mission counts
  mission.totalDetections = await Detection.countDocuments({ mission: mission._id });
  mission.criticalCount = await Detection.countDocuments({ mission: mission._id, hazardLevel: 'CRITICAL' });
  await mission.save();

  res.status(200).json(new ApiResponse(200, null, 'Detection deleted'));
});
