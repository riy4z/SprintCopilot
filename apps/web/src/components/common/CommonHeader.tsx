import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelectedProject } from "@/lib/projectContext";
import { useProjects } from "@/lib/hooks";

interface CommonHeaderProps {
  showSearch?: boolean;
  showNavigation?: boolean;
  showUserActions?: boolean;
  searchPlaceholder?: string;
}

export function CommonHeader({
  showNavigation = true,
  showUserActions = true,
}: CommonHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedProject, setSelectedProject } = useSelectedProject();
  const { data: projects } = useProjects();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActivePage = (path: string) => {
    return location.pathname.includes(path);
  };

  const isNotLandingPage = location.pathname !== "/";
  const isDashBoard = location.pathname === "/dashboard";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProjectChange = (project: any) => {
    setSelectedProject({
      id: project.id,
      key: project.key,
      name: project.name,
      avatarUrls: project.avatarUrls,
    });
    setIsDropdownOpen(false);
  };

  const handleBacklogNavigation = (e: React.MouseEvent) => {
    if (selectedProject) {
      e.preventDefault();
      navigate(`/backlog/${selectedProject.key.toLowerCase()}`);
    } else {
      e.preventDefault();
      navigate("/dashboard");
    }
  };

  return (
    <header className="flex flex-none items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-3 z-20">
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="flex items-center gap-3 text-slate-900 dark:text-white"
        >
          <div className="size-8">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V44Z"
                fill="#1111d4"
                fill-rule="evenodd"
              ></path>
            </svg>
          </div>
          <div className="flex flex-col flex-start">
            <h2 className="text-lg font-bold leading-tight tracking-tight">
              SprintCopilot
            </h2>

          </div>
        </Link>

        {/* Navigation */}
        {showNavigation && (
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors ${
                isActivePage("/dashboard")
                  ? "text-primary"
                  : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to={
                selectedProject
                  ? `/backlog/${selectedProject.key.toLowerCase()}`
                  : "/dashboard"
              }
              onClick={handleBacklogNavigation}
              className={`text-sm font-medium transition-colors ${
                isActivePage("/backlog")
                  ? "text-primary"
                  : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary"
              }`}
            >
              Backlog
            </Link>
            <Link
              to="/plan/sprint"
              className={`text-sm font-medium transition-colors ${
                isActivePage("/plan/sprint")
                  ? "text-primary"
                  : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary"
              }`}
            >
              Sprints
            </Link>
            <Link
              to="/reports"
              className={`text-sm font-medium transition-colors ${
                isActivePage("/reports")
                  ? "text-primary"
                  : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary"
              }`}
            >
              Reports
            </Link>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          {showNavigation && selectedProject && isNotLandingPage && !isDashBoard && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg border border-[#dbdbe6] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors h-[38px]"
              >
                <img
                  src={selectedProject.avatarUrls["48x48"]}
                  alt={selectedProject.name}
                  className="w-5 h-5 rounded flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="flex flex-col items-start justify-center min-w-0 max-w-[120px]">
                  <span className="text-xs font-medium text-slate-900 dark:text-white truncate w-full leading-tight">
                    {selectedProject.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {selectedProject.key}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>

              {isDropdownOpen && projects &&   (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-96 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Switch Project
                    </p>
                  </div>
                  <div className="p-2">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectChange(project)}
                        className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-left ${
                          selectedProject.id === project.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                        }`}
                      >
                        <img
                          src={project.avatarUrls["48x48"]}
                          alt={project.name}
                          loading="lazy"
                          className="w-8 h-8 rounded flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <div className="flex flex-col items-start flex-1 min-w-0">
                          <span className="text-sm font-medium truncate w-full leading-tight">
                            {project.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                            {project.key}
                          </span>
                        </div>
                        {selectedProject.id === project.id && (
                          <svg
                            className="w-5 h-5 text-primary flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isNotLandingPage &&(
            <button className="flex cursor-pointer items-center justify-center gap-2 border border-[#dbdbe6] bg-white dark:bg-slate-800 dark:border-slate-700 text-[#111118] dark:text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors h-[38px]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
              </svg>
              <span className="hidden md:block">Sync</span>
            </button>
          )}
        </div>

        {/* User Actions */}
        {showUserActions && (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border border-slate-200 dark:border-slate-700">
              RA
            </div>
          </div>
        )}

        {!showUserActions && (
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-primary/30"
            >
              Dashboard
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
