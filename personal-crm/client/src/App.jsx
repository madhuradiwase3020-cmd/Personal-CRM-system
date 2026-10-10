import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import RecordsPage from './pages/RecordsPage';
import ContactDetails from './pages/ContactDetails';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedLayout() {
  const { user, checking } = useAuth();
  if (checking) return <div className="loading-page"><span className="spinner" /> Opening your workspace…</div>;
  return user ? <AppLayout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route element={<ProtectedLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/contacts" element={<RecordsPage resource="contacts" />} />
      <Route path="/contacts/:id" element={<ContactDetails />} />
      <Route path="/companies" element={<RecordsPage resource="companies" />} />
      <Route path="/interactions" element={<RecordsPage resource="interactions" />} />
      <Route path="/tasks" element={<RecordsPage resource="tasks" />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/notes" element={<RecordsPage resource="notes" />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
