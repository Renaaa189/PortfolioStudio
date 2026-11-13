import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { AdminLayout } from './components/layout/AdminLayout.jsx';
import { Loader } from './components/ui/States.jsx';
import LandingPage from './pages/public/LandingPage.jsx';
import PublicPortfolioPage from './pages/public/PublicPortfolioPage.jsx';
import LoginPage from './pages/public/LoginPage.jsx';
import RegisterPage from './pages/public/RegisterPage.jsx';
import NotFoundPage from './pages/public/NotFoundPage.jsx';

const DashboardPage = lazy(() => import('./pages/admin/DashboardPage.jsx'));
const ProjectsPage = lazy(() => import('./pages/admin/ProjectsPage.jsx'));
const SkillsPage = lazy(() => import('./pages/admin/SkillsPage.jsx'));
const CertificatesPage = lazy(() => import('./pages/admin/CertificatesPage.jsx'));
const ProfilePage = lazy(() => import('./pages/admin/ProfilePage.jsx'));
const PreviewPage = lazy(() => import('./pages/admin/PreviewPage.jsx'));
const DesignPage = lazy(() => import('./pages/admin/DesignPage.jsx'));

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/p/:username" element={<PublicPortfolioPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="design" element={<DesignPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
        <Route
          path="/admin/preview"
          element={
            <ProtectedRoute>
              <PreviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
