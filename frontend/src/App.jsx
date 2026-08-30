import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadMission from './pages/UploadMission';
import AnalysisResults from './pages/AnalysisResults';
import MissionHistory from './pages/MissionHistory';
import MapView from './pages/MapView';
import AnomalyDetails from './pages/AnomalyDetails';
import AnomaliesList from './pages/AnomaliesList';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Researcher routes */}
          <Route element={<ProtectedRoute allowedRoles={['researcher', 'admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadMission />} />
            <Route path="/analysis/:missionId" element={<AnalysisResults />} />
            <Route path="/missions" element={<MissionHistory />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/anomalies" element={<AnomaliesList />} />
            <Route path="/anomalies/:id" element={<AnomalyDetails />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
          </Route>

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme="dark"
        toastStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
      />
    </AuthProvider>
  );
}

export default App;
