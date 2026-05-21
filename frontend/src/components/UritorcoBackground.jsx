// Simple deterministic pseudo-random generator to satisfy react-hooks/purity rules
const pseudoRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const STARS_DATA = Array.from({ length: 30 }).map((_, i) => {
  const top = `${pseudoRandom(i * 1.5) * 70}%`;
  const left = `${pseudoRandom(i * 3.7) * 100}%`;
  const size = `${pseudoRandom(i * 7.9) * 2 + 1}px`;
  const delay = `${pseudoRandom(i * 11.2) * 4}s`;
  const duration = `${pseudoRandom(i * 15.4) * 3 + 2}s`;
  return { id: i, top, left, size, delay, duration };
});

export default function UritorcoBackground() {
  return (
    <div className="uritorco-bg-container">
      {/* Stars */}
      {STARS_DATA.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}

      {/* UFOs */}
      {/* UFO 1: Entering the mountain portal */}
      <div className="ufo-ship ufo-entering">🛸</div>

      {/* UFO 2: Exiting the mountain portal */}
      <div className="ufo-ship ufo-exiting">🛸</div>

      {/* UFO 3: Orbiting/Hovering above peak */}
      <div className="ufo-ship ufo-peak-hover">🛸</div>

      {/* Mountain SVG at the bottom */}
      <div className="uritorco-mountain-wrapper">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#120c1f" />
              <stop offset="100%" stopColor="#0b0c10" />
            </linearGradient>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9d4edd" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#39ff14" stopOpacity="0" />
            </linearGradient>
            <filter id="portalGlow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="mountainGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Glowing energy fields */}
          <circle cx="500" cy="200" r="180" fill="url(#glowGrad)" />

          {/* Mount Uritorco ridge silhouette */}
          <path
            d="M-50,400 L80,280 L220,330 L500,120 L720,320 L880,270 L1050,400 Z"
            fill="url(#mountainGrad)"
            stroke="var(--primary)"
            strokeWidth="2"
            filter="url(#mountainGlow)"
          />

          {/* Solid base */}
          <rect x="-50" y="398" width="1100" height="10" fill="#0b0c10" />

          {/* Pulse portal cave in center */}
          <ellipse cx="500" cy="280" rx="25" ry="35" fill="var(--secondary)" filter="url(#portalGlow)" opacity="0.8" className="portal-pulse" />
          <ellipse cx="500" cy="280" rx="10" ry="15" fill="#ffffff" opacity="0.95" />
        </svg>
      </div>
    </div>
  );
}
