// App v2.1 — bounded pan/zoom over static map image; pins/Tamaz/clouds positioned in % of map.
// FIXES vs v2:
//   1. Drag now works even when pointerdown lands on a pin/river-hit/coffee-hit
//      (those handlers stop propagation themselves; map-stage starts drag for everyone else)
//   2. Wheel zoom uses a native non-passive listener (React's onWheel is passive, breaks preventDefault)
//   3. panToStop animation goes through clamp at every tick
//   4. NaN guards in clamp + view setter
//   5. Map image dimensions reduced — see public/map-base.jpg (3168×1344)

const { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } = React;

const STORAGE_KEY = 'asclepius_progress_v2';
const loadProgress = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { opened:[], avatarSaved:false }; } catch { return { opened:[], avatarSaved:false }; } };
const saveProgress = (p) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {} };

const TWEAK_DEFAULS = /*EDITMODE-BEGIN*/{
  "cloudDensity": 4,
  "showAllUnlocked": true,
  "showPathLine": true
}/*EDITMODE-END*/;

// Replace map dimensions to match the new (downscaled) image
// IMPORTANT: also update data.jsx -> window.MAP_W = 3168; window.MAP_H = 1344;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULS);
  const [progress, setProgress] = useState(loadProgress());
  const [activePopup, setActivePopup] = useState(null);
  const [toast, setToast] = useState(null);
  const [idleHint, setIdleHint] = useState(false);
  const [coffeeHover, setCoffeeHover] = useState(false);

  const stageRef = useRef(null);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [view, setView] = useState({ x:0, y:0, scale:1 });
  const drag = useRef(null);
  const pinch = useRef(null);
  const pointers = useRef(new Map()); // pointerId → { x, y }
  const initialFitDone = useRef(false);

  const MAP_W = window.MAP_W;
  const MAP_H = window.MAP_H;

  // Defensive: detect any NaN/Infinity and reset
  const safeView = (v) => {
    if (!v || !Number.isFinite(v.x) || !Number.isFinite(v.y) || !Number.isFinite(v.scale) || v.scale <= 0) {
      console.warn('[map] invalid view, resetting', v);
      const s = Math.max(vp.h / MAP_H, vp.w / MAP_W);
      return { scale: s, x: 0, y: 0 };
    }
    return v;
  };

  const minScale = useMemo(() => {
    const fitH = vp.h / MAP_H;
    const fitW = vp.w / MAP_W;
    return Math.max(fitH, fitW);
  }, [vp, MAP_W, MAP_H]);
  const maxScale = 2.4;

  // clamp uses latest vp via closure on each render
  const clamp = useCallback((v) => {
    v = safeView(v);
    const sw = MAP_W * v.scale;
    const sh = MAP_H * v.scale;
    // map MUST cover viewport; if scale<minScale, push it back up
    const scale = Math.max(minScale, Math.min(maxScale, v.scale));
    const sw2 = MAP_W * scale;
    const sh2 = MAP_H * scale;
    let x = v.x, y = v.y;
    // bounds: x in [vp.w - sw2, 0], y in [vp.h - sh2, 0]
    // when sw2 == vp.w both bounds are 0, x must be 0
    const xMin = Math.min(0, vp.w - sw2);
    const yMin = Math.min(0, vp.h - sh2);
    x = Math.max(xMin, Math.min(0, x));
    y = Math.max(yMin, Math.min(0, y));
    return { scale, x, y };
  }, [vp, minScale, maxScale, MAP_W, MAP_H]);

  useEffect(() => { saveProgress(progress); }, [progress]);

  useEffect(() => {
    const onR = () => setVp({ w:window.innerWidth, h:window.innerHeight });
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);

  // Initial fit + center on stop 1 — only once
  useEffect(() => {
    if (initialFitDone.current) {
      // on resize, just re-clamp current view at new bounds
      setView(v => clamp(v));
      return;
    }
    initialFitDone.current = true;
    const s = Math.max(vp.h / MAP_H, vp.w / MAP_W);
    const stop1 = STOPS[0];
    const cx = (stop1.position.x/100)*MAP_W*s;
    const cy = (stop1.position.y/100)*MAP_H*s;
    setView(clamp({ scale:s, x: vp.w/2 - cx, y: vp.h/2 - cy }));
    // eslint-disable-next-line
  }, [minScale]);

  // idle hint
  useEffect(() => {
    let t;
    const reset = () => { setIdleHint(false); clearTimeout(t); t = setTimeout(() => setIdleHint(true), 15000); };
    reset();
    window.addEventListener('mousemove', reset);
    return () => { clearTimeout(t); window.removeEventListener('mousemove', reset); };
  }, []);

  const points = progress.opened.filter(id => {
    const s = STOPS.find(x => x.id === id);
    return s && s.awardsPoints;
  }).length;

  const nextStopId = (() => {
    for (const s of STOPS) if (!progress.opened.includes(s.id)) return s.id;
    return null;
  })();

  const stopState = (s) => {
    if (progress.opened.includes(s.id)) return 'opened';
    if (s.id === nextStopId) return 'active';
    if (tweaks.showAllUnlocked) return '';
    if (s.id < (nextStopId || 99)) return '';
    return 'locked';
  };

  const openStop = (stop) => {
    const wasOpen = progress.opened.includes(stop.id);
    setActivePopup(stop);
    if (!wasOpen) {
      setProgress(p => ({ ...p, opened: [...p.opened, stop.id] }));
      const sameFaculty = STOPS.filter(s => s.faculty === stop.faculty);
      const lastOfFaculty = sameFaculty[sameFaculty.length - 1];
      if (lastOfFaculty.id === stop.id) {
        const nextStop = STOPS.find(s => s.id === stop.id + 1);
        if (nextStop) setTimeout(() => setToast({ stop: nextStop }), 400);
      }
    }
  };

  // FIX 3: panToStop now clamps every tick
  const panToStop = (stop) => {
    const s = view.scale;
    const cx = (stop.position.x/100)*MAP_W*s;
    const cy = (stop.position.y/100)*MAP_H*s;
    const target = clamp({ scale:s, x: vp.w/2 - cx, y: vp.h/2 - cy });
    const start = { ...view };
    const t0 = performance.now();
    const dur = 800;
    const tick = (t) => {
      const k = Math.min(1, (t - t0)/dur);
      const e = 0.5 - Math.cos(k*Math.PI)/2;
      setView(clamp({
        scale: start.scale + (target.scale - start.scale)*e,
        x: start.x + (target.x - start.x)*e,
        y: start.y + (target.y - start.y)*e}));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // FIX 1 (v2.2): pointer capture only AFTER drag threshold crossed. Capturing on
  // pointerdown forced click events to dispatch on the captured element (map-stage)
  // instead of on the pin under the cursor — that's why pin clicks never opened popups.
  // v2.3: also handle two-pointer pinch zoom for mobile.
  const onPointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1) {
      drag.current = {
        sx: e.clientX, sy: e.clientY,
        vx: view.x, vy: view.y,
        moved: false,
        pointerId: e.pointerId};
      pinch.current = null;
    } else if (pointers.current.size === 2) {
      drag.current = null;
      const pts = Array.from(pointers.current.values());
      const dx = pts[1].x - pts[0].x, dy = pts[1].y - pts[0].y;
      pinch.current = {
        startDist: Math.hypot(dx, dy),
        startScale: view.scale,
        startView: { ...view },
        midX: (pts[0].x + pts[1].x) / 2,
        midY: (pts[0].y + pts[1].y) / 2,
      };
    }
  };
  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Pinch (two pointers)
    if (pointers.current.size === 2 && pinch.current) {
      const pts = Array.from(pointers.current.values());
      const dx = pts[1].x - pts[0].x, dy = pts[1].y - pts[0].y;
      const dist = Math.hypot(dx, dy);
      if (!dist || !pinch.current.startDist) return;
      const ratio = dist / pinch.current.startDist;
      const ns = Math.max(minScale, Math.min(maxScale, pinch.current.startScale * ratio));
      if (!Number.isFinite(ns) || ns <= 0) return;
      const k = ns / pinch.current.startScale;
      const cx = pinch.current.midX, cy = pinch.current.midY;
      setView(clamp({
        scale: ns,
        x: cx - (cx - pinch.current.startView.x) * k,
        y: cy - (cy - pinch.current.startView.y) * k,
      }));
      return;
    }

    // Drag (single pointer)
    if (drag.current && pointers.current.size === 1) {
      const dx = e.clientX - drag.current.sx;
      const dy = e.clientY - drag.current.sy;
      if (!drag.current.moved && Math.abs(dx) + Math.abs(dy) > 4) {
        drag.current.moved = true;
        stageRef.current?.classList.add('dragging');
        try { stageRef.current?.setPointerCapture(drag.current.pointerId); } catch {}
      }
      if (drag.current.moved) {
        setView(v => clamp({ ...v, x: drag.current.vx + dx, y: drag.current.vy + dy }));
      }
    }
  };
  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    const wasDragging = drag.current?.moved;
    if (drag.current?.pointerId === e.pointerId) {
      try { stageRef.current?.releasePointerCapture(drag.current.pointerId); } catch {}
      drag.current = null;
    }
    // Pinch ending — re-anchor drag from remaining finger if any
    if (pinch.current) {
      pinch.current = null;
      if (pointers.current.size === 1) {
        const [pid, p] = pointers.current.entries().next().value;
        drag.current = { sx: p.x, sy: p.y, vx: view.x, vy: view.y, moved: false, pointerId: pid };
      }
    }
    if (wasDragging) {
      const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      window.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', swallow, true), 50);
    }
    if (pointers.current.size === 0) {
      stageRef.current?.classList.remove('dragging');
    }
  };

  // FIX 2: native non-passive wheel listener (React's onWheel is passive in modern React)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0018;
      setView(v => {
        const ns = Math.max(minScale, Math.min(maxScale, v.scale * (1 + delta)));
        if (!Number.isFinite(ns) || ns <= 0) return v;
        const k = ns / v.scale;
        const cx = e.clientX, cy = e.clientY;
        return clamp({ scale: ns, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k });
      });
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [minScale, maxScale, clamp]);

  const zoom = (dir) => setView(v => {
    const ns = Math.max(minScale, Math.min(maxScale, v.scale * (dir > 0 ? 1.18 : 0.85)));
    const cx = vp.w/2, cy = vp.h/2;
    const k = ns / v.scale;
    return clamp({ scale: ns, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k });
  });

  const renderPopup = () => {
    if (!activePopup) return null;
    const props = { stop: activePopup, onClose: () => setActivePopup(null) };
    switch (activePopup.type) {
      case 'book': return <BookPopup {...props} />;
      case 'video':
      case 'video-vertical': return <VideoPopup {...props} />;
      case 'cards-download':
      case 'cards-no-download': return <CardsPopup {...props} />;
      case 'quiz': return <QuizPopup {...props} />;
      case 'potion-game': return <PotionPopup {...props} />;
      case 'avatar-gen': return <AvatarPopup {...props} onSave={() => setProgress(p => ({...p, avatarSaved:true}))} />;
      case 'diploma': return <DiplomaPopup {...props} points={points} />;
      default: return <GenericPopup {...props} />;
    }
  };

  const nextStop = STOPS.find(s => s.id === nextStopId) || STOPS[STOPS.length - 1];

  const pinScale = 1 / Math.max(0.5, view.scale * 1.2);

  // Stop drag from starting on interactive children
  const stopDrag = (e) => e.stopPropagation();

  return (
    <>
      {/* Atmospheric clouds — fixed overlay above the map and pins, but below HUD/popups */}
      <Clouds density={tweaks.cloudDensity}/>

      <div className="hud-tl">
        <div className="crest">
          <svg width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 4 L20 8 V14 Q20 20 14 24 Q8 20 8 14 V8 Z" fill="none" stroke="#d4ac5a" strokeWidth="1.4"/>
            <path d="M14 10 V18 M10 14 H18" stroke="#d4ac5a" strokeWidth="1.4"/>
            <path d="M11 14 Q12 12 13 14 T15 14 T17 14" fill="none" stroke="#d4ac5a" strokeWidth="0.9"/>
          </svg>
        </div>
        <div>
          <div style={{fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontSize:11,color:'#d4ac5a'}}>ВОЛШЕБНАЯ ШКОЛА</div>
          <div style={{fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontStyle:'italic',fontSize:13,color:'#e9dcb6',lineHeight:1.2}}>медицинских инноваций им. Асклепия</div>
        </div>
      </div>

      <div className="hud-tr">
        <div className="avatar-frame" title="Получите аватар на Реке Аватарии">
          {progress.avatarSaved ? (
            <svg width="68" height="68" viewBox="0 0 100 100"><circle cx="50" cy="38" r="18" fill="#e3c39a"/><path d="M22 90 Q22 60 50 60 Q78 60 78 90 Z" fill="#2e2440"/></svg>
          ) : (
            <div style={{fontFamily: "Inter, system-ui, -apple-system, sans-serif",color:'#7a6a4a',fontSize:18,fontStyle:'italic'}}>?</div>
          )}
        </div>
        <div style={{fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontSize:10,color:'#d4ac5a'}}>УЧЕНИК</div>
        <div className="wisdom-pill" title="Бронзовый: 5–9 · Серебряный: 10–14 · Золотой: 15–20">
          Баллы мудрости <span className="wisdom-num">{points}</span> / 20
        </div>
      </div>

      <div className="map-stage" ref={stageRef}
           onPointerDown={onPointerDown}
           onPointerMove={onPointerMove}
           onPointerUp={onPointerUp}
           onPointerCancel={onPointerUp}>
        <div className="map-world" style={{
          transform:`translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
          width: MAP_W, height: MAP_H}}>
          <img src="public/map-base.jpg" alt="Карта мира школы Асклепия"
               style={{position:'absolute', left:0, top:0, width:'100%', height:'100%', pointerEvents:'none', userSelect:'none'}}
               draggable={false}/>

          {/* Coffee shop hover hit area — onPointerDown stops propagation only when actually hovered */}
          <div className="coffee-hit"
               onMouseEnter={() => setCoffeeHover(true)}
               onMouseLeave={() => setCoffeeHover(false)}
               style={{ position:'absolute', left:'15%', top:'66%', width:'14%', height:'14%' }}>
            {coffeeHover && (
              <div className="meme-tooltip" style={{transform:`scale(${pinScale*1.2})`}}>
                «Говорят, что при отсутствии кофе в рационе желание жить падает до 0»
              </div>
            )}
          </div>

          {/* River click area for stop 1 — opens only on real click (no drag) */}
          <div className="river-hit"
               onClick={(e) => { if (drag.current?.moved) return; openStop(STOPS[0]); }}
               style={{ position:'absolute', left:'18%', top:'46%', width:'18%', height:'8%', cursor:'pointer' }}
               title="Создать аватар">
          </div>

          {tweaks.showPathLine && <PathLine stops={STOPS} mapW={MAP_W} mapH={MAP_H}/>}

          {STOPS.map((s) => (
            <Pin key={s.id} stop={s} num={s.id} state={stopState(s)}
                 onClick={() => { if (drag.current?.moved) return; openStop(s); }}
                 scaleInv={pinScale}/>
          ))}
          <TamazSprite x={nextStop.position.x - 3} y={nextStop.position.y} idleHint={idleHint} scaleInv={pinScale}/>
        </div>
      </div>

      <div className="zoom-ctrl">
        <button className="zoom-btn" onClick={() => zoom(1)} aria-label="Приблизить">+</button>
        <button className="zoom-btn" onClick={() => zoom(-1)} aria-label="Отдалить">−</button>
      </div>
      <div className="legend">Перетаскивайте · Колёсиком — масштаб · Esc — закрыть</div>

      {toast && (
        <div className="toast">
          <div className="toast-text">Поздравляем с успешным прохождением курса! Вас ждёт следующий факультет.</div>
          <button className="toast-btn" onClick={() => { panToStop(toast.stop); setToast(null); }}>Пройти</button>
        </div>
      )}

      {renderPopup()}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Атмосфера"/>
        <TweakSlider label="Плотность облаков" value={tweaks.cloudDensity} min={0} max={8} step={1} onChange={(v)=>setTweak('cloudDensity', v)}/>
        <TweakToggle label="Линия пути" value={tweaks.showPathLine} onChange={(v)=>setTweak('showPathLine', v)}/>
        <TweakSection label="Прогресс"/>
        <TweakToggle label="Все стопы открыты" value={tweaks.showAllUnlocked} onChange={(v)=>setTweak('showAllUnlocked', v)}/>
        <TweakButton label="Сбросить прогресс" onClick={() => setProgress({ opened:[], avatarSaved:false })}/>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
