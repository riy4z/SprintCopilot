export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-8 dark:border-slate-800 dark:bg-background-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
                <div className="size-6">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V44Z" fill="#1111d4" fill-rule="evenodd"></path>
                </svg>
                </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">Sprint Copilot</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
              The intelligent assistant for modern agile teams. Integrate seamlessly with your existing tools powered by LogiQ.
            </p>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-8 gap-4">
          <p className="text-sm text-slate-500">© 2026 SprintFlow AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a className="hover:text-slate-900 dark:hover:text-white" href="#">Privacy Policy</a>
            <a className="hover:text-slate-900 dark:hover:text-white" href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}