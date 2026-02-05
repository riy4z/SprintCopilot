import { useState, useEffect } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectCardSkeleton } from "./ProjectCardSkeleton";
import { CommonHeader } from "../common/CommonHeader";
import { useProjects, projectsCacheUtils } from "../../lib/hooks";
import { calculateTrend, getProjectIcon } from "../../lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryClient";

export function ProjectSelectionDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheStatus, setCacheStatus] = useState({
    hasCache: false,
    age: 0,
    isExpired: true,
  });

  const queryClient = useQueryClient();
  const {
    data: projects,
    isLoading,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useProjects();


  useEffect(() => {
    setCacheStatus(projectsCacheUtils.getCacheStatus());
  }, [projects, dataUpdatedAt]);


  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {

      await queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      await refetch();
    } catch (error) {
      console.error("Failed to refresh projects:", error);
    } finally {
      setIsRefreshing(false);
    }
  };


  const formatCacheAge = (ageHours: number) => {
    if (ageHours < 1) {
      const minutes = Math.floor(ageHours * 60);
      return `${minutes}m ago`;
    }
    return `${Math.floor(ageHours)}h ago`;
  };

  const filteredProjects =
    projects?.filter(
      (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.key.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  if (error) {
    return (
      <div className="font-display bg-background-light dark:bg-background-dark text-[#111118] dark:text-white h-screen overflow-hidden transition-colors duration-200">
        <CommonHeader
          searchPlaceholder="Search projects by name or key..."
          showNavigation={true}
        />
        <main className="flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-red-600 dark:text-red-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Unable to Load Projects
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                We couldn't fetch your projects from JIRA. This might be due to
                a network issue or server problem.
              </p>

              {error instanceof Error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-left">
                  <p className="text-sm text-red-800 dark:text-red-200 font-mono">
                    {error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => refetch()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-primary/20 hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Retrying...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                      </svg>
                      Try Again
                    </>
                  )}
                </button>
                {cacheStatus.hasCache && !cacheStatus.isExpired && (
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                    Use Cached Data
                  </button>
                )}
              </div>

              {cacheStatus.hasCache && (
                <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
                  Cached data from {formatCacheAge(cacheStatus.age)} is
                  available
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-[#111118] dark:text-white h-screen overflow-hidden transition-colors duration-200">
      <CommonHeader
        searchPlaceholder="Search projects by name or key..."
        showNavigation={true}
      />

      <main className="flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
        <div className="flex-1 overflow-y-auto">
          <div className="layout-container flex flex-col max-w-[1200px] mx-auto w-full">
            <div className="p-6 pb-2">
              <div className="rounded-xl overflow-hidden relative min-h-[180px] flex flex-col justify-end group shadow-lg">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuClY0U42tJlI0O86aXKaLWMv-qR3xa9Lk7KGtr5t4p8bVDcCLznLLv9N1bSH_CUncUZM-pxBW7c34L7BIgBGLrcLufXZAqx7lGroNfLz4woiOOnMxb1eHpL58emDhqlMyU0uL3apccTgxzA_HK7GxeQIXzZQbU6FSKn3FpLOZkg-CwXhml8nW0Vsel7BrFF5IO23v72grfBqB2oJpfvSr5WMI1BFrLzBvjLJ4y3MxIatXT9QEylUSTlM-mTHwRHY-UttkS4M7PUcxw")`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="relative z-10 p-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-white text-3xl font-bold leading-tight mb-2">
                      Select Project
                    </h2>
                    <p className="text-white/80 text-sm font-medium max-w-md">
                      Choose a JIRA project to manage sprints, analyze velocity,
                      or configure automation rules.
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col gap-2 items-end">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100"
                        height="100"
                        viewBox="0 0 24 24"
                        fill="#ffffffe5"
                      >
                        <path d="M24 5.098a1.35 1.35 0 0 1-1.35 1.35 1.35 1.35 0 0 1-1.352-1.35 1.35 1.35 0 0 1 1.351-1.351A1.35 1.35 0 0 1 24 5.097zM16.549 18.31a2.29 2.29 0 0 1-2.322-2.322H12.2c0 2.449 1.9 4.264 4.306 4.264s4.348-1.857 4.348-4.264H18.87c-.043 1.351-1.056 2.322-2.322 2.322zm5.108-2.828h1.984V7.377h-1.984zM0 15.483h1.984V4H0zm7.135-8.359c-2.449 0-4.307 1.858-4.307 4.264a4.27 4.27 0 0 0 4.307 4.306c2.406 0 4.306-1.858 4.306-4.264S9.583 7.124 7.135 7.124m0 6.628c-1.31 0-2.322-1.013-2.322-2.364a2.29 2.29 0 0 1 2.322-2.322 2.29 2.29 0 0 1 2.321 2.322c0 1.309-.97 2.364-2.321 2.364m13.635-4.77V7.377h-2.828c-.464-.21-.929-.253-1.393-.253-2.449 0-4.348 1.858-4.348 4.306s1.9 4.264 4.306 4.264 4.306-1.858 4.306-4.264c0-.844-.254-1.604-.676-2.195zm-4.221 4.77c-1.309 0-2.322-1.013-2.322-2.364a2.29 2.29 0 0 1 2.322-2.322 2.29 2.29 0 0 1 2.322 2.322c0 1.309-1.056 2.364-2.322 2.364" />
                      </svg>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                      Workspace: Logitech
                    </span>
                    {isLoading && !projects ? (
                      <span className="bg-blue-500/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-blue-400/30 flex items-center gap-1">
                        <svg
                          className="w-3 h-3 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Loading
                      </span>
                    ) : (
                      <>
                        {cacheStatus.hasCache && !isFetching && (
                          <span className="bg-green-500/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-green-400/30">
                            ⚡ Cached
                          </span>
                        )}
                        {isFetching && (
                          <span className="bg-blue-500/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-blue-400/30 flex items-center gap-1">
                            <svg
                              className="w-3 h-3 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Syncing
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between sticky top-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm z-10 border-b border-transparent">
              <div className="w-full md:max-w-md">
                <label className="relative flex items-center w-full h-11">
                  <div className="absolute left-4 text-[#616189] dark:text-[#9ca3af]">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                  </div>
                  <input
                    className="w-full h-full bg-white dark:bg-[#1a1a2e] border border-[#dbdbe6] dark:border-[#2f2f46] rounded-lg pl-12 pr-4 text-sm text-[#111118] dark:text-white placeholder:text-[#616189] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                    placeholder="Search projects by name or key..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                {cacheStatus.hasCache && (
                  <div className="flex h-9 items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                      Cached {formatCacheAge(cacheStatus.age)}
                    </span>
                  </div>
                )}


                {isFetching && !isLoading && (
                  <div className="flex h-9 items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-blue-700 dark:text-blue-300 text-xs font-medium">
                      Updating...
                    </span>
                  </div>
                )}

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || isFetching}
                  className="group cursor-pointer flex h-9 items-center gap-2 rounded-lg bg-white dark:bg-[#1a1a2e] border border-[#dbdbe6] dark:border-[#2f2f46] px-3 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh projects from JIRA"
                >
                  <svg
                    className={`w-4 h-4 text-[#616189] group-hover:text-primary transition-colors ${isRefreshing ? "animate-spin" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                  </svg>
                  <span className="text-[#111118] dark:text-white text-sm font-medium">
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </span>
                </button>
              </div>
            </div>


            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {isLoading && !projects ? (
                <>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ProjectCardSkeleton key={index} />
                  ))}
                </>
              ) : filteredProjects.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <div className="mb-4">
                    <svg
                      className="w-16 h-16 text-slate-300 dark:text-slate-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-2">
                    No projects found
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">
                    {projects?.length === 0
                      ? "No projects available in JIRA."
                      : "Try adjusting your search."}
                  </p>
                </div>
              ) : (
                filteredProjects.map((project) => {
                  const trendInfo = calculateTrend(project.sprintGraph);

                  const iconInfo = getProjectIcon(project.name, project.key);

                  return (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      name={project.name}
                      code={project.key}
                      teamSize={project.teamSize}
                      velocity={project.velocity}
                      trendDirection={trendInfo.direction}
                      trendPercentage={trendInfo.percentage}
                      icon={project.avatarUrls["48x48"]}
                      iconBg={iconInfo.iconBg}
                      iconColor={iconInfo.iconColor}
                      sparklineColor={iconInfo.sparklineColor}
                      sparklinePath={trendInfo.sparklinePath}
                      category={project.Category ? project.Category : null}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
