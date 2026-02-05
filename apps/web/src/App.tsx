import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { initializeCacheManager } from './lib/cacheManager';
import { ProjectProvider } from './lib/projectContext';
import { ToastProvider } from './context/toastContext';
import { ToastContainer } from './components/common/Toast';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { BacklogPage } from './pages/BacklogPage';
import { AISprintPlanPage } from './pages/AISprintPlanPage';
import { DependencyPage } from './pages/DependencyPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  initializeCacheManager();

  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/backlog/:projectCode" element={<BacklogPage />} />
              <Route path="/dependencies/:projectCode" element={<DependencyPage />} />
              <Route path="/plan/sprint" element={<AISprintPlanPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
          <ToastContainer />
          <ReactQueryDevtools initialIsOpen={false} />
        </ToastProvider>
      </ProjectProvider>
    </QueryClientProvider>
  );
}

export default App
