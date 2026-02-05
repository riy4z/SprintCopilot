import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { jira } from "../../lib";

export function Hero() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get("auth_success");
    const authStatus = urlParams.get("status");

    if (
      authSuccess === "true" ||
      authStatus === "success" ||
      urlParams.get("code")
    ) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleConnect = (e: React.MouseEvent) => {
    e.preventDefault();
    jira.connectJira();
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32">
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px] dark:bg-primary/10"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* hero */}
          <div className="flex flex-col max-w-2xl lg:w-1/2 text-center lg:text-left gap-6">
            <div className="inline-flex items-center gap-2 self-center lg:self-start rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              New: JIRA Cloud Integration Live
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Automate Sprint <br className="hidden lg:block" />
              Planning with <span className="text-gradient">AI</span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Seamlessly integrate with JIRA to predict velocity, auto-assign
              tasks based on capacity, and clear backlogs in seconds. Save 50%
              of your planning time.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start pt-2">
              <button
                onClick={handleConnect}
                className="cursor-pointer h-12 w-full sm:w-auto min-w-[160px] rounded-lg bg-primary px-6 text-base font-bold text-white shadow-lg shadow-primary/25 hover:bg-blue-700 transition-all hover:-translate-y-0.5 flex items-center justify-center"
              >
                Connect JIRA
              </button>
              <button className="h-12 w-full sm:w-auto min-w-[160px] flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 text-base font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 transition-all">
                ▶ View Demo
              </button>
            </div>

            <div className="pt-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Trusted by engineering teams at
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-1 font-bold text-slate-500 text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="60"
                    height="60"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 5.098a1.35 1.35 0 0 1-1.35 1.35 1.35 1.35 0 0 1-1.352-1.35 1.35 1.35 0 0 1 1.351-1.351A1.35 1.35 0 0 1 24 5.097zM16.549 18.31a2.29 2.29 0 0 1-2.322-2.322H12.2c0 2.449 1.9 4.264 4.306 4.264s4.348-1.857 4.348-4.264H18.87c-.043 1.351-1.056 2.322-2.322 2.322zm5.108-2.828h1.984V7.377h-1.984zM0 15.483h1.984V4H0zm7.135-8.359c-2.449 0-4.307 1.858-4.307 4.264a4.27 4.27 0 0 0 4.307 4.306c2.406 0 4.306-1.858 4.306-4.264S9.583 7.124 7.135 7.124m0 6.628c-1.31 0-2.322-1.013-2.322-2.364a2.29 2.29 0 0 1 2.322-2.322 2.29 2.29 0 0 1 2.321 2.322c0 1.309-.97 2.364-2.321 2.364m13.635-4.77V7.377h-2.828c-.464-.21-.929-.253-1.393-.253-2.449 0-4.348 1.858-4.348 4.306s1.9 4.264 4.306 4.264 4.306-1.858 4.306-4.264c0-.844-.254-1.604-.676-2.195zm-4.221 4.77c-1.309 0-2.322-1.013-2.322-2.364a2.29 2.29 0 0 1 2.322-2.322 2.29 2.29 0 0 1 2.322 2.322c0 1.309-1.056 2.364-2.322 2.364" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 font-bold text-slate-500 text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="60"
                    height="60"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#90f5d1"
                      d="M6,10c0-2.2,1.8-4,4-4h28c2.2,0,4,1.8,4,4v28c0,2.2-1.8,4-4,4H10c-2.2,0-4-1.8-4-4V10z"
                    ></path>
                    <path
                      fill="#212121"
                      d="M29.654,18.245h-8.096c-2.761,0-5,2.239-5,5v7.415c0,1.657,1.343,3,3,3h11.096c2.209,0,4-1.791,4-4 v-6.415C34.654,20.483,32.416,18.245,29.654,18.245z M25.606,28.633c0,0.696-0.564,1.261-1.261,1.261l0,0 c-0.696,0-1.261-0.564-1.261-1.261v-2.809c0-0.696,0.564-1.261,1.261-1.261l0,0c0.696,0,1.261,0.564,1.261,1.261V28.633z M30.777,28.633c0,0.696-0.564,1.261-1.261,1.261l0,0c-0.696,0-1.261-0.564-1.261-1.261v-2.809c0-0.696,0.564-1.261,1.261-1.261 l0,0c0.696,0,1.261,0.564,1.261,1.261V28.633z"
                    ></path>
                    <path
                      fill="#212121"
                      d="M12.938,22.907c-0.043,0-0.087-0.003-0.131-0.007c-0.685-0.072-1.183-0.682-1.114-1.367 c0.269-2.658,2.33-7.794,8.209-8.206c0.692-0.049,1.286,0.471,1.334,1.16c0.048,0.688-0.471,1.285-1.16,1.334 c-5.23,0.366-5.873,5.739-5.897,5.968C14.11,22.43,13.568,22.907,12.938,22.907z"
                    ></path>
                  </svg>
                </div>
                <div className="flex items-center gap-1 font-bold text-slate-500 text-lg">
                  <a
                    title="Baltic Latvian Universal Electronics, LLC, Public domain, via Wikimedia Commons"
                    href="https://commons.wikimedia.org/wiki/File:Logo_Blue_Microphones.svg"
                  >
                    <img
                      width="60"
                      alt="Logo Blue Microphones"
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Logo_Blue_Microphones.svg/512px-Logo_Blue_Microphones.svg.png?20231115100113"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>


          <div className="lg:w-1/2 w-full relative perspective-1000 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden transform transition-transform duration-500 hover:scale-[1.01]">
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                <div className="h-3 w-3 rounded-full bg-green-400"></div>
                <div className="ml-4 h-6 flex-1 rounded-md bg-white shadow-sm border border-slate-100 text-xs flex items-center px-2 text-slate-400 dark:bg-slate-800 dark:border-slate-700">
                  sprintcopilot.ai/dashboard
                </div>
              </div>

              <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6">
                <div className="h-full w-full bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Dashboard
                    </h3>
                    <div className="text-xs text-slate-500">Sprint 24</div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-xs text-slate-600 dark:text-slate-400">
                        Backend
                      </div>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "65%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-xs text-slate-600 dark:text-slate-400">
                        Frontend
                      </div>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-xs text-slate-600 dark:text-slate-400">
                        Testing
                      </div>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                    </div>
                  </div>


                  <div className="flex items-center justify-center">
                    <button className="px-4 py-2 bg-primary text-white text-xs rounded-lg font-medium">
                      Auto-Assign
                    </button>
                  </div>
                </div>


                <div
                  className="absolute top-1/4 -right-4 md:-right-8 animate-bounce"
                  style={{ animationDuration: "3s" }}
                >
                  <div className="flex flex-col gap-2 rounded-lg border border-white/20 bg-white/90 p-3 shadow-xl backdrop-blur-md dark:bg-slate-900/90 max-w-[180px]">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-green-100 p-1 text-green-600 dark:bg-green-900/30">
                        📈
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        Velocity +12%
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Team is outpacing predicted capacity.
                    </p>
                  </div>
                </div>


                <div
                  className="absolute bottom-1/4 -left-4 md:-left-8 animate-bounce"
                  style={{ animationDuration: "4s", animationDelay: "1s" }}
                >
                  <div className="flex flex-col gap-2 rounded-lg border border-white/20 bg-white/90 p-3 shadow-xl backdrop-blur-md dark:bg-slate-900/90 max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary/10 p-1 text-primary">
                        ✨
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        Auto-Assign
                      </p>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-primary"></div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Sprint backlog optimized.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
