import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "./App.css";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import AllStaff from './pages/AllStaff';
import LoginSelector from "./pages/LoginSelector";
import StaffLogin from './pages/StaffLogin';
import StaffDetails from './pages/admin/StaffDetails';
import Department from './pages/Department';
import DepartmentDetail from './pages/DepartmentDetail';
import Home from "./pages/Home";
import Chatbox from './pages/Chatbox';
import StaffDashboard from './pages/StaffDashboard';
import UploadedWorks from './pages/UploadedWorks';
import AllStaffWorks from './pages/AllStaffWorks';
import RecycleBin from './pages/RecycleBin';
import StaffCredentials from './pages/StaffCredentials';
import CardSamples from './pages/CardSamples';
import Announcements from './pages/Announcements';
import Tasks from './pages/Tasks';
import EmployeeDirectory from './pages/EmployeeDirectory';
import ScheduleBoard from './pages/ScheduleBoard';
import AuditLog from './pages/AuditLog';
import OrgChart from './pages/OrgChart';
import ClientProgress from './pages/ClientProgress';
import Mapping from './pages/Mapping';
import StockManagement from './pages/StockManagement';
import ClientDocumentation from './pages/ClientDocumentation';
import CardUsageReportPublic from './pages/CardUsageReportPublic';
import WeeklyReport from './pages/WeeklyReport';
import AdminWeeklyReports from './pages/AdminWeeklyReports';
import DarkModeToggle from './components/DarkModeToggle';

const Footer = () => (
  <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '20px 0', textAlign: 'center', fontSize: '13px', borderTop: '1px solid #1e293b' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <span>© 2026 Xtreme Cr8tivity</span>
    </div>
  </footer>
);

function App() {
  return (
    <AuthProvider>
      <DarkModeToggle />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginSelector />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/card-usage-report/:encodedId" element={<CardUsageReportPublic />} />
        
        {/* Admin-only routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute requiredRole="admin">
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/all-staff" element={
          <ProtectedRoute requiredRole="admin">
            <AllStaff />
          </ProtectedRoute>
        } />
        <Route path="/admin/staff/:id" element={
          <ProtectedRoute requiredRole="admin">
            <StaffDetails />
          </ProtectedRoute>
        } />
        <Route path="/department" element={
          <ProtectedRoute requiredRole="admin">
            <Department />
          </ProtectedRoute>
        } />
        <Route path="/department-detail/:deptId" element={
          <ProtectedRoute requiredRole="admin">
            <DepartmentDetail />
          </ProtectedRoute>
        } />
        <Route path="/uploaded-works" element={
          <ProtectedRoute requiredRole="admin">
            <UploadedWorks />
          </ProtectedRoute>
        } />
        <Route path="/recycle-bin" element={
          <ProtectedRoute requiredRole="admin">
            <RecycleBin />
          </ProtectedRoute>
        } />
        <Route path="/staff-credentials" element={
          <ProtectedRoute requiredRole="admin">
            <StaffCredentials />
          </ProtectedRoute>
        } />
        <Route path="/audit-log" element={
          <ProtectedRoute requiredRole="admin">
            <AuditLog />
          </ProtectedRoute>
        } />
        <Route path="/org-chart" element={
          <ProtectedRoute requiredRole="admin">
            <OrgChart />
          </ProtectedRoute>
        } />
        <Route path="/client-progress" element={
          <ProtectedRoute requiredRole="admin">
            <ClientProgress />
          </ProtectedRoute>
        } />
        <Route path="/stock-management" element={
          <ProtectedRoute requiredRole="admin">
            <StockManagement />
          </ProtectedRoute>
        } />
        <Route path="/client-documentation" element={
          <ProtectedRoute>
            <ClientDocumentation />
          </ProtectedRoute>
        } />
        <Route path="/admin/weekly-reports" element={
          <ProtectedRoute requiredRole="admin">
            <AdminWeeklyReports />
          </ProtectedRoute>
        } />
        
        {/* Staff-only routes */}
        <Route path="/staff-dashboard" element={
          <ProtectedRoute requiredRole="staff">
            <StaffDashboard />
          </ProtectedRoute>
        } />
        <Route path="/weekly-reports" element={
          <ProtectedRoute requiredRole="staff">
            <WeeklyReport />
          </ProtectedRoute>
        } />
        
        {/* Shared authenticated routes */}
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chatbox />
          </ProtectedRoute>
        } />
        <Route path="/all-staff-works" element={
          <ProtectedRoute>
            <AllStaffWorks />
          </ProtectedRoute>
        } />
        <Route path="/card-samples" element={
          <ProtectedRoute>
            <CardSamples />
          </ProtectedRoute>
        } />
        <Route path="/announcements" element={
          <ProtectedRoute>
            <Announcements />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/employee-directory" element={
          <ProtectedRoute>
            <EmployeeDirectory />
          </ProtectedRoute>
        } />
        <Route path="/schedule-board" element={
          <ProtectedRoute>
            <ScheduleBoard />
          </ProtectedRoute>
        } />
        <Route path="/mapping" element={
          <ProtectedRoute>
            <Mapping />
          </ProtectedRoute>
        } />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}

export default App;
