import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "./App.css";
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
import ManagePermissions from './pages/ManagePermissions';
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
      <span>© 2026 Xtremecr8ivity</span>
    </div>
  </footer>
);

function App() {
  return (
    <>
      <DarkModeToggle />
      <Routes>
        <Route path="/" element={<LoginSelector />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/all-staff" element={<AllStaff />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/admin/staff/:id" element={<StaffDetails />} />
        <Route path="/department" element={<Department />} />
        <Route path="/department/:id" element={<DepartmentDetail />} />
        <Route path="/chat" element={<Chatbox />} />
        <Route path="/uploaded-works" element={<UploadedWorks />} />
        <Route path="/manage-permissions" element={<ManagePermissions />} />
        <Route path="/all-staff-works" element={<AllStaffWorks />} />
        <Route path="/recycle-bin" element={<RecycleBin />} />
        <Route path="/staff-credentials" element={<StaffCredentials />} />
        <Route path="/card-samples" element={<CardSamples />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/employee-directory" element={<EmployeeDirectory />} />
        <Route path="/schedule-board" element={<ScheduleBoard />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/org-chart" element={<OrgChart />} />
        <Route path="/client-progress" element={<ClientProgress />} />
        <Route path="/mapping" element={<Mapping />} />
        <Route path="/stock-management" element={<StockManagement />} />
        <Route path="/client-documentation" element={<ClientDocumentation />} />
        <Route path="/card-usage-report/:encodedId" element={<CardUsageReportPublic />} />
        <Route path="/weekly-reports" element={<WeeklyReport />} />
        <Route path="/admin/weekly-reports" element={<AdminWeeklyReports />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
