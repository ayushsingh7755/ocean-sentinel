/**
 * Metadata Parser Service
 * Parses CSV metadata for sonar images
 */

export const parseMetadataCSV = (csvContent) => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have header and at least one row');
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredFields = ['image_name'];
  
  for (const field of requiredFields) {
    if (!headers.includes(field)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const record = {};
    
    headers.forEach((header, idx) => {
      const val = values[idx];
      if (!val) return;
      
      switch(header) {
        case 'latitude':
        case 'longitude':
        case 'depth':
        case 'heading':
        case 'altitude':
          record[header] = parseFloat(val);
          break;
        case 'timestamp':
          record[header] = new Date(val);
          break;
        default:
          record[header] = val;
      }
    });
    
    if (record.image_name) {
      records.push(record);
    }
  }
  
  return records;
};

export const matchMetadataToImage = (imageName, metadataRecords) => {
  if (!metadataRecords || metadataRecords.length === 0) return null;
  
  const normalizedImageName = imageName.toLowerCase().trim();
  
  return metadataRecords.find(record => {
    const metaImageName = (record.image_name || '').toLowerCase().trim();
    return normalizedImageName === metaImageName || 
           normalizedImageName.includes(metaImageName) ||
           metaImageName.includes(normalizedImageName);
  }) || null;
};

export const validateMissionMetadata = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 3) {
    errors.push('Mission name must be at least 3 characters');
  }
  if (!data.locationName) {
    errors.push('Location name is required');
  }
  if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
    errors.push('Latitude must be between -90 and 90');
  }
  if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
    errors.push('Longitude must be between -180 and 180');
  }
  if (!data.depth || data.depth < 0) {
    errors.push('Depth must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
