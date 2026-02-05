import { Link } from "react-router-dom";
import { useState } from "react";
import { useExtractColors } from 'react-extract-colors';
import { useSelectedProject } from '@/lib/projectContext';

interface ProjectCardProps {
  name: string;
  code: string;
  teamSize: number;
  velocity: number;
  trendDirection: "up" | "down" | "flat";
  trendPercentage: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  sparklineColor: string;
  sparklinePath: string;
  category: string | null;
  id?: string;
}

export function ProjectCard({
  name,
  code,
  teamSize,
  velocity,
  trendDirection,
  trendPercentage,
  icon,
  sparklinePath,
  category,
  id,
}: ProjectCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { setSelectedProject } = useSelectedProject();

  const { dominantColor, darkerColor, lighterColor } = useExtractColors(icon && !imageError ? icon : '');

  const getFallbackProjectColors = (imageUrl: string, projectName: string) => {
    const hashString = imageUrl || projectName;
    const hash = hashString.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const hue = Math.abs(hash) % 360;
    const dominantColor = `hsl(${hue}, 65%, 55%)`;
    const accentColor = `hsl(${(hue + 30) % 360}, 65%, 45%)`;

    return { dominantColor, accentColor };
  };


  const getDynamicColors = () => {
    if (dominantColor && dominantColor.startsWith('#')) {
      return {
        dominantColor,
        accentColor: darkerColor && darkerColor.startsWith('#') ? darkerColor : dominantColor
      };
    }

    // fallback
    return getFallbackProjectColors(icon, name);
  };

  const extractedColors = getDynamicColors();

  const getTrendIcon = () => {
    switch (trendDirection) {
      case "up":
        return (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="m7 14 5-5 5 5z" />
          </svg>
        );
      case "down":
        return (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="m7 10 5 5 5-5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 14h10v-2H7v2z" />
          </svg>
        );
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case "up":
        return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
      case "down":
        return "text-rose-500 bg-rose-50 dark:bg-rose-900/20";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800";
    }
  };

  const getTrendSymbol = () => {
    if (trendDirection === "flat") return "";
    return trendDirection === "up" ? "+" : "-";
  };

  const getSparklineColor = () => {
    switch (trendDirection) {
      case "up":
        return "#10b981";
      case "down":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };



  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const getFallbackIcon = () => {

    const firstLetter = name.charAt(0).toUpperCase();
    return (
      <div
        className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
        style={{ backgroundColor: extractedColors.dominantColor }}
      >
        {firstLetter}
      </div>
    );
  };

  const hoverBorderStyle = {
    '--hover-border-color': `${extractedColors.dominantColor}30`,
  } as React.CSSProperties;

  const hoverLineStyle = {
    backgroundColor: extractedColors.dominantColor,
  } as React.CSSProperties;

  const handleClick = () => {
    setSelectedProject({
      id: id || code,
      key: code,
      name: name,
      avatarUrls: {
        '48x48': icon
      }
    });
  };

  return (
    <Link
      to={`/backlog/${code.toLowerCase()}`}
      onClick={handleClick}
      className="group flex flex-col bg-white dark:bg-[#1a1a2e] rounded-xl border border-[#dbdbe6] dark:border-[#2f2f46] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
      style={{
        ...hoverBorderStyle,
        '--hover-border': 'var(--hover-border-color)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${extractedColors.dominantColor}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '';
      }}
    >
      <div
        className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={hoverLineStyle}
      ></div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="size-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700">
            {!imageError && icon ? (
              <img
                src={icon}
                alt={`${name} icon`}
                loading="lazy"
                className={`w-full h-full object-cover transition-opacity duration-200 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              getFallbackIcon()
            )}
          </div>
          <div>
            <h3 className="text-[#111118] dark:text-white text-base font-bold leading-tight group-hover:transition-colors">
              {name}
            </h3>
            {category && (
              <span
                className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide transition-colors"
              style={{
                backgroundColor: `color-mix(in srgb, ${extractedColors.dominantColor}, white 85%)`,
                color: extractedColors.dominantColor,
              }}
              >
                {category}
              </span>
            )}
            <span
              className="ml-1 inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide transition-colors"
              style={{
                backgroundColor: `color-mix(in srgb, ${extractedColors.accentColor}, white 85%)`,
                color: extractedColors.accentColor,
              }}
            >
              {code}
            </span>
          </div>
        </div>
        <button
          className="text-[#dbdbe6] hover:transition-colors"
          style={{ '--hover-color': extractedColors.dominantColor }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = extractedColors.dominantColor;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = '';
          }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-background-light dark:bg-[#252540]/50">
          <div className="flex items-center gap-1.5 text-[#616189] dark:text-[#9ca3af]">
            <svg
              className="w-[18px] h-[18px]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v7H5v-3H4zm3-2c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm7-2c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm-7 0c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2z" />
            </svg>
            <span className="text-xs font-medium">Team Size</span>
          </div>
          <span className="text-[#111118] dark:text-white text-sm font-bold pl-6">
            {teamSize} Members
          </span>
        </div>
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-background-light dark:bg-[#252540]/50">
          <div className="flex items-center gap-1.5 text-[#616189] dark:text-[#9ca3af]">
            <svg
              className="w-[18px] h-[18px]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 3h13.85a2 2 0 0 0 1.74-3 10 10 0 0 0-.27-10.43z" />
              <path d="M10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z" />
            </svg>
            <span className="text-xs font-medium">Velocity</span>
          </div>
          <span className="text-[#111118] dark:text-white text-sm font-bold pl-6">
            {velocity} pts
          </span>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-end mb-2">
          <p className="text-xs font-medium text-[#616189] dark:text-[#9ca3af]">
            Last 5 Sprints
          </p>
          <p
            className={`text-xs font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded ${getTrendColor()}`}
          >
            {getTrendIcon()}
            {getTrendSymbol()}
            {trendPercentage}%
          </p>
        </div>
        <div className="h-10 w-full relative bg-gray-50/50 dark:bg-[#252540]/30 rounded-md overflow-hidden">
          <svg
            className="w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 40"
            style={{ overflow: "visible" }}
          >

            <defs>
              <pattern
                id={`grid-${code}`}
                width="20"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.3"
                  className="text-gray-200 dark:text-gray-600"
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect width="100" height="40" fill={`url(#grid-${code})`} />

            <path
              d={sparklinePath}
              fill="none"
              stroke={getSparklineColor()}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              className="drop-shadow-sm"
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                opacity: sparklinePath ? 1 : 0,
              }}
            />


            {sparklinePath &&
              sparklinePath
                .split(/[ML]/)
                .slice(1)
                .map((segment, index) => {
                  const coords = segment.trim().split(/[Q,\s]+/);
                  if (coords.length >= 2) {
                    const x = parseFloat(coords[coords.length - 2]);
                    const y = parseFloat(coords[coords.length - 1]);
                    if (!isNaN(x) && !isNaN(y)) {
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r="1.5"
                          fill={getSparklineColor()}
                          className="drop-shadow-sm"
                        />
                      );
                    }
                  }
                  return null;
                })}

            {!sparklinePath && (
              <text
                x="50"
                y="20"
                textAnchor="middle"
                className="text-xs fill-gray-400 dark:fill-gray-500"
                fontSize="8"
              >
                No data
              </text>
            )}
          </svg>
        </div>
      </div>
    </Link>
  );
}
