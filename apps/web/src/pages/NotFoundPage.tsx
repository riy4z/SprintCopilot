import { Link, useNavigate } from 'react-router-dom';
import { CommonHeader } from '@/components/common/CommonHeader';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-[#111118] dark:text-white h-screen overflow-hidden transition-colors duration-200 flex flex-col">
      <CommonHeader showSearch={false} showNavigation={false} />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-2xl">

          <div className="mb-8 relative">
            <div className="text-[180px] font-black text-slate-200 dark:text-slate-800 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-32 h-32 text-primary opacity-20 animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 font-medium"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Go Back
            </button>

            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              Go to Dashboard
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Popular pages:
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/dashboard"
                className="text-sm text-primary hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Projects
              </Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <Link
                to="/plan/sprint"
                className="text-sm text-primary hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sprint Planning
              </Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <Link
                to="/reports"
                className="text-sm text-primary hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Reports
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
