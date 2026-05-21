import { useState, useRef, useCallback } from 'react';

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

const UfoIcon = () => (
  <svg viewBox="0 0 50 30" style={{ width: '100%', height: '100%' }} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Upper dome */}
    <path d="M15 12 C 15 5, 35 5, 35 12" stroke="var(--secondary)" strokeWidth="2" fill="rgba(57, 255, 20, 0.25)" />
    {/* Ship body */}
    <ellipse cx="25" cy="15" rx="21" ry="5.5" fill="#151a22" stroke="var(--primary)" strokeWidth="2" />
    {/* Glowing light dots */}
    <circle cx="10" cy="15" r="1.5" fill="var(--secondary)" />
    <circle cx="17" cy="16" r="1.5" fill="#ffffff" />
    <circle cx="25" cy="16.5" r="1.5" fill="var(--secondary)" />
    <circle cx="33" cy="16" r="1.5" fill="#ffffff" />
    <circle cx="40" cy="15" r="1.5" fill="var(--secondary)" />
  </svg>
);

/**
 * Wrapper that makes a UFO ship draggable via unified Pointer Events.
 * Uses setPointerCapture to keep dragging even when moving fast off-element.
 * Pauses CSS animations during drag, displays a trailing exhaust particle trail,
 * and handles Mount Uritorco portal abductions when dragged close to it.
 */
function DraggableUfo({ className, portalRef, onAbsorb }) {
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState(null); // { x, y } viewport coordinates
  const [returning, setReturning] = useState(false);
  const [absorbed, setAbsorbed] = useState(false);
  const [trails, setTrails] = useState([]); // [{ id, x, y }] particle trails
  const shipRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e) => {
    if (absorbed) return;
    e.preventDefault();
    e.stopPropagation();
    
    const el = shipRef.current;
    if (!el) return;

    // Use Pointer Capture to capture drag events even if cursor/finger leaves element bounds
    try {
      el.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn('setPointerCapture failed', err);
    }

    const rect = el.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setPos({ x: rect.left, y: rect.top });
    setDragging(true);
    setReturning(false);
    setTrails([]);
  }, [absorbed]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging || absorbed) return;
    e.preventDefault();

    const newX = e.clientX - offsetRef.current.x;
    const newY = e.clientY - offsetRef.current.y;
    setPos({ x: newX, y: newY });

    // 1. Spawning trail exhaust particles centered relative to the ship (90x80 container)
    const centerX = newX + 45; 
    const centerY = newY + 40;
    
    setTrails((prev) => [
      ...prev.slice(-8), // Keep trailing count reasonable
      { id: Date.now() + Math.random(), x: centerX, y: centerY }
    ]);

    // 2. Detect proximity to Mount Uritorco Portal center
    if (portalRef && portalRef.current) {
      const portalRect = portalRef.current.getBoundingClientRect();
      const portalCenterX = portalRect.left + portalRect.width / 2;
      const portalCenterY = portalRect.top + portalRect.height / 2;

      const dx = centerX - portalCenterX;
      const dy = centerY - portalCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 75) {
        // Portal Abduction Sequence Triggered!
        setDragging(false);
        setAbsorbed(true);

        try {
          shipRef.current.releasePointerCapture(e.pointerId);
        } catch (err) {}

        // Anchor coordinates exactly to center of the portal
        const targetShipX = portalCenterX - 45;
        const targetShipY = portalCenterY - 40;
        setPos({ x: targetShipX, y: targetShipY });

        if (onAbsorb) {
          onAbsorb();
        }

        // Wait for absorption animation, then respawn ship
        setTimeout(() => {
          setPos(null);
          setAbsorbed(false);
          setTrails([]);
        }, 1500);
      }
    }
  }, [dragging, absorbed, portalRef, onAbsorb]);

  const handlePointerUp = useCallback((e) => {
    if (!dragging || absorbed) return;
    
    try {
      shipRef.current.releasePointerCapture(e.pointerId);
    } catch (err) {}

    setDragging(false);
    setReturning(true);

    // Let transition finish, then reset position and restore CSS animation
    setTimeout(() => {
      setPos(null);
      setReturning(false);
      setTrails([]);
    }, 600);
  }, [dragging, absorbed]);

  // Build inline styles dynamically to override keyframes during drag states
  const style = {};
  if (absorbed && pos) {
    style.position = 'fixed';
    style.left = `${pos.x}px`;
    style.top = `${pos.y}px`;
    style.animation = 'none';
    style.zIndex = 100;
    style.transform = 'scale(0) rotate(1080deg)';
    style.opacity = 0;
    style.transition = 'transform 1.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease-out, left 1.3s cubic-bezier(0.25, 1, 0.5, 1), top 1.3s cubic-bezier(0.25, 1, 0.5, 1)';
  } else if (dragging && pos) {
    style.position = 'fixed';
    style.left = `${pos.x}px`;
    style.top = `${pos.y}px`;
    style.animation = 'none';
    style.zIndex = 100;
  } else if (returning && pos) {
    style.position = 'fixed';
    style.left = `${pos.x}px`;
    style.top = `${pos.y}px`;
    style.animation = 'none';
    style.zIndex = 100;
    style.transform = 'scale(0.3) rotate(720deg)';
    style.opacity = 0;
    style.transition = 'transform 0.6s ease-in, opacity 0.6s ease-in';
  }

  return (
    <>
      {/* Dynamic Trail Particles */}
      {trails.map((particle) => (
        <div
          key={particle.id}
          className="ufo-trail-particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${Math.random() * 8 + 6}px`,
            height: `${Math.random() * 8 + 6}px`,
          }}
        />
      ))}

      <div
        ref={shipRef}
        className={`ufo-ship ${className} ${dragging ? 'dragging' : ''}`}
        style={style}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <UfoIcon />
      </div>
    </>
  );
}

export default function UritorcoBackground() {
  const portalRef = useRef(null);
  const [toasts, setToasts] = useState([]);
  const [pulses, setPulses] = useState([]);

  const handleAbsorb = useCallback(() => {
    if (!portalRef.current) return;
    const rect = portalRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Trigger mobile vibration if supported
    if (navigator.vibrate) {
      navigator.vibrate([60, 40, 60]);
    }

    // Playful local Argentine/extraterrestrial jokes for abduction
    const alerts = [
      "¡Abducción Exitosa! 🛸",
      "¡Contacto del 3er Tipo! 👽",
      "¡Combustible Alienígena +100! ⚡",
      "¡Vaca abducida en Capilla del Monte! 🐄",
      "¡Portal del Uritorco Activo! 🌀",
      "¡Recibiendo señales cósmicas! ✨",
      "¡Abduciendo deudas! 💸",
      "¡Contacto extraterrestre! 👁️"
    ];
    const text = alerts[Math.floor(Math.random() * alerts.length)];
    const id = Date.now() + Math.random();

    setToasts((prev) => [...prev, { id, text, x, y }]);
    setPulses((prev) => [...prev, { id, x, y }]);

    // Auto cleanup toasts and portal pulses
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1600);

    setTimeout(() => {
      setPulses((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  }, []);

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

      {/* Draggable UFOs with portal ref and abduction callbacks */}
      <DraggableUfo className="ufo-entering" portalRef={portalRef} onAbsorb={handleAbsorb} />
      <DraggableUfo className="ufo-exiting" portalRef={portalRef} onAbsorb={handleAbsorb} />
      <DraggableUfo className="ufo-peak-hover" portalRef={portalRef} onAbsorb={handleAbsorb} />

      {/* Floating portal abduction toasts rendered in fixed viewport space */}
      {toasts.map((t) => (
        <div key={t.id} className="portal-toast" style={{ left: `${t.x}px`, top: `${t.y}px` }}>
          {t.text}
        </div>
      ))}

      {/* Mountain SVG at the bottom */}
      <div className="uritorco-mountain-wrapper">
        {/* Render portal shockwaves relative to mountain wrapper coordinates */}
        {pulses.map((p) => {
          const wrapperEl = document.querySelector('.uritorco-mountain-wrapper');
          if (!wrapperEl) return null;
          const mRect = wrapperEl.getBoundingClientRect();
          const rx = p.x - mRect.left;
          const ry = p.y - mRect.top;
          return (
            <div
              key={p.id}
              className="portal-shockwave"
              style={{ left: `${rx}px`, top: `${ry}px` }}
            />
          );
        })}

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
          <ellipse
            ref={portalRef}
            cx="500"
            cy="280"
            rx="25"
            ry="35"
            fill="var(--secondary)"
            filter="url(#portalGlow)"
            opacity="0.8"
            className="portal-pulse"
          />
          <ellipse cx="500" cy="280" rx="10" ry="15" fill="#ffffff" opacity="0.95" />
        </svg>
      </div>
    </div>
  );
}
