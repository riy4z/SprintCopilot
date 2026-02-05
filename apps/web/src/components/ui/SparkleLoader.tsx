import React from 'react';

interface SparkleLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'inline';
  showText?: boolean;
  text?: string;
  className?: string;
}

export const SparkleLoader: React.FC<SparkleLoaderProps> = ({
  size = 'lg',
  variant = 'default',
  showText = false,
  text = 'AI',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const sparkleSize = {
    sm: { main: 'text-xs', secondary: 'text-[8px]' },
    md: { main: 'text-sm', secondary: 'text-xs' },
    lg: { main: 'text-lg', secondary: 'text-sm' }
  };

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
          {/* Simplified sparkle for compact spaces */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse" style={{animationDuration: '1.2s'}}>
              <svg fill="#a855f7" width="12px" height="12px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
                <path d="M 26.6875 12.6602 C 26.9687 12.6602 27.1094 12.4961 27.1797 12.2383 C 27.9062 8.3242 27.8594 8.2305 31.9375 7.4570 C 32.2187 7.4102 32.3828 7.2461 32.3828 6.9648 C 32.3828 6.6836 32.2187 6.5195 31.9375 6.4726 C 27.8828 5.6524 28.0000 5.5586 27.1797 1.6914 C 27.1094 1.4336 26.9687 1.2695 26.6875 1.2695 C 26.4062 1.2695 26.2656 1.4336 26.1953 1.6914 C 25.3750 5.5586 25.5156 5.6524 21.4375 6.4726 C 21.1797 6.5195 20.9922 6.6836 20.9922 6.9648 C 20.9922 7.2461 21.1797 7.4102 21.4375 7.4570 C 25.5156 8.2774 25.4687 8.3242 26.1953 12.2383 C 26.2656 12.4961 26.4062 12.6602 26.6875 12.6602 Z"/>
              </svg>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center ml-2">
            <div className="animate-pulse" style={{animationDelay: '0.5s', animationDuration: '1.5s'}}>
              <svg fill="#60a5fa" width="8px" height="8px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0l2.5 7.5L22 10l-7.5 2.5L12 20l-2.5-7.5L2 10l7.5-2.5z"/>
              </svg>
            </div>
          </div>
          {/* Pulsing background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full animate-pulse"
                 style={{animationDuration: '2s'}}></div>
          </div>
        </div>
        {showText && (
          <span className="ml-2 text-xs font-medium text-purple-600 dark:text-purple-300 animate-pulse"
                style={{animationDuration: '2s'}}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center justify-center px-2 py-1 rounded bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 ${className}`}>
        <div className="relative w-4 h-4 flex items-center justify-center mr-1">
          <svg fill="yellow" width="10px" height="10px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 26.6875 12.6602 C 26.9687 12.6602 27.1094 12.4961 27.1797 12.2383 C 27.9062 8.3242 27.8594 8.2305 31.9375 7.4570 C 32.2187 7.4102 32.3828 7.2461 32.3828 6.9648 C 32.3828 6.6836 32.2187 6.5195 31.9375 6.4726 C 27.8828 5.6524 28.0000 5.5586 27.1797 1.6914 C 27.1094 1.4336 26.9687 1.2695 26.6875 1.2695 C 26.4062 1.2695 26.2656 1.4336 26.1953 1.6914 C 25.3750 5.5586 25.5156 5.6524 21.4375 6.4726 C 21.1797 6.5195 20.9922 6.6836 20.9922 6.9648 C 20.9922 7.2461 21.1797 7.4102 21.4375 7.4570 C 25.5156 8.2774 25.4687 8.3242 26.1953 12.2383 C 26.2656 12.4961 26.4062 12.6602 26.6875 12.6602 Z M 15.3438 28.7852 C 15.7891 28.7852 16.0938 28.5039 16.1406 28.0821 C 16.9844 21.8242 17.1953 21.8242 23.6641 20.5821 C 24.0860 20.5117 24.3906 20.2305 24.3906 19.7852 C 24.3906 19.3633 24.0860 19.0586 23.6641 18.9883 C 17.1953 18.0977 16.9609 17.8867 16.1406 11.5117 C 16.0938 11.0899 15.7891 10.7852 15.3438 10.7852 C 14.9219 10.7852 14.6172 11.0899 14.5703 11.5352 C 13.7969 17.8164 13.4687 17.7930 7.0469 18.9883 C 6.6250 19.0821 6.3203 19.3633 6.3203 19.7852 C 6.3203 20.2539 6.6250 20.5117 7.1406 20.5821 C 13.5156 21.6133 13.7969 21.7774 14.5703 28.0352 C 14.6172 28.5039 14.9219 28.7852 15.3438 28.7852 Z M 31.2344 54.7305 C 31.8438 54.7305 32.2891 54.2852 32.4062 53.6524 C 34.0703 40.8086 35.8750 38.8633 48.5781 37.4570 C 49.2344 37.3867 49.6797 36.8945 49.6797 36.2852 C 49.6797 35.6758 49.2344 35.2070 48.5781 35.1133 C 35.8750 33.7070 34.0703 31.7617 32.4062 18.9180 C 32.2891 18.2852 31.8438 17.8633 31.2344 17.8633 C 30.6250 17.8633 30.1797 18.2852 30.0860 18.9180 C 28.4219 31.7617 26.5938 33.7070 13.9140 35.1133 C 13.2344 35.2070 12.7891 35.6758 12.7891 36.2852 C 12.7891 36.8945 13.2344 37.3867 13.9140 37.4570 C 26.5703 39.1211 28.3281 40.8321 30.0860 53.6524 C 30.1797 54.2852 30.6250 54.7305 31.2344 54.7305 Z"/></svg>
          <div className="absolute ml-1 animate-pulse" style={{animationDelay: '0.3s'}}>
            <svg fill="#60a5fa" width="6px" height="6px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0l2.5 7.5L22 10l-7.5 2.5L12 20l-2.5-7.5L2 10l7.5-2.5z"/>
            </svg>
          </div>
        </div>
        <span className="text-xs font-medium text-purple-600 dark:text-purple-300 animate-pulse">
          {text}
        </span>
      </div>
    );
  }

  // Default variant - full sparkle animation
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Enhanced sparkle animation with floating effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Main sparkle */}
            <div className="absolute top-0 left-2 animate-pulse" style={{animationDuration: '1.2s'}}>
                        <svg fill="yellow" width="10px" height="10px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 26.6875 12.6602 C 26.9687 12.6602 27.1094 12.4961 27.1797 12.2383 C 27.9062 8.3242 27.8594 8.2305 31.9375 7.4570 C 32.2187 7.4102 32.3828 7.2461 32.3828 6.9648 C 32.3828 6.6836 32.2187 6.5195 31.9375 6.4726 C 27.8828 5.6524 28.0000 5.5586 27.1797 1.6914 C 27.1094 1.4336 26.9687 1.2695 26.6875 1.2695 C 26.4062 1.2695 26.2656 1.4336 26.1953 1.6914 C 25.3750 5.5586 25.5156 5.6524 21.4375 6.4726 C 21.1797 6.5195 20.9922 6.6836 20.9922 6.9648 C 20.9922 7.2461 21.1797 7.4102 21.4375 7.4570 C 25.5156 8.2774 25.4687 8.3242 26.1953 12.2383 C 26.2656 12.4961 26.4062 12.6602 26.6875 12.6602 Z M 15.3438 28.7852 C 15.7891 28.7852 16.0938 28.5039 16.1406 28.0821 C 16.9844 21.8242 17.1953 21.8242 23.6641 20.5821 C 24.0860 20.5117 24.3906 20.2305 24.3906 19.7852 C 24.3906 19.3633 24.0860 19.0586 23.6641 18.9883 C 17.1953 18.0977 16.9609 17.8867 16.1406 11.5117 C 16.0938 11.0899 15.7891 10.7852 15.3438 10.7852 C 14.9219 10.7852 14.6172 11.0899 14.5703 11.5352 C 13.7969 17.8164 13.4687 17.7930 7.0469 18.9883 C 6.6250 19.0821 6.3203 19.3633 6.3203 19.7852 C 6.3203 20.2539 6.6250 20.5117 7.1406 20.5821 C 13.5156 21.6133 13.7969 21.7774 14.5703 28.0352 C 14.6172 28.5039 14.9219 28.7852 15.3438 28.7852 Z M 31.2344 54.7305 C 31.8438 54.7305 32.2891 54.2852 32.4062 53.6524 C 34.0703 40.8086 35.8750 38.8633 48.5781 37.4570 C 49.2344 37.3867 49.6797 36.8945 49.6797 36.2852 C 49.6797 35.6758 49.2344 35.2070 48.5781 35.1133 C 35.8750 33.7070 34.0703 31.7617 32.4062 18.9180 C 32.2891 18.2852 31.8438 17.8633 31.2344 17.8633 C 30.6250 17.8633 30.1797 18.2852 30.0860 18.9180 C 28.4219 31.7617 26.5938 33.7070 13.9140 35.1133 C 13.2344 35.2070 12.7891 35.6758 12.7891 36.2852 C 12.7891 36.8945 13.2344 37.3867 13.9140 37.4570 C 26.5703 39.1211 28.3281 40.8321 30.0860 53.6524 C 30.1797 54.2852 30.6250 54.7305 31.2344 54.7305 Z"/></svg>

            </div>
            {/* Secondary sparkles */}
            <div className="absolute -top-1 right-0 animate-pulse" style={{animationDelay: '0.4s', animationDuration: '1.8s'}}>
              <svg fill="#fde047" width={size === 'lg' ? '12px' : '8px'} height={size === 'lg' ? '12px' : '8px'} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0l2.5 7.5L22 10l-7.5 2.5L12 20l-2.5-7.5L2 10l7.5-2.5z"/>
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 animate-pulse" style={{animationDelay: '0.8s', animationDuration: '1.5s'}}>
              <svg fill="#f472b6" width={size === 'lg' ? '10px' : '8px'} height={size === 'lg' ? '10px' : '8px'} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l2.5 7.5h7.5l-6 4.5 2.3 7.5L12 17l-6.3 4.5 2.3-7.5-6-4.5h7.5z"/>
              </svg>
            </div>
            <div className="absolute top-1 right-2 animate-pulse" style={{animationDelay: '1.2s', animationDuration: '2s'}}>
              <svg fill="#67e8f9" width={size === 'lg' ? '8px' : '6px'} height={size === 'lg' ? '8px' : '6px'} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
              </svg>
            </div>
            {/* Floating motion effect */}
            <div className="absolute -bottom-1 left-1 animate-bounce" style={{animationDelay: '0.3s', animationDuration: '2.5s'}}>
              <svg fill="#a78bfa" opacity="0.7" width={size === 'lg' ? '6px' : '4px'} height={size === 'lg' ? '6px' : '4px'} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0l1.5 4.5L14 6l-4.5 1.5L8 12l-1.5-4.5L2 6l4.5-1.5z"/>
              </svg>
            </div>
          </div>
        </div>
        {/* Pulsing background circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full animate-ping" style={{animationDuration: '2s'}}></div>
        </div>
        {/* Central glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full animate-pulse" style={{animationDuration: '3s'}}></div>
        </div>
      </div>
      {showText && (
        <span className="ml-3 text-sm font-medium text-purple-600 dark:text-purple-300 animate-pulse"
              style={{animationDuration: '2s'}}>
          {text}
        </span>
      )}
    </div>
  );
};

// CSS-in-JS alternative for more advanced sparkle effects
export const SparkleLoaderWithCSS: React.FC<SparkleLoaderProps> = ({
  size = 'md',
  className = '',
  showText = false,
  text = 'Predicting...'
}) => {
  return (
    <div className={`sparkle-loader ${className}`}>
      <style jsx>{`
        .sparkle-loader {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sparkle-container {
          position: relative;
          ${size === 'sm' ? 'width: 20px; height: 20px;' : ''}
          ${size === 'md' ? 'width: 32px; height: 32px;' : ''}
          ${size === 'lg' ? 'width: 48px; height: 48px;' : ''}
        }

        .sparkle {
          position: absolute;
          animation: sparkle 2s ease-in-out infinite;
        }

        .sparkle:nth-child(1) { animation-delay: 0s; top: 0; left: 50%; transform: translateX(-50%); }
        .sparkle:nth-child(2) { animation-delay: 0.4s; top: 20%; right: 0; }
        .sparkle:nth-child(3) { animation-delay: 0.8s; bottom: 0; left: 0; }
        .sparkle:nth-child(4) { animation-delay: 1.2s; top: 50%; right: 10%; }
        .sparkle:nth-child(5) { animation-delay: 1.6s; bottom: 10%; left: 50%; transform: translateX(-50%); }

        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }

        .sparkle-text {
          margin-left: 12px;
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="sparkle-container">
        <div className="sparkle">
          <svg fill="#a855f7" width="12px" height="12px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
            <path d="M 26.6875 12.6602 C 26.9687 12.6602 27.1094 12.4961 27.1797 12.2383 C 27.9062 8.3242 27.8594 8.2305 31.9375 7.4570 C 32.2187 7.4102 32.3828 7.2461 32.3828 6.9648 C 32.3828 6.6836 32.2187 6.5195 31.9375 6.4726 C 27.8828 5.6524 28.0000 5.5586 27.1797 1.6914 C 27.1094 1.4336 26.9687 1.2695 26.6875 1.2695 C 26.4062 1.2695 26.2656 1.4336 26.1953 1.6914 C 25.3750 5.5586 25.5156 5.6524 21.4375 6.4726 C 21.1797 6.5195 20.9922 6.6836 20.9922 6.9648 C 20.9922 7.2461 21.1797 7.4102 21.4375 7.4570 C 25.5156 8.2774 25.4687 8.3242 26.1953 12.2383 C 26.2656 12.4961 26.4062 12.6602 26.6875 12.6602 Z"/>
          </svg>
        </div>
        <div className="sparkle">
          <svg fill="#fde047" width="10px" height="10px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0l2.5 7.5L22 10l-7.5 2.5L12 20l-2.5-7.5L2 10l7.5-2.5z"/>
          </svg>
        </div>
        <div className="sparkle">
          <svg fill="#f472b6" width="8px" height="8px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l2.5 7.5h7.5l-6 4.5 2.3 7.5L12 17l-6.3 4.5 2.3-7.5-6-4.5h7.5z"/>
          </svg>
        </div>
        <div className="sparkle">
          <svg fill="#67e8f9" width="6px" height="6px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 1l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
          </svg>
        </div>
        <div className="sparkle">
          <svg fill="#a78bfa" width="4px" height="4px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0l1.5 4.5L14 6l-4.5 1.5L8 12l-1.5-4.5L2 6l4.5-1.5z"/>
          </svg>
        </div>
      </div>

      {showText && (
        <span className="sparkle-text text-sm font-medium text-purple-600 dark:text-purple-300">
          {text}
        </span>
      )}
    </div>
  );
};