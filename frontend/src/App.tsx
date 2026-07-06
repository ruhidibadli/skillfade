import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlanProvider } from './context/PlanContext';
import { ThemeProvider } from './context/ThemeContext';
import { OnboardingProvider } from './context/OnboardingContext';
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
import LearningVsPractice from './pages/LearningVsPractice';
import SkillDecayFormula from './pages/SkillDecayFormula';
import CompareAnki from './pages/compare/Anki';
import CompareNotion from './pages/compare/Notion';
import CompareObsidian from './pages/compare/Obsidian';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import BillingSuccess from './pages/BillingSuccess';
import BillingError from './pages/BillingError';
import NotFound from './pages/NotFound';
// Code-split the blog: react-markdown + highlight.js only load on /blog routes,
// keeping them out of the main bundle that every marketing/app page pays for.
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// App + admin pages are lazy-loaded: they carry recharts and authed-only UI that
// marketing/SEO visitors should never download. Each resolves behind the <Suspense>
// boundary below, keeping recharts and admin code out of the main bundle.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Skills = lazy(() => import('./pages/Skills'));
const SkillDetail = lazy(() => import('./pages/SkillDetail'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ActivityReport = lazy(() => import('./pages/ActivityReport'));
const Settings = lazy(() => import('./pages/Settings'));
const Support = lazy(() => import('./pages/Support'));
const TicketDetail = lazy(() => import('./pages/TicketDetail'));
const AdminDashboard = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminUsers })));
const AdminUserDetail = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminUserDetail })));
const AdminSkills = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminSkills })));
const AdminCategories = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminCategories })));
const AdminLearningEvents = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminLearningEvents })));
const AdminPracticeEvents = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminPracticeEvents })));
const AdminTemplates = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminTemplates })));
const AdminTickets = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminTickets })));
const AdminTicketDetail = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminTicketDetail })));
const AdminActivityLogs = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminActivityLogs })));
const AdminPricing = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminPricing })));
const AdminPurchasers = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminPurchasers })));
import { ActivityLoggerWrapper } from './hooks/useActivityLogger';
import RouteTracker from './components/RouteTracker';
import CookieBanner from './components/CookieBanner';

const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
};

// Shown briefly while a lazy route chunk (the blog) loads.
const PageFallback = () => (
  <div className="min-h-screen bg-mesh flex items-center justify-center">
    <div className="status-fresh animate-pulse-slow" aria-label="Loading" />
  </div>
);

function App() {
  return (
    <HelmetProvider>
      {/* Backstop title: any page without its own <title> falls back to this instead of
          showing the previous page's title (the "Sign In" stuck-tab bug). */}
      <Helmet defaultTitle="SkillFade — Skill Decay Tracker" />
      <ThemeProvider>
        <AuthProvider>
          <PlanProvider>
          <OnboardingProvider>
            <BrowserRouter>
              <RouteTracker />
              <CookieBanner />
              <ActivityLoggerWrapper>
              <Suspense fallback={<PageFallback />}>
              <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/home" element={<Landing />} />
              <Route path="/features" element={<Features />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/what-is-learning-decay" element={<WhatIsLearningDecay />} />
              <Route path="/use-cases" element={<UseCases />} />
              <Route path="/comparisons" element={<Comparisons />} />
              <Route path="/compare/anki" element={<CompareAnki />} />
              <Route path="/compare/notion" element={<CompareNotion />} />
              <Route path="/compare/obsidian" element={<CompareObsidian />} />
              <Route path="/learning-vs-practice" element={<LearningVsPractice />} />
              <Route path="/skill-decay-formula" element={<SkillDecayFormula />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/billing/success" element={<BillingSuccess />} />
              <Route path="/billing/error" element={<BillingError />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
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
                <Route
                  path="/support"
                  element={
                    <ProtectedRoute>
                      <Support />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/support/:id"
                  element={
                    <ProtectedRoute>
                      <TicketDetail />
                    </ProtectedRoute>
                  }
                />
              </Route>
              {/* Standalone authenticated routes (no app chrome — print-friendly) */}
              <Route
                path="/reports/activity"
                element={
                  <ProtectedRoute>
                    <ActivityReport />
                  </ProtectedRoute>
                }
              />
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
                <Route
                  path="/admin/tickets"
                  element={
                    <AdminProtectedRoute>
                      <AdminTickets />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tickets/:id"
                  element={
                    <AdminProtectedRoute>
                      <AdminTicketDetail />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/activity-logs"
                  element={
                    <AdminProtectedRoute>
                      <AdminActivityLogs />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/pricing"
                  element={
                    <AdminProtectedRoute>
                      <AdminPricing />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/purchasers"
                  element={
                    <AdminProtectedRoute>
                      <AdminPurchasers />
                    </AdminProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              </ActivityLoggerWrapper>
            </BrowserRouter>
          </OnboardingProvider>
          </PlanProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
