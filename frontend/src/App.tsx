import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Landing from './pages/Landing';
import Features from './pages/Features';
import FAQ from './pages/FAQ';
import WhatIsLearningDecay from './pages/WhatIsLearningDecay';
import UseCases from './pages/UseCases';
import Comparisons from './pages/Comparisons';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Skills from './pages/Skills';
import SkillDetail from './pages/SkillDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import {
  AdminDashboard,
  AdminUsers,
  AdminUserDetail,
  AdminSkills,
  AdminCategories,
  AdminLearningEvents,
  AdminPracticeEvents,
  AdminTemplates
} from './pages/admin';

const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
};

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/home" element={<Landing />} />
              <Route path="/features" element={<Features />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/what-is-learning-decay" element={<WhatIsLearningDecay />} />
              <Route path="/use-cases" element={<UseCases />} />
              <Route path="/comparisons" element={<Comparisons />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<Layout />}>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/skills"
                  element={
                    <ProtectedRoute>
                      <Skills />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/skills/:id"
                  element={
                    <ProtectedRoute>
                      <SkillDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Route>
              {/* Admin Routes */}
              <Route element={<AdminLayout />}>
                <Route
                  path="/admin"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminProtectedRoute>
                      <AdminUsers />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/:userId"
                  element={
                    <AdminProtectedRoute>
                      <AdminUserDetail />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/skills"
                  element={
                    <AdminProtectedRoute>
                      <AdminSkills />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <AdminProtectedRoute>
                      <AdminCategories />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/learning-events"
                  element={
                    <AdminProtectedRoute>
                      <AdminLearningEvents />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/practice-events"
                  element={
                    <AdminProtectedRoute>
                      <AdminPracticeEvents />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/templates"
                  element={
                    <AdminProtectedRoute>
                      <AdminTemplates />
                    </AdminProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
