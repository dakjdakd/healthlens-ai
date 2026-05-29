/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/Upload';
import ReportDetail from './pages/ReportDetail';
import Timeline from './pages/Timeline';
import OrganMap from './pages/OrganMap';
import Explanation from './pages/Explanation';
import Privacy from './pages/Privacy';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/upload" element={<MainLayout><UploadPage /></MainLayout>} />
        <Route path="/report/latest" element={<MainLayout><ReportDetail /></MainLayout>} />
        <Route path="/report/:id" element={<MainLayout><ReportDetail /></MainLayout>} />
        <Route path="/timeline" element={<MainLayout><Timeline /></MainLayout>} />
        <Route path="/organ-map" element={<MainLayout><OrganMap /></MainLayout>} />
        <Route path="/insights" element={<MainLayout><Explanation /></MainLayout>} />
        <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
        <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

