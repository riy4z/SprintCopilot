export function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-[#1a1a2e] rounded-xl border border-[#dbdbe6] dark:border-[#2f2f46] p-5 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="size-12 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0"></div>
          <div className="flex-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
            <div className="flex gap-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
            </div>
          </div>
        </div>
        <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-2 p-2 rounded-lg bg-background-light dark:bg-[#252540]/50">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
        </div>
        <div className="flex flex-col gap-2 p-2 rounded-lg bg-background-light dark:bg-[#252540]/50">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-end mb-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
        </div>
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      </div>
    </div>
  );
}
