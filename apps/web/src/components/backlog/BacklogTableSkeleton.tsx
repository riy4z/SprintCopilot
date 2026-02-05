export function BacklogTableSkeleton() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
      <div className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-6">
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed" style={{ minWidth: '800px', width: '100%' }}>
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-2 sm:px-4 py-3" style={{ width: '50px' }}>
                    <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </th>
                  <th className="px-2 sm:px-4 py-3" style={{ width: '120px' }}>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                  </th>
                  <th className="px-2 sm:px-4 py-3" style={{ width: '70px' }}>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
                  </th>
                  <th className="px-2 sm:px-4 py-3" style={{ width: '350px' }}>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                  </th>
                  <th className="px-2 sm:px-4 py-3" style={{ width: '90px' }}>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                  </th>
                  <th className="px-2 sm:px-4 py-3" style={{ width: '80px' }}>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
                  </th>
                  <th className="px-2 sm:px-4 py-3" style={{ width: '110px' }}>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-14 animate-pulse"></div>
                  </th>
                  <th className="px-2 sm:px-4 py-3" style={{ width: '150px' }}>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-18 animate-pulse"></div>
                  </th>
                </tr>
              </thead>


              <tbody>
                {Array.from({ length: 20 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >

                    <td className="px-2 sm:px-4 py-3">
                      <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </td>

                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                      </div>
                    </td>


                    <td className="px-2 sm:px-4 py-3">
                      <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </td>

                    <td className="px-2 sm:px-4 py-3">
                      <div className="space-y-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </td>


                    <td className="px-2 sm:px-4 py-3">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16 animate-pulse"></div>
                    </td>


                    <td className="px-2 sm:px-4 py-3">
                      <div className="w-8 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto"></div>
                    </td>


                    <td className="px-2 sm:px-4 py-3">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                    </td>


                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}