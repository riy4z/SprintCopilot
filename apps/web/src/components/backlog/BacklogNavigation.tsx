import { Link } from 'react-router-dom';

export function BacklogNavigation() {
  return (
    <header className="flex flex-none items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-3 z-20">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3 text-slate-900 dark:text-white">
          <div className="size-8 flex items-center justify-center rounded bg-primary/10 text-primary">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="m15.41 16.58-4.24-4.24 1.41-1.41 4.24 4.24-1.41 1.41ZM8.21 13.89l1.41 1.41 4.24-4.24-1.41-1.41-4.24 4.24ZM15.5 4l1.5 1.5-8.5 8.5L6 12.5 15.5 4Z"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">Sprint CoPilot AI</h2>
        </Link>

        {/* Search Bar */}
        <label className="hidden md:flex flex-col w-64 h-10">
          <div className="flex w-full flex-1 items-center rounded-lg bg-slate-100 dark:bg-slate-900 px-3 border border-transparent focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 ml-2"
              placeholder="Search issues..."
            />
          </div>
        </label>
      </div>

      <div className="flex items-center gap-6">
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
          >
            Dashboard
          </Link>
          <span className="text-primary text-sm font-medium">
            Backlog
          </span>
          <a
            href="#"
            className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
          >
            Sprints
          </a>
          <a
            href="#"
            className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
          >
            Reports
          </a>
        </nav>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
          </button>
          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border border-slate-200 dark:border-slate-700">
            RA
          </div>
        </div>
      </div>
    </header>
  );
}