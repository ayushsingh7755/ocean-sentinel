/**
 * AI Detection Engine
 * Calls the real YOLO-based Side-Scan Sonar detection service (Python FastAPI)
 * and enriches raw model output with hazard scoring, geo-referencing, and
 * human-readable interpretation before it's stored/returned.
 */
import axios from 'axios';
import { calculateHazardScore, getHazardLevel, getConfidenceLabel, getAIInterpretation, getRecommendation } from './hazardScore.service.js';

const NATURAL_TYPES = ['Rock', 'Sand Ripple', 'Natural Ridge'];

const CONFIDENCE_THRESHOLD = 0.5;

const randomFloat = (min, max) => Math.random() * (max - min) + min;
const round1 = (n) => Math.round(n * 10) / 10;
const round5 = (n) => Math.round(n * 100000) / 100000;

const mapYoloClassToObjectType = (yoloClass) => {
  const mapping = {
    ghost_net: 'Ghost Net',
    pipe: 'Pipe',
    cylinder: 'Cylinder',
    shipwreck: 'Shipwreck',
    debris: 'Unknown Debris',
    rock: 'Rock',
  };
  return mapping[String(yoloClass || '').toLowerCase()] || 'Unknown Debris';
};

/**
 * Normalizes whatever bbox shape the model returns into { x, y, width, height }.
 * Accepts either [x1, y1, x2, y2] (common YOLO format) or an already-shaped object.
 */
const normalizeBoundingBox = (bbox) => {
  if (!bbox) return { x: 0, y: 0, width: 0, height: 0 };
  if (Array.isArray(bbox)) {
    const [x1, y1, x2, y2] = bbox;
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }
  // Already { x, y, width, height } or { x1, y1, x2, y2 }
  if ('width' in bbox && 'height' in bbox) return bbox;
  if ('x1' in bbox) {
    return { x: bbox.x1, y: bbox.y1, width: bbox.x2 - bbox.x1, height: bbox.y2 - bbox.y1 };
  }
  return { x: 0, y: 0, width: 0, height: 0 };
};

/**
 * Converts a pixel bounding box into estimated real-world dimensions.
 * Ideally metersPerPixel comes from the sonar mission's range/swath metadata
 * (missionMetadata.metersPerPixel). Falls back to a conservative default if
 * the mission doesn't supply calibration data — replace with real sonar
 * calibration figures as soon as they're available from the survey rig.
 */
const estimateDimensions = (bbox, missionMetadata = {}) => {
  const metersPerPixel = missionMetadata.metersPerPixel || 0.05; // TODO: source from real sonar calibration
  return {
    estimatedWidthMeters: Math.max(0.1, bbox.width * metersPerPixel),
    estimatedLengthMeters: Math.max(0.1, bbox.height * metersPerPixel),
  };
};

/**
 * TODO: Replace with real georeferencing once per-ping navigation data is
 * available (e.g. AUV/towfish GPS + heading synced to sonar image timestamp).
 * Until then this approximates a detection's position from the mission's
 * origin coordinates with a small offset per detection index.
 */
const estimateGeo = (baseLat, baseLng, index) => {
  const latNoise = randomFloat(-0.0015, 0.0015);
  const lngNoise = randomFloat(-0.0015, 0.0015);
  const spreadFactor = index * 0.0002;
  return {
    latitude: baseLat + latNoise + spreadFactor,
    longitude: baseLng + lngNoise + spreadFactor,
  };
};

/**
 * Calls the real YOLO sonar detection service.
 * @param {string} imageUrl - publicly/internally reachable URL of the sonar image
 * @returns {Array} raw detections from the model: [{ class, confidence, bbox }]
 */
const callYOLOService = async (imageUrl) => {
  if (!process.env.AI_SERVICE_URL) {
    throw new Error('AI_SERVICE_URL is not configured');
  }

  try {
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/predict/image`,
      {
        image_url: imageUrl,
        model: 'yolov8-sonar-v1',
      },
      { timeout: 30000 }
    );
    return response.data?.detections || [];
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message;
    throw new Error(`AI detection service call failed${status ? ` (${status})` : ''}: ${message}`);
  }
};

/**
 * Core detection function — calls the real AI service and enriches the
 * response with hazard scoring, estimated dimensions, and geo-position.
 * @param {Object} image - SonarImage document ({ _id, originalName, imageUrl, ... })
 * @param {Object} missionMetadata - Mission location/calibration data
 * @returns {Array} detections
 */
export const analyzeSonarImage = async (image, missionMetadata = {}) => {
  const {
    latitude: baseLat = 12.9716,
    longitude: baseLng = 77.5946,
    locationName = 'Arabian Sea',
    depth: baseDepth = 45,
  } = missionMetadata;

  const imageUrl = image.imageUrl || image.url || image.path;
  if (!imageUrl) {
    throw new Error(`No image URL found for image ${image._id || image.id || '(unknown)'}`);
  }

  const rawDetections = await callYOLOService(imageUrl);

  const detections = rawDetections
    .map((det, i) => {
      const objectType = mapYoloClassToObjectType(det.class ?? det.class_name);

      let confidence = det.confidence ?? det.conf ?? 0;
      confidence = Math.round(confidence * 1000) / 1000;
      if (confidence < CONFIDENCE_THRESHOLD) return null; // model-filtered low confidence

      const boundingBox = normalizeBoundingBox(det.bbox ?? det.box);
      const { estimatedWidthMeters, estimatedLengthMeters } = estimateDimensions(boundingBox, missionMetadata);
      const estimatedArea = estimatedWidthMeters * estimatedLengthMeters;

      const geo = estimateGeo(baseLat, baseLng, i);

      const hazardScore = calculateHazardScore({
        objectType,
        confidence,
        width: estimatedWidthMeters,
        length: estimatedLengthMeters,
        locationName,
        depth: baseDepth,
      });
      const hazardLevel = getHazardLevel(hazardScore);
      const confidenceLabel = getConfidenceLabel(confidence);
      const isNatural = NATURAL_TYPES.includes(objectType);

      return {
        imageId: image._id || image.id,
        imageName: image.originalName || image.imageUrl || `sonar_${i}.png`,
        objectType,
        confidence,
        confidenceLabel,
        boundingBox,
        estimatedWidthMeters: round1(estimatedWidthMeters),
        estimatedLengthMeters: round1(estimatedLengthMeters),
        estimatedArea: round1(estimatedArea),
        latitude: round5(geo.latitude),
        longitude: round5(geo.longitude),
        depth: round1(baseDepth + randomFloat(-5, 5)), // TODO: use real depth sensor reading if available
        hazardScore,
        hazardLevel,
        isAnomaly: !isNatural,
        isFiltered: isNatural,
        aiInterpretation: getAIInterpretation(objectType, confidence, hazardScore, estimatedWidthMeters, estimatedLengthMeters),
        recommendation: getRecommendation(objectType, hazardLevel, hazardScore),
        timestamp: new Date(),
      };
    })
    .filter(Boolean);

  return detections;
};

/**
 * Batch analysis for mission
 * @param {Array} images - Array of SonarImage documents
 * @param {Object} mission - Mission document
 */
export const analyzeMission = async (images, mission) => {
  const allDetections = [];

  const missionMetadata = {
    latitude: mission.latitude,
    longitude: mission.longitude,
    locationName: mission.locationName,
    depth: mission.depth,
    metersPerPixel: mission.metersPerPixel,
  };

  for (const image of images) {
    try {
      const detections = await analyzeSonarImage(image, missionMetadata);
      const enriched = detections.map((d) => ({
        ...d,
        mission: mission._id,
        sonarImage: image._id,
      }));
      allDetections.push(...enriched);
    } catch (err) {
      // Don't let one failed image kill the whole mission batch
      console.error(`Detection failed for image ${image._id || image.id}:`, err.message);
    }
  }

  // Filter natural objects (only store artificial anomalies)
  const anomalies = allDetections.filter((d) => d.isAnomaly && !d.isFiltered);

  return {
    totalImages: images.length,
    totalRawDetections: allDetections.length,
    totalAnomalies: anomalies.length,
    detections: anomalies, // Only anomalies stored as official detections
    rawDetections: allDetections, // For debugging/analytics
  };
};

/**
 * Exported for backward compatibility with anywhere that called the
 * external service directly rather than through analyzeSonarImage.
 */
export const callExternalAIService = async (imageUrl) => {
  const rawDetections = await callYOLOService(imageUrl);
  return rawDetections.map((det) => ({
    objectType: mapYoloClassToObjectType(det.class ?? det.class_name),
    confidence: det.confidence ?? det.conf ?? 0,
    boundingBox: normalizeBoundingBox(det.bbox ?? det.box),
  }));
};