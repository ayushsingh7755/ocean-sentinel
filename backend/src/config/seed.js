import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Mission from '../models/Mission.js';
import Detection from '../models/Detection.js';
import SonarImage from '../models/SonarImage.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing
    await User.deleteMany({});
    await Mission.deleteMany({});
    await Detection.deleteMany({});
    await SonarImage.deleteMany({});

    // Create users
    const admin = await User.create({
      name: 'Dr. Marine Admin',
      email: 'admin@oceansentinel.ai',
      password: 'admin123',
      organization: 'OceanSentinel HQ',
      role: 'admin'
    });

    const researcher = await User.create({
      name: 'Dr. Sarah Ocean',
      email: 'researcher@oceansentinel.ai',
      password: 'researcher123',
      organization: 'Marine Research Institute',
      role: 'researcher'
    });

    console.log('Users created');

    // Sample missions
    const missionsData = [
      {
        name: 'Mission Alpha - Arabian Sea Deep Survey',
        locationName: 'Arabian Sea - Coral Zone',
        latitude: 15.2993,
        longitude: 74.1240,
        depth: 45,
        date: new Date('2026-08-15'),
        vehicleType: 'AUV',
        uploadedBy: researcher._id,
        status: 'completed',
        totalImages: 250,
        totalDetections: 12,
        criticalCount: 3,
        highCount: 4
      },
      {
        name: 'Mission Beta - Bay of Bengal Transect',
        locationName: 'Bay of Bengal',
        latitude: 19.0760,
        longitude: 88.0791,
        depth: 62,
        date: new Date('2026-08-10'),
        vehicleType: 'Ship',
        uploadedBy: researcher._id,
        status: 'completed',
        totalImages: 180,
        totalDetections: 8,
        criticalCount: 1,
        highCount: 2
      },
      {
        name: 'Mission Gamma - Indian Ocean Ridge',
        locationName: 'Indian Ocean - Protected Reserve',
        latitude: 11.0168,
        longitude: 76.9558,
        depth: 120,
        date: new Date('2026-08-05'),
        vehicleType: 'ROV',
        uploadedBy: researcher._id,
        status: 'completed',
        totalImages: 320,
        totalDetections: 18,
        criticalCount: 5,
        highCount: 6
      }
    ];

    const missions = await Mission.insertMany(missionsData);
    console.log('Missions created');

    // Create mock sonar images and detections for first mission
    for (const mission of missions) {
      const imageCount = 3;
      const images = [];
      for (let i = 0; i < imageCount; i++) {
        const img = await SonarImage.create({
          mission: mission._id,
          imageUrl: `https://res.cloudinary.com/demo/image/upload/v1/sonar_sample_${i}.jpg`,
          originalName: `sss_image_${mission.name.split(' ')[1].toLowerCase()}_${String(i+1).padStart(3,'0')}.png`,
          fileSize: 2457600,
          analysisStatus: 'completed',
          width: 1024,
          height: 768,
          metadata: {
            latitude: mission.latitude,
            longitude: mission.longitude,
            depth: mission.depth
          }
        });
        images.push(img);
      }

      // Mock detections
      const objectTypes = ['Ghost Net', 'Pipe', 'Cylinder', 'Shipwreck', 'Unknown Debris'];
      const hazardLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      
      for (let j = 0; j < mission.totalDetections; j++) {
        const objType = objectTypes[Math.floor(Math.random() * objectTypes.length)];
        const hazardScore = objType === 'Ghost Net' ? 92 : objType === 'Shipwreck' ? 88 : Math.floor(Math.random() * 60) + 30;
        const hazardLevel = hazardScore >= 81 ? 'CRITICAL' : hazardScore >= 61 ? 'HIGH' : hazardScore >= 31 ? 'MEDIUM' : 'LOW';
        
        await Detection.create({
          mission: mission._id,
          sonarImage: images[j % images.length]._id,
          objectType: objType,
          confidence: Math.random() * 0.25 + 0.72,
          confidenceLabel: 'High',
          boundingBox: {
            x: Math.floor(Math.random() * 600),
            y: Math.floor(Math.random() * 400),
            width: Math.floor(Math.random() * 200) + 80,
            height: Math.floor(Math.random() * 150) + 60
          },
          estimatedWidthMeters: Math.round((Math.random() * 20 + 1) * 10) / 10,
          estimatedLengthMeters: Math.round((Math.random() * 30 + 1) * 10) / 10,
          estimatedArea: Math.round(Math.random() * 100 * 10) / 10,
          latitude: mission.latitude + (Math.random() - 0.5) * 0.01,
          longitude: mission.longitude + (Math.random() - 0.5) * 0.01,
          depth: mission.depth + Math.floor(Math.random() * 10) - 5,
          hazardScore,
          hazardLevel,
          isAnomaly: true,
          aiInterpretation: `AI analysis indicates ${objType.toLowerCase()} with high confidence. Requires verification.`,
          recommendation: hazardLevel === 'CRITICAL' ? 'Immediate Investigation required' : 'Routine monitoring',
          imageName: images[j % images.length].originalName,
          timestamp: new Date()
        });
      }
    }

    console.log('Seed completed!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@oceansentinel.ai / admin123');
    console.log('Researcher: researcher@oceansentinel.ai / researcher123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
