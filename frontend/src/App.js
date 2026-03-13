import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "./App.css";
import AdminLogin from './pages/AdminLogin';
import AllStaff from './pages/AllStaff';
import LoginSelector from "./pages/LoginSelector";
import StaffLogin from './pages/StaffLogin';
import StaffDetails from './pages/admin/StaffDetails';
import Department from './pages/Department';
import Home from "./pages/Home";
import Chatbox from './pages/Chatbox';
import StaffDashboard from './pages/StaffDashboard';
import UploadedWorks from './pages/UploadedWorks';
import ManagePermissions from './pages/ManagePermissions';
import AllStaffWorks from './pages/AllStaffWorks';
import RecycleBin from './pages/RecycleBin';

function App() {
  return (
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
      <Route path="/chat" element={<Chatbox />} />
      <Route path="/uploaded-works" element={<UploadedWorks />} />
      <Route path="/manage-permissions" element={<ManagePermissions />} />
      <Route path="/all-staff-works" element={<AllStaffWorks />} />
      <Route path="/recycle-bin" element={<RecycleBin />} />
    </Routes>
  );
}

export default App;
