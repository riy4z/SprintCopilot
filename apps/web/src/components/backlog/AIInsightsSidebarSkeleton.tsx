export function AIInsightsSidebarSkeleton() {
  return (
    <aside className="hidden lg:flex lg:w-[380px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-background-light dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto flex-col shadow-xl z-20">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-10 animate-pulse"></div>
      </div>

      <div className="p-6 space-y-6">
        {/* Health Score Card Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2 animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-8 animate-pulse"></div>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-8 mx-auto mb-1 animate-pulse"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Progress bars */}
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues Section Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mt-1 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations Section Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mt-1 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dependencies Section Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
            </div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
          </div>

          {/* Dependency items */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-1 animate-pulse"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
          </div>

          {/* Chat messages skeleton */}
          <div className="space-y-3 mb-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-1 animate-pulse"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Input field skeleton */}
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}