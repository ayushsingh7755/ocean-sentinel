/**
 * Mock AI Detection Engine
 * Simulates YOLO-based Side-Scan Sonar analysis
 * 
 * Future integration: Replace analyzeSonarImage with call to Python FastAPI service
 * Example:
 *   const response = await axios.post(process.env.AI_SERVICE_URL, { imageUrl })
 *   return transformYOLOResponse(response.data)
 */
import axios from 'axios';
import { calculateHazardScore, getHazardLevel, getConfidenceLabel, getAIInterpretation, getRecommendation } from './hazardScore.service.js';

const OBJECT_TYPES = [
  { type: 'Ghost Net', weight: 25, baseConf: 0.88 },
  { type: 'Pipe', weight: 20, baseConf: 0.82 },
  { type: 'Cylinder', weight: 15, baseConf: 0.78 },
  { type: 'Shipwreck', weight: 10, baseConf: 0.92 },
  { type: 'Unknown Debris', weight: 20, baseConf: 0.75 },
  { type: 'Rock', weight: 10, baseConf: 0.70 }, // Will be filtered
];

const NATURAL_TYPES = ['Rock', 'Sand Ripple', 'Natural Ridge'];

// Weighted random selection
const weightedRandom = (items) => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  return items[0];
};

const randomFloat = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Simulate bounding box within 1024x768 sonar image
const generateBoundingBox = () => {
  const width = randomInt(80, 320);
  const height = randomInt(60, 250);
  const x = randomInt(20, 1024 - width - 20);
  const y = randomInt(20, 768 - height - 20);
  return { x, y, width, height };
};

const addGeoNoise = (baseLat, baseLng, index) => {
  // Add small variation per detection (~10-100m)
  const latNoise = randomFloat(-0.0015, 0.0015);
  const lngNoise = randomFloat(-0.0015, 0.0015);
  // Add systematic offset based on bounding box position to simulate realistic spread
  const spreadFactor = index * 0.0002;
  return {
    latitude: baseLat + latNoise + spreadFactor,
    longitude: baseLng + lngNoise + spreadFactor
  };
};

/**
 * Core mock detection function
 * @param {Object} image - SonarImage document or object with _id, originalName
 * @param {Object} missionMetadata - Mission location data
 * @returns {Array} detections
 */
export const analyzeSonarImage = async (image, missionMetadata = {}) => {
  // Simulate processing time variability
  // In real implementation, this would call Python service
  const res = await axios.post(`${process.env.AI_SERVICE_URL}/predict/image`, { image_url:image })
  return transformYOLOResponse(res.data)
  const {
    latitude: baseLat = 12.9716,
    longitude: baseLng = 77.5946,
    locationName = 'Arabian Sea',
    depth: baseDepth = 45
  } = missionMetadata;

  // Decide number of detections per image (0-3, mostly 0-1)
  const rand = Math.random();
  let numDetections;
  if (rand < 0.45) numDetections = 0;       // 45% no detection
  else if (rand < 0.75) numDetections = 1;  // 30% one detection
  else if (rand < 0.90) numDetections = 2;  // 15% two detections
  else numDetections = 3;                   // 10% three detections

  const detections = [];

  for (let i = 0; i < numDetections; i++) {
    const selected = weightedRandom(OBJECT_TYPES);
    const objectType = selected.type;
    
    // Confidence with some variance around base
    let confidence = randomFloat(selected.baseConf - 0.15, selected.baseConf + 0.08);
    confidence = Math.min(0.99, Math.max(0.35, confidence));
    confidence = Math.round(confidence * 1000) / 1000; // 3 decimals

    // Filter low confidence (<0.50) - simulate model filtering
    if (confidence < 0.5) continue;

    const boundingBox = generateBoundingBox();
    const estimatedWidthMeters = randomFloat(0.8, 25.5);
    const estimatedLengthMeters = randomFloat(1.2, 35.0);
    const estimatedArea = estimatedWidthMeters * estimatedLengthMeters;
    
    const geo = addGeoNoise(baseLat, baseLng, i);
    
    // Calculate hazard
    const hazardScore = calculateHazardScore({
      objectType,
      confidence,
      width: estimatedWidthMeters,
      length: estimatedLengthMeters,
      locationName,
      depth: baseDepth
    });
    
    const hazardLevel = getHazardLevel(hazardScore);
    const confidenceLabel = getConfidenceLabel(confidence);
    const isNatural = NATURAL_TYPES.includes(objectType);
    
    const detection = {
      imageId: image._id || image.id || `img_${Date.now()}_${i}`,
      imageName: image.originalName || image.imageUrl || `sonar_${i}.png`,
      objectType,
      confidence,
      confidenceLabel,
      boundingBox,
      estimatedWidthMeters: Math.round(estimatedWidthMeters * 10) / 10,
      estimatedLengthMeters: Math.round(estimatedLengthMeters * 10) / 10,
      estimatedArea: Math.round(estimatedArea * 10) / 10,
      latitude: Math.round(geo.latitude * 100000) / 100000,
      longitude: Math.round(geo.longitude * 100000) / 100000,
      depth: Math.round((baseDepth + randomFloat(-5, 5)) * 10) / 10,
      hazardScore,
      hazardLevel,
      isAnomaly: !isNatural,
      isFiltered: isNatural,
      aiInterpretation: getAIInterpretation(objectType, confidence, hazardScore, estimatedWidthMeters, estimatedLengthMeters),
      recommendation: getRecommendation(objectType, hazardLevel, hazardScore),
      timestamp: new Date()
    };

    detections.push(detection);
  }

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
    depth: mission.depth
  };

  for (const image of images) {
    const detections = await analyzeSonarImage(image, missionMetadata);
    // Attach mission and image refs
    const enriched = detections.map(d => ({
      ...d,
      mission: mission._id,
      sonarImage: image._id
    }));
    allDetections.push(...enriched);
  }

  // Filter natural objects (only store artificial anomalies)
  const anomalies = allDetections.filter(d => d.isAnomaly && !d.isFiltered);
  
  return {
    totalImages: images.length,
    totalRawDetections: allDetections.length,
    totalAnomalies: anomalies.length,
    detections: anomalies, // Only anomalies stored as official detections
    rawDetections: allDetections // For debugging/analytics
  };
};

/**
 * Future YOLO integration stub
 * This function signature will remain same when switching to real AI service
 */
export const callExternalAIService = async (imageUrl) => {
  // TODO: Implement when Python FastAPI service is ready
   const response = await axios.post(process.env.AI_SERVICE_URL, {
     image_url: imageUrl,
     model: 'yolov8-sonar-v1'
   });
   return transformYOLOResponse(response.data);
  throw new Error('External AI service not configured. Using mock engine.');
};

const transformYOLOResponse = (yoloData) => {
  // Transform YOLO format to our internal format
  // YOLO: { detections: [{ class, confidence, bbox: [x,y,x2,y2] }] }
  return yoloData.detections.map(det => ({
    objectType: mapYoloClassToObjectType(det.class),
    confidence: det.confidence,
    boundingBox: {
      x: det.bbox[0],
      y: det.bbox[1],
      width: det.bbox[2] - det.bbox[0],
      height: det.bbox[3] - det.bbox[1]
    }
  }));
};

const mapYoloClassToObjectType = (yoloClass) => {
  const mapping = {
    'ghost_net': 'Ghost Net',
    'pipe': 'Pipe',
    'cylinder': 'Cylinder',
    'shipwreck': 'Shipwreck',
    'debris': 'Unknown Debris',
    'rock': 'Rock'
  };
  return mapping[yoloClass] || 'Unknown Debris';
};
