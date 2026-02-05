interface StoryPointsRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketsWithoutPoints: number;
  totalTickets: number;
  onAutoFillPoints: () => void;
  onCancel: () => void;
}

export function StoryPointsRequiredModal({
  isOpen,
  onClose,
  ticketsWithoutPoints,
  totalTickets,
  onAutoFillPoints,
  onCancel
}: StoryPointsRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 transition-opacity duration-300" />

      <div className="fixed inset-0 z-61 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-[#dbdbe6] dark:border-white/10 shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111118] dark:text-white">Story Points Required</h3>
                <p className="text-sm text-[#616189]">AI auto-selection needs story points to work effectively</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-4">
                <p className="text-sm text-[#111118] dark:text-white mb-3">
                  For AI to automatically select the best tickets for your sprint, all tickets need story points for capacity planning.
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#616189]">Total backlog tickets:</span>
                    <span className="font-medium text-[#111118] dark:text-white">{totalTickets}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#616189]">Missing story points:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">{ticketsWithoutPoints}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5z"/>
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">AI-Powered Estimation</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Our AI will analyze ticket complexity, description, and historical data to generate accurate story point estimates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onAutoFillPoints}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-primary/20 hover:shadow-lg font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5z"/>
                </svg>
                Estimate Points
              </button>

              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
              You can also manually add story points and then return to sprint planning.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}