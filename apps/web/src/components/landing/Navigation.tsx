import { Link } from 'react-router-dom';

export function Navigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
            ⚡
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            SprintCoPilot
          </span>
        </Link>


        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors">
            Login
          </button>
          <Link
            to="/dashboard"
            className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-primary/30">
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  )
}