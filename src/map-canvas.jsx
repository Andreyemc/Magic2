// MapCanvas v2 — uses provided raster map as canvas. Pins/Tamaz/Clouds overlay it.
const { useMemo } = React;

function PinBalloon({ glyph }) {
  return (
    <svg className="pin-balloon" viewBox="0 0 72 84">
      <defs>
        <radialGradient id="frameGrad" cx="0.3" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#e6c785"/>
          <stop offset="0.55" stopColor="#b8923f"/>
          <stop offset="1" stopColor="#6c5418"/>
        </radialGradient>
        <radialGradient id="thumbGrad" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#f4ead0"/>
          <stop offset="1" stopColor="#bcab86"/>
        </radialGradient>
      </defs>
      <path d="M36 80 L24 58 Q8 50 8 32 A28 28 0 1 1 64 32 Q64 50 48 58 Z"
        fill="url(#frameGrad)" stroke="#4a3a18" strokeWidth="1.4"/>
      <circle cx="36" cy="32" r="22" fill="url(#thumbGrad)" stroke="#4a3a18" strokeWidth="1"/>
      <g transform="translate(14 10)" dangerouslySetInnerHTML={{__html: glyph}} />
      <g transform="translate(36 64)" fill="#1a1410">
        <path d="M0 -4 L1.2 -1.2 L4 -0.5 L1.5 1 L2.2 4 L0 2.4 L-2.2 4 L-1.5 1 L-4 -0.5 L-1.2 -1.2 Z"/>
      </g>
    </svg>
  );
}

function Pin({ stop, state, onClick, num, scaleInv }) {
  const cls = ['pin', state].filter(Boolean).join(' ');
  return (
    <div
      className={cls}
      style={{
        left: `${stop.position.x}%`,
        top: `${stop.position.y}%`,
        transform: `translate(-50%,-100%) scale(${scaleInv})`,
        transformOrigin: '50% 100%'}}
      onClick={state === 'locked' ? undefined : onClick}
      role="button" tabIndex={state==='locked'?-1:0}
      aria-label={`${num}. ${stop.title}`}
      onKeyDown={(e) => { if ((e.key==='Enter'||e.key===' ') && state!=='locked') { e.preventDefault(); onClick && onClick(); } }}
    >
      <PinBalloon glyph={GLYPHS[stop.glyph] || GLYPHS.scroll}/>
      <div className="pin-checkmark">✓</div>
      <div className="pin-lock" aria-hidden="true">
        <svg viewBox="0 0 8 8" fill="none" stroke="#d4ac5a" strokeWidth="1">
          <rect x="1.5" y="3.5" width="5" height="3.5" rx="0.5" fill="#d4ac5a" stroke="none"/>
          <path d="M2.5 3.5 V2.2 a1.5 1.5 0 0 1 3 0 V3.5"/>
        </svg>
      </div>
      <div className="pin-nameplate">{num}. {stop.title}</div>
    </div>
  );
}

function PathLine({ stops, mapW, mapH }) {
  if (!stops.length) return null;
  const d = stops.reduce((acc, s, i) => {
    const x = (s.position.x/100)*mapW;
    const y = (s.position.y/100)*mapH - 60;
    if (i === 0) return `M ${x} ${y}`;
    const prev = stops[i-1];
    const px = (prev.position.x/100)*mapW;
    const py = (prev.position.y/100)*mapH - 60;
    const mx = (px + x)/2;
    const my = (py + y)/2 - 30;
    return `${acc} Q ${mx} ${my} ${x} ${y}`;
  }, '');
  return (
    <svg style={{position:'absolute', left:0, top:0, width:'100%', height:'100%', pointerEvents:'none', overflow:'visible'}} viewBox={`0 0 ${mapW} ${mapH}`} preserveAspectRatio="none">
      <path d={d} className="path-line" strokeWidth="6"/>
    </svg>
  );
}

function TamazSprite({ x, y, idleHint, scaleInv }) {
  return (
    <div className="tamaz-sprite" style={{
      left:`${x}%`, top:`${y}%`,
      transform:`translate(-130%,-110%) scale(${scaleInv})`,
      transformOrigin:'50% 100%'}}>
      {idleHint && <div className="speech">Готов открыть следующий факультет?</div>}
      <svg width="64" height="100" viewBox="0 0 64 100">
        <line x1="48" y1="60" x2="62" y2="22" stroke="#3a342a" strokeWidth="2.4" strokeLinecap="round"/>
        <circle cx="62" cy="22" r="3.5" fill="#d4ac5a">
          <animate attributeName="r" values="3.5;5.5;3.5" dur="3s" repeatCount="indefinite"/>
        </circle>
        <path d="M16 50 Q12 80 8 96 L56 96 Q52 80 48 50 Z" fill="#2e2440" stroke="#1a1230" strokeWidth="1.2"/>
        <path d="M14 70 Q32 74 50 70" stroke="#b8923f" strokeWidth="1.5" fill="none"/>
        <circle cx="32" cy="42" r="10" fill="#e3c39a" stroke="#3a342a" strokeWidth="1"/>
        <path d="M22 46 Q32 60 42 46 Q42 56 32 60 Q22 56 22 46 Z" fill="#e3d8bc" stroke="#8a7a5a" strokeWidth="0.8"/>
        <path d="M14 38 L32 8 L50 38 Z" fill="#2e2440" stroke="#1a1230" strokeWidth="1.2"/>
        <path d="M12 38 L52 38 L48 42 L16 42 Z" fill="#1a1230"/>
        <path d="M44 56 Q50 58 50 64" stroke="#e3c39a" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function Clouds({ density }) {
  const clouds = [];
  for (let i = 0; i < density; i++) {
    const top = -2 + i * 11 + (i%2)*6;       // spread across full sky
    const dur = 90 + (i*23) % 70;             // 90–160s drift
    const op = 0.55 + (i*0.07)%0.35;          // 0.55–0.9 (much more visible)
    const scale = 1.4 + (i*0.31)%1.2;         // 1.4–2.6× (bigger)
    const anim = ['drift1','drift2','drift3'][i%3];
    clouds.push(
      <svg key={i} className="cloud" style={{
        top:`${top}%`,
        opacity:op,
        '--cloud-s': scale,
        animation:`${anim} ${dur}s linear infinite`,
        animationDelay:`-${(i*17)%dur}s`,
      }} width="420" height="140" viewBox="0 0 420 140">
        <g fill="#ffffff">
          <ellipse cx="80" cy="80" rx="80" ry="32"/>
          <ellipse cx="180" cy="66" rx="86" ry="38"/>
          <ellipse cx="280" cy="78" rx="78" ry="34"/>
          <ellipse cx="360" cy="86" rx="50" ry="26"/>
        </g>
      </svg>
    );
  }
  return (
    <div style={{
      position:'fixed',          // fixed so clouds stay in front of the panning map
      inset:0,
      pointerEvents:'none',
      zIndex:30,                 // above map (5–6) but below HUD (50) and popups (200)
      overflow:'hidden',
    }}>
      {clouds}
    </div>
  );
}

window.Pin = Pin;
window.PathLine = PathLine;
window.TamazSprite = TamazSprite;
window.Clouds = Clouds;
