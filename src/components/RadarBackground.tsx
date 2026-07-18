import React from 'react';

/**
 * RadarBackground — full-page radar screen layout wrapper.
 * Renders concentric circle rings, a rotating sweep, blip dots,
 * and a subtle glow behind its children.
 *
 * Figma source: node 43:478 → 43:479 → 43:480
 */

interface RadarBackgroundProps {
  children: React.ReactNode;
}

/* Concentric circle diameters from Figma, plus extra rings to ensure they bleed off the edges */
const CIRCLE_DIAMETERS = [74, 192, 324, 472, 622, 766, 910, 1044, 1192, 1322, 1466, 1610, 1754, 1898, 2042, 2186, 2330, 2474, 2618, 2762];

/* Blip dot positions — converted from Figma absolute coords to % of the
   background_art frame (1542 × 1542). This keeps them resolution-independent. */
const BLIPS = [
  { x: 468, y: 538 },
  { x: 575, y: 607 },
  { x: 529, y: 498 },
  { x: 812, y: 368 },
  { x: 818, y: 300 },
  { x: 778, y: 318 },
  { x: 769, y: 278 },
  { x: 738, y: 389 },
  { x: 633, y: 420 },
];

/* The background_art frame in Figma is 1542×1542 — we use this to convert
   blip positions to percentages. */
const ART_SIZE = 1542;

export const RadarBackground: React.FC<RadarBackgroundProps> = ({ children }) => {
  return (
    /* Page — fixed to viewport, no page-level scroll */
    <div
      style={{ backgroundColor: 'var(--surface-0)' }}
      className="h-screen flex items-stretch justify-center overflow-hidden p-0 sm:p-[var(--spacing-32)]"
    >
      {/* Radar screen container */}
      <div
        className="relative w-full overflow-hidden flex flex-col rounded-none sm:rounded-[24px]"
        style={{
          maxWidth: '1440px',
          border: '4px solid transparent',
          background: `
            linear-gradient(var(--surface-1, #0C1919), var(--surface-1, #0C1919)) padding-box,
            radial-gradient(
              circle,
              rgba(199, 227, 104, 0.43) 0%,
              rgba(39, 176, 189, 0.30) 100%
            ) border-box
          `,
        }}
      >
        {/* Background art layer — behind content */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          {/* Concentric circle rings */}
          <svg
            className="absolute"
            style={{
              width: '100%',
              height: '100%',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              overflow: 'visible',
            }}
            viewBox={`0 0 ${ART_SIZE} ${ART_SIZE}`}
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            {CIRCLE_DIAMETERS.map((d) => (
              <circle
                key={d}
                cx={ART_SIZE / 2}
                cy={ART_SIZE / 2}
                r={d / 2}
                stroke="var(--color-green-700)"
                strokeWidth="1"
                opacity="0.15"
              />
            ))}

            {/* Blip dots */}
            {BLIPS.map((blip, i) => (
              <circle
                key={i}
                cx={blip.x}
                cy={blip.y}
                r="3"
                fill="var(--color-green-500)"
                opacity="0.7"
              />
            ))}
          </svg>

          <div
            className="absolute"
            style={{
              width: '200%',
              aspectRatio: '1/1',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          >
            <div
              className="radar-sweep"
              style={{
                width: '100%',
                height: '100%',
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 320deg, rgba(82, 183, 136, 0.08) 340deg, rgba(82, 183, 136, 0.15) 360deg)',
                borderRadius: '50%',
                transformOrigin: 'center center',
                animation: 'radar-spin 8s linear infinite',
                opacity: 0.3,
              }}
            />
          </div>

        </div>

        {/* Content layer — on top of the background art */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          {children}
        </div>

        {/* Glass smudges overlay — subtle grease highlights on screen surface */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: `
              /* Scan button touch cluster (top right) */
              radial-gradient(ellipse 20px 30px at 78% 13%, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 50%, transparent 100%),
              radial-gradient(ellipse 16px 26px at 80% 16%, rgba(255, 255, 255, 0.015) 0%, rgba(255, 255, 255, 0.003) 50%, transparent 100%),
              
              /* Bottom left scroll swiping cluster */
              radial-gradient(ellipse 22px 32px at 12% 50%, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 50%, transparent 100%),
              radial-gradient(ellipse 18px 28px at 14% 47%, rgba(255, 255, 255, 0.015) 0%, rgba(255, 255, 255, 0.003) 50%, transparent 100%),
              radial-gradient(ellipse 20px 30px at 11% 54%, rgba(255, 255, 255, 0.012) 0%, rgba(255, 255, 255, 0.003) 50%, transparent 100%),
              
              /* Middle target tap highlights */
              radial-gradient(ellipse 20px 30px at 45% 60%, rgba(255, 255, 255, 0.025) 0%, rgba(255, 255, 255, 0.005) 50%, transparent 100%),
              radial-gradient(ellipse 18px 28px at 52% 40%, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 50%, transparent 100%),
              
              /* Bottom right quadrant touch cluster (swiping or sidebar close) */
              radial-gradient(ellipse 10px 18px at 94% 70%, rgba(255, 255, 255, 0.015) 0%, rgba(255, 255, 255, 0.003) 50%, transparent 100%),
              radial-gradient(ellipse 32px 48px at 65% 85%, rgba(255, 255, 255, 0.018) 0%, rgba(255, 255, 255, 0.005) 50%, transparent 100%),
              radial-gradient(ellipse 14px 22px at 70% 65%, rgba(255, 255, 255, 0.015) 0%, rgba(255, 255, 255, 0.003) 50%, transparent 100%),
              radial-gradient(ellipse 22px 34px at 80% 78%, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 50%, transparent 100%),
              radial-gradient(ellipse 12px 18px at 88% 90%, rgba(255, 255, 255, 0.012) 0%, rgba(255, 255, 255, 0.002) 50%, transparent 100%)
            `,
            filter: 'blur(3px)',
          }}
        />
      </div>
    </div>
  );
};
