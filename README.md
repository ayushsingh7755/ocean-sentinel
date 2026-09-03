# OceanSentinel AI — Marine Debris Detection Platform

**AI-Powered Side-Scan Sonar Analysis for Marine Debris Detection**

Professional MERN-stack application for government/marine research agencies to automatically analyze Side-Scan Sonar (SSS) imagery, detect ghost nets, pipes, cylinders, shipwrecks, and unknown artificial anomalies.

![OceanSentinel](https://img.shields.io/badge/Stack-MERN-22d3ee?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Mock%20YOLO%20Engine-06b6d4?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 🌊 Problem Solved

- Ghost nets threaten marine ecosystems
- Manual sonar inspection is slow (8+ hrs per survey)
- Thousands of sonar images create backlogs
- Natural features mimic debris acoustically

## 🔄 Workflow

```
Side-Scan Sonar Image
↓ Upload (JPG/PNG/TIFF/ZIP)
↓ Preprocessing (Speckle reduction, Contrast)
↓ AI Object Detection (Mock YOLO)
↓ Confidence Filtering (<50% ignored)
↓ Hazard Scoring (0-100)
↓ Metadata Parsing + Geotagging
↓ Interactive Map Visualization
↓ JSON/CSV Report Generation
```

## 🧱 Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS (dark ocean theme, glassmorphism)
- React Router DOM, Axios
- Framer Motion, React Icons
- Recharts (analytics), React Leaflet (maps)
- React Dropzone, Toastify

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + HTTP-only cookies + bcryptjs
- Multer + Cloudinary
- Helmet, CORS, Morgan, Cookie Parser

**AI Architecture (Mock for prototype)**
```
Frontend → Express API → Mock AI Detection Engine → Results
Future:  → Python FastAPI YOLO Service → Real Model
```

Isolated in `services/aiDetection.service.js` for easy replacement.

## 📁 Project Structure

```
ocean-sentinel-ai/
├── backend/
│   ├── src/
│   │   ├── config/ (db, cloudinary, seed)
│   │   ├── controllers/
│   │   ├── models/ (User, Mission, SonarImage, Detection)
│   │   ├── routes/
│   │   ├── middlewares/ (auth, role, upload, error)
│   │   ├── services/ (aiDetection, hazardScore, metadataParser, reportGenerator)
│   │   ├── utils/ (ApiError, ApiResponse, asyncHandler)
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/ (Navbar, Sidebar, StatCard, DetectionCard, SonarUploader, DetectionOverlay, HazardBadge, MapComponent, LoadingPipeline)
    │   ├── pages/ (Home, Login, Register, Dashboard, UploadMission, AnalysisResults, MissionHistory, MapView, AnomalyDetails, AdminDashboard)
    │   ├── layouts/
    │   ├── services/ (api)
    │   ├── context/ (AuthContext)
    │   ├── hooks/ (useAuth)
    │   ├── utils/ (constants, formatters)
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (optional, mock fallback exists)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values:
# MONGO_URI=mongodb://localhost:27017/oceansentinel
# JWT_SECRET=your_secret
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
# FRONTEND_URL=http://localhost:5173

npm run dev    # http://localhost:5000
npm run seed   # optional: create demo users & missions
```

**Demo accounts created by seed:**
- Admin: `admin@oceansentinel.ai / admin123`
- Researcher: `researcher@oceansentinel.ai / researcher123`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api

npm run dev    # http://localhost:5173
```

## 🔐 Auth & Roles

- **Researcher**: Upload, analyze, view maps, download reports, history
- **Admin**: Global analytics, all missions, users, high-risk anomalies

JWT in HTTP-only cookies + Bearer fallback, protected routes, role middleware.

## 🧠 Mock AI Engine

File: `backend/src/services/aiDetection.service.js`

- Simulates YOLO detection
- Random 0-3 detections per image
- Weighted types: Ghost Net (25%), Pipe (20%), Cylinder (15%), Shipwreck (10%), Unknown (20%), Rock (10% filtered)
- Confidence filtering: <0.50 ignored, 0.50-0.69 Low, 0.70-0.84 Medium, 0.85-0.94 High, 0.95-1.0 Very High
- Natural objects (Rock, Sand Ripple) filtered
- Future: Replace `analyzeSonarImage()` with `axios.post(AI_SERVICE_URL)`

## ⚠️ Hazard Scoring

File: `backend/src/services/hazardScore.service.js`

Base risk: Ghost Net 80, Shipwreck 70, Cylinder 60, Pipe 50, Unknown 40

Bonuses:
- Large size (+10-15)
- High confidence (+5-10)
- Sensitive zone (coral, reserve) (+10)
- Shallow depth (<30m +5)

Levels: 0-30 LOW (green), 31-60 MEDIUM (yellow), 61-80 HIGH (orange), 81-100 CRITICAL (red)

## 🗺️ API Endpoints

```
Auth:
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/users (admin)

Missions:
POST /api/missions
GET  /api/missions?search=&status=&page=&limit=
GET  /api/missions/:id
DELETE /api/missions/:id
GET  /api/missions/stats/overview

Upload:
POST /api/upload/sonar (multipart, field: sonarImages, body: missionId)
POST /api/upload/metadata (CSV)

Analysis:
POST /api/analysis/:missionId/start
GET  /api/analysis/:missionId
GET  /api/analysis/:missionId/status

Detections:
GET  /api/detections?missionId=&objectType=&hazardLevel=&minConfidence=&search=&page=&limit=
GET  /api/detections/high-risk
GET  /api/detections/mission/:missionId
GET  /api/detections/:id
DELETE /api/detections/:id

Reports:
GET /api/reports/:missionId/json
GET /api/reports/:missionId/csv
GET /api/reports/:missionId/preview

Analytics:
GET /api/analytics/dashboard
GET /api/analytics/trends
GET /api/analytics/system (admin)
```

## 📊 Frontend Pages

- `/` Landing with sonar animation, problem/solution, features, stats
- `/login`, `/register`
- `/dashboard` Researcher analytics (missions, images, hazards, critical, charts)
- `/upload` 3-step: Mission metadata → Upload (dropzone) → AI analysis (pipeline animation)
- `/analysis/:missionId` Sonar overlay with bounding boxes, toggles, detection cards, download
- `/missions` History table with search/filter
- `/map` Leaflet map with risk-colored markers, popups
- `/anomalies/:id` Full detail, location, dimensions, AI interpretation, recommendation
- `/anomalies` High-risk list
- `/admin` Global analytics, top critical, system stats

## 🎨 UI/UX

- Dark ocean theme: #020617 background, #0f172a cards, cyan #22d3ee accents
- Glassmorphism, Framer Motion, sonar radar animation, custom scrollbars
- Responsive, desktop-first dashboard, professional government/research feel

## 📄 Reports

JSON:
```json
{
  "mission": "Mission Alpha",
  "analysisDate": "2026-08-29",
  "totalImages": 250,
  "totalDetections": 12,
  "criticalHazards": 3,
  "detections": [...]
}
```

CSV columns: Mission, Object Type, Confidence, Hazard Score, Hazard Level, Latitude, Longitude, Width, Length, Timestamp, AI Interpretation, Recommendation

## 🔮 Future YOLO Integration

Keep logic isolated in `aiDetection.service.js`. Replace mock with:

```js
const res = await axios.post(process.env.AI_SERVICE_URL, { image_url: imageUrl })
return transformYOLOResponse(res.data)
```

Expected YOLO response:
```json
{ "detections": [{ "class": "ghost_net", "confidence": 0.94, "bbox": [120,80,350,230] }] }
```

## 🛠️ .env Examples

**Backend `.env.example`** already provided. Required:
```
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=...
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Frontend `.env.example`**
```
VITE_API_URL=http://localhost:5000/api
```

## 📦 Deliverable

Complete project ready for `npm install` and `npm run dev` in both folders. Zip file includes frontend + backend + README + .env.example.

Workflow verified:
Login → Create Mission → Upload Sonar → Start AI Analysis (animated pipeline) → Mock Detection → Filtering → Hazard Scoring → Geotagging → Visualization → Map → Download JSON/CSV

---

Built for marine conservation teams and underwater monitoring agencies. Professional, production-style, reusable components, MVC backend, centralized error handling, loading/empty states, toast notifications, form validation.

**OceanSentinel AI** — Cleaner oceans through intelligent sonar analysis.
