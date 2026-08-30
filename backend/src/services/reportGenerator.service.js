/**
 * Report Generator Service
 */

export const generateJSONReport = (mission, detections, images) => {
  const criticalHazards = detections.filter(d => d.hazardLevel === 'CRITICAL').length;
  const highHazards = detections.filter(d => d.hazardLevel === 'HIGH').length;
  
  const objectTypeCounts = detections.reduce((acc, d) => {
    acc[d.objectType] = (acc[d.objectType] || 0) + 1;
    return acc;
  }, {});
  
  return {
    mission: mission.name,
    missionId: mission._id,
    location: {
      name: mission.locationName,
      latitude: mission.latitude,
      longitude: mission.longitude,
      depth: mission.depth
    },
    vehicleType: mission.vehicleType,
    analysisDate: new Date().toISOString(),
    missionDate: mission.date,
    summary: {
      totalImages: images.length,
      totalDetections: detections.length,
      criticalHazards,
      highHazards,
      objectTypeCounts,
      averageConfidence: detections.length > 0 
        ? Math.round((detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length) * 1000) / 1000
        : 0
    },
    detections: detections.map(d => ({
      id: d._id,
      objectType: d.objectType,
      confidence: d.confidence,
      confidenceLabel: d.confidenceLabel,
      hazardScore: d.hazardScore,
      hazardLevel: d.hazardLevel,
      latitude: d.latitude,
      longitude: d.longitude,
      depth: d.depth,
      estimatedWidthMeters: d.estimatedWidthMeters,
      estimatedLengthMeters: d.estimatedLengthMeters,
      estimatedArea: d.estimatedArea,
      boundingBox: d.boundingBox,
      imageName: d.imageName,
      aiInterpretation: d.aiInterpretation,
      recommendation: d.recommendation,
      timestamp: d.timestamp
    })),
    generatedBy: 'OceanSentinel AI v1.0',
    disclaimer: 'This report contains AI-generated interpretations. All detections should be verified by qualified marine specialists before operational action.'
  };
};

export const generateCSVReport = (mission, detections) => {
  const headers = [
    'Mission',
    'MissionId',
    'Object Type',
    'Confidence',
    'Confidence Label',
    'Hazard Score',
    'Hazard Level',
    'Latitude',
    'Longitude',
    'Depth',
    'Width_m',
    'Length_m',
    'Area_m2',
    'Image Name',
    'Timestamp',
    'AI Interpretation',
    'Recommendation'
  ];
  
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const rows = detections.map(d => [
    escapeCSV(mission.name),
    escapeCSV(mission._id),
    escapeCSV(d.objectType),
    d.confidence,
    escapeCSV(d.confidenceLabel),
    d.hazardScore,
    escapeCSV(d.hazardLevel),
    d.latitude,
    d.longitude,
    d.depth || '',
    d.estimatedWidthMeters,
    d.estimatedLengthMeters,
    d.estimatedArea || '',
    escapeCSV(d.imageName),
    d.timestamp ? new Date(d.timestamp).toISOString() : '',
    escapeCSV(d.aiInterpretation),
    escapeCSV(d.recommendation)
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

export const generateSummaryStats = (detections) => {
  if (!detections.length) {
    return {
      total: 0,
      byType: {},
      byHazard: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      avgConfidence: 0
    };
  }
  
  const byType = detections.reduce((acc, d) => {
    acc[d.objectType] = (acc[d.objectType] || 0) + 1;
    return acc;
  }, {});
  
  const byHazard = detections.reduce((acc, d) => {
    acc[d.hazardLevel] = (acc[d.hazardLevel] || 0) + 1;
    return acc;
  }, { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 });
  
  const avgConfidence = detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length;
  
  return {
    total: detections.length,
    byType,
    byHazard,
    avgConfidence: Math.round(avgConfidence * 1000) / 1000
  };
};
