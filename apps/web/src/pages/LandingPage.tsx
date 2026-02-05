import { CommonHeader } from '../components/common/CommonHeader';
import { Hero } from '../components/landing/Hero';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200">
      <div className="relative flex min-h-screen flex-col overflow-x-hidden">
        <div className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
          <CommonHeader showNavigation={false} showUserActions={false} showSearch={false} />
        </div>
        <main className="flex-grow pt-20">
          <Hero />
        </main>
        <Footer />
      </div>
    </div>
  );
}