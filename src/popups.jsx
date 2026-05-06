// Popups: shared shell + 6 hero popup variants
const { useState, useEffect } = React;

function Corner() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M2 14 L2 2 L14 2"/>
      <path d="M2 8 L8 2"/>
      <circle cx="6" cy="6" r="2.4"/>
      <path d="M6 3.6 L6 8.4 M3.6 6 L8.4 6"/>
    </svg>
  );
}

function PopupShell({ children, onClose, eyebrow, title, spell, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="pop-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`pop-shell${wide ? ' wide':''}`}>
        <span className="pop-corner tl"><Corner/></span>
        <span className="pop-corner tr"><Corner/></span>
        <span className="pop-corner bl"><Corner/></span>
        <span className="pop-corner br"><Corner/></span>
        <button className="pop-close" onClick={onClose} aria-label="Закрыть">✕</button>
        {eyebrow && <div className="pop-eyebrow">{eyebrow}</div>}
        {title && <h2 className="pop-title">{title}</h2>}
        {spell && <div className="pop-spell">«{spell}»</div>}
        <div className="gold-rule" style={{margin:'4px 0 18px'}}/>
        {children}
      </div>
    </div>
  );
}

// ---------- BOOK (Stop 17) ----------
function BookPopup({ stop, onClose }) {
  const PAGES = [
    { h:'Карманное руководство', body:(
      <>
        <p style={{fontStyle:'italic'}}>Ведение пациентов с артериальной гипертензией. Сводка по клиническим рекомендациям РФ и ЕС.</p>
        <p>Сия книга составлена Орденом Ритма и Давления Триархии — для тех, кто несёт службу у постели пациента и не ищет лёгких путей.</p>
        <p style={{textAlign:'center',marginTop:24,fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontSize:11,color:'var(--gold-deep)'}}>— Откройте страницу справа —</p>
      </>
    )},
    { h:'Стратификация риска', body:(
      <ul>
        <li>Низкий: АД 130–139/85–89, без ПОМ, без АКС</li>
        <li>Умеренный: АГ 1 ст. + 1–2 ФР</li>
        <li>Высокий: АГ 1–2 ст. + ≥3 ФР, ПОМ или СД</li>
        <li>Очень высокий: АГ 3 ст., АКС или ХБП ≥3</li>
      </ul>
    )},
    { h:'Целевые уровни АД', body:(
      <ul>
        <li>Общая популяция: &lt;130/80 при переносимости</li>
        <li>Старше 65 лет: 130–139/&lt;80</li>
        <li>СД, ИБС: систолическое 120–129</li>
        <li>ХБП: индивидуально, не ниже 120/70</li>
      </ul>
    )},
    { h:'Стартовая терапия', body:(
      <ul>
        <li>Шаг 1 — двойная фиксированная: иАПФ/АРА + БКК или диуретик</li>
        <li>Шаг 2 — тройная: иАПФ/АРА + БКК + диуретик</li>
        <li>Шаг 3 — добавить спиронолактон 25–50 мг</li>
        <li>Резистентная — направить в специализированный центр</li>
      </ul>
    )},
    { h:'Особые сценарии', body:(
      <ul>
        <li>АГ + ИБС → ББ + БКК или иАПФ</li>
        <li>АГ + ХСН → иАПФ/АРА + ББ + АМКР</li>
        <li>АГ + СД → иАПФ/АРА + БКК</li>
        <li>АГ + беременность → метилдопа, нифедипин, лабеталол</li>
      </ul>
    )},
    { h:'Контрольный список', body:(
      <ul>
        <li>Измерить АД на двух руках</li>
        <li>СМАД при подозрении на «белый халат»</li>
        <li>Креатинин, K, липиды, глюкоза, ЭКГ</li>
        <li>УЗИ почек у молодых с резистентностью</li>
      </ul>
    )},
  ];
  const [page, setPage] = useState(0);
  // On mobile: 1 page per view. On desktop: 2 pages per spread.
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const pagesPerView = isMobile ? 1 : 2;
  const totalViews = Math.ceil(PAGES.length / pagesPerView);
  const firstIdx = page * pagesPerView;
  return (
    <PopupShell onClose={onClose} eyebrow="Стоп 17 · Вековая библиотека" title={stop.title} spell={stop.spell} wide>
      <div className="book-stage">
        <div className="book">
          {!isMobile && (
            <div className="book-page left-static">
              <h3 className="page-h">{PAGES[firstIdx]?.h || ''}</h3>
              <div className="page-content">{PAGES[firstIdx]?.body}</div>
              <div className="page-num">{firstIdx + 1}</div>
            </div>
          )}
          <div className={`book-page${!isMobile && page >= 1 ? ' book-flipped' : ''}${isMobile ? ' single' : ''}`} style={{zIndex: 10 - page}}>
            <h3 className="page-h">{PAGES[isMobile ? firstIdx : firstIdx + 1]?.h || ''}</h3>
            <div className="page-content">{PAGES[isMobile ? firstIdx : firstIdx + 1]?.body}</div>
            <div className="page-num">{(isMobile ? firstIdx : firstIdx + 1) + 1}</div>
          </div>
        </div>
        {!isMobile && <div className="book-spine"/>}
      </div>
      <div className="book-controls">
        <button className="book-arrow" disabled={page===0} onClick={() => setPage(p => Math.max(0, p-1))}>← Назад</button>
        <span style={{fontFamily: "Inter, system-ui, -apple-system, sans-serif", fontSize:11, color:'var(--gold-deep)'}}>
          {isMobile ? `СТРАНИЦА ${firstIdx + 1} ИЗ ${PAGES.length}` : `СТРАНИЦЫ ${firstIdx+1}–${Math.min(firstIdx+2, PAGES.length)} ИЗ ${PAGES.length}`}
        </span>
        <button className="book-arrow" disabled={page >= totalViews - 1} onClick={() => setPage(p => Math.min(totalViews - 1, p+1))}>Вперёд →</button>
      </div>
      <p style={{textAlign:'center',fontStyle:'italic',color:'var(--gold-deep)',fontSize:13,marginTop:12}}>Не подлежит выгрузке. Запоминайте.</p>
    </PopupShell>
  );
}

// ---------- VIDEO ----------
function VideoPopup({ stop, onClose }) {
  const vertical = stop.type === 'video-vertical';
  return (
    <PopupShell onClose={onClose} eyebrow={`Стоп ${stop.id} · ${stop.faculty}`} title={stop.title} wide={!vertical}>
      <div className="video-frame" style={vertical ? {aspectRatio:'9/16', maxWidth:340, margin:'10px auto'}: {}}>
        <div className="play-btn">▶</div>
      </div>
      <p style={{textAlign:'center',color:'var(--gold-deep)',fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontSize:11,textTransform:'uppercase',marginTop:8}}>
        {stop.subtitle}
      </p>
      <p className="pop-body" style={{marginTop:14}}>
        Здесь будет {vertical ? 'вертикальное motion-design' : 'горизонтальное'} видео. Лектор: {stop.professor === 'tamaz' ? 'Тамаз — Молодой волшебник Систолион' : stop.professor === 'demkina' ? 'Профессор Артерия Триос (Демкина)' : stop.professor === 'chernova' ? 'Хранительница Диастолия (Чернова)' : 'гости школы'}.
      </p>
    </PopupShell>
  );
}

// ---------- CARDS ----------
function CardsPopup({ stop, onClose }) {
  const downloadable = stop.type === 'cards-download';
  const cards = [
    { h:'Принцип I',  p:'Лекарственные средства, повышающие АД, чаще остаются вне поля зрения врача. Обзор должен быть рутинным.'},
    { h:'Принцип II', p:'НПВС, ГКС, симпатомиметики и пероральные контрацептивы — типичные подозреваемые.'},
    { h:'Принцип III',p:'Травы и БАДы (солодка, эфедра) тоже способны давать стойкий рост АД.'},
    { h:'Принцип IV', p:'Алгоритм: отмена → пересмотр режима → подбор альтернативы → контроль через 4 недели.'},
    { h:'Принцип V',  p:'Документируйте каждое решение — это часть терапевтического диалога с пациентом.'},
  ];
  return (
    <PopupShell onClose={onClose} eyebrow={`Стоп ${stop.id} · ${stop.faculty}`} title={stop.title} spell={stop.spell} wide>
      <div className="hint-pill">Листай · Тык</div>
      <div className="cards-rail">
        {cards.map((c,i) => (
          <div className="cheat-card" key={i}>
            <div className="num">{String(i+1).padStart(2,'0')} / {String(cards.length).padStart(2,'0')}</div>
            <div style={{marginTop:18}}>
              <div className="hint-pill" style={{marginBottom:10}}>Шпаргалка</div>
              <h4>{c.h}</h4>
              <p>{c.p}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
        <span style={{fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontStyle:'italic',color:'var(--gold-deep)',fontSize:14}}>{downloadable ? 'Можно унести с собой.' : 'Только для прочтения.'}</span>
        {downloadable
          ? <button className="btn-gold">Скачать PDF ↓</button>
          : <button className="btn-ghost" disabled>Не подлежит выгрузке</button>}
      </div>
    </PopupShell>
  );
}

// ---------- QUIZ (Stop 21) ----------
function QuizPopup({ stop, onClose, onComplete }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [pickState, setPickState] = useState(null);
  const Q = QUIZ_QUESTIONS;
  if (i >= Q.length) {
    return (
      <PopupShell onClose={onClose} eyebrow="Пик Достижений" title="Кардиоринг — итог">
        <p className="pop-body">Вы ответили правильно на <strong>{score}</strong> из {Q.length} вопросов.</p>
        <div style={{textAlign:'center',marginTop:18}}>
          <button className="btn-gold" onClick={() => { onComplete && onComplete(); onClose(); }}>К диплому →</button>
        </div>
      </PopupShell>
    );
  }
  const pick = (val) => {
    const right = val === Q[i].truth;
    setPickState(right ? 'right' : 'wrong');
    if (right) setScore(s => s+1);
    setTimeout(() => { setPickState(null); setI(i+1); }, 700);
  };
  return (
    <PopupShell onClose={onClose} eyebrow="Стоп 21 · Пик Достижений" title="Кардиоринг" spell="Правда или вымысел">
      <div className="quiz-progress">
        {Q.map((_,k) => <span key={k} className={k <= i ? 'done':''}/>)}
      </div>
      <div className="quiz-q">{Q[i].q}</div>
      <div className="quiz-actions">
        <button className="quiz-btn t" onClick={() => pick(true)} disabled={pickState!==null}>Правда</button>
        <button className="quiz-btn f" onClick={() => pick(false)} disabled={pickState!==null}>Вымысел</button>
      </div>
      {pickState && (
        <p style={{textAlign:'center',marginTop:14,fontFamily: "Inter, system-ui, -apple-system, sans-serif",color:pickState==='right'?'#3a6a3a':'#a04040'}}>
          {pickState === 'right' ? '✓ Верно' : '✗ Не совсем'}
        </p>
      )}
    </PopupShell>
  );
}

// ---------- POTION (Stop 20) ----------
function PotionPopup({ stop, onClose }) {
  const ingredients = [
    { id:'A', name:'Корень Сартанус',   dose:[40,80,160] },
    { id:'B', name:'Лист Амлодикс',     dose:[2.5,5,10] },
    { id:'C', name:'Соль Индапамида',   dose:[1.25,2.5] },
    { id:'D', name:'Эфир Бисопролии',   dose:[2.5,5,10] },
  ];
  const VALID = [
    ['A','B','C', [80,5,2.5]],
    ['A','B','C', [160,5,1.25]],
    ['A','B','C', [40,2.5,1.25]],
  ];
  const [picks, setPicks] = useState({});
  const [msg, setMsg] = useState(null);
  const toggle = (id, dose) => setPicks(p => ({ ...p, [id]: p[id]?.dose === dose ? undefined : { dose } }));
  const brew = () => {
    const chosen = Object.entries(picks).filter(([,v]) => v).map(([k,v]) => [k, v.dose]);
    if (chosen.length !== 3) { setMsg({ kind:'err', text:'Истинная Триплексия требует ровно трёх компонентов.' }); return; }
    const ids = chosen.map(c => c[0]).sort();
    const doses = chosen.map(c => c[1]);
    const valid = VALID.find(v => v.slice(0,3).join('') === ids.join(''));
    if (!valid) { setMsg({ kind:'err', text:'Сочетание не одобрено: тройная фиксированная не существует в данной комбинации. Маркетинг: «Триликсам» выпускается строго в трёх дозировках.' }); return; }
    const ok = ids.every((id,k) => valid[3][valid.indexOf(id)] === undefined ? true : true) && JSON.stringify(doses) === JSON.stringify(valid[3]);
    if (ok) setMsg({ kind:'ok', text:'Зелье свернулось в таблетку Триликсам ✓' });
    else setMsg({ kind:'split', text:'Дозировка превышает безопасный предел. Делить нельзя — собрать заново.' });
  };
  return (
    <PopupShell onClose={onClose} eyebrow="Стоп 20 · Лес Заклинаний" title={stop.title} spell={stop.spell} wide>
      <div className="potion-game">
        <div>
          <div className="anamnesis">
            <h5>Анамнез пациента</h5>
            <p>Женщина, 62 года. АГ 2 ст., 8 лет. Дислипидемия. Курение в прошлом. На монотерапии иАПФ — АД 152/94. Жалоб со стороны почек нет. K — 4.1.</p>
            <p style={{marginTop:8,fontStyle:'italic',color:'var(--gold-deep)'}}>«А ты попробуй» — собери минимальную эффективную тройную комбинацию.</p>
          </div>
          {msg && (
            <div style={{marginTop:12,padding:'10px 14px',border:`1px solid ${msg.kind==='ok'?'#3a6a3a':'#a04040'}`,background:'rgba(255,255,255,0.5)',fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontSize:13,color:'var(--ink)'}}>{msg.text}</div>
          )}
        </div>
        <div className="cauldron">
          <svg className="cauldron-svg" viewBox="0 0 160 140">
            <ellipse cx="80" cy="120" rx="55" ry="8" fill="rgba(0,0,0,0.3)"/>
            <path d="M30 60 Q40 110 80 110 Q120 110 130 60 Z" fill="#2a2418" stroke="#1a1410" strokeWidth="1.5"/>
            <ellipse cx="80" cy="60" rx="50" ry="10" fill="#3a342a" stroke="#1a1410"/>
            <ellipse cx="80" cy="58" rx="42" ry="6" fill={msg?.kind==='ok'?'#d4ac5a':'#6a8a6a'}>
              <animate attributeName="ry" values="6;8;6" dur="3s" repeatCount="indefinite"/>
            </ellipse>
            <path d="M70 50 Q72 40 76 44 M86 50 Q88 38 92 44" fill="none" stroke="#e8ecf0" strokeWidth="1" opacity="0.7">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
            </path>
          </svg>
          <div style={{fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontSize:11,color:'var(--gold-deep)'}}>КОТЁЛ</div>
        </div>
      </div>
      <div className="gold-rule" style={{margin:'18px 0 12px'}}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {ingredients.map(ing => (
          <div key={ing.id} style={{border:'1px solid var(--gold-deep)',padding:'10px 12px',background:'rgba(255,255,255,0.4)'}}>
            <div style={{fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontSize:12,color:'var(--ink)',marginBottom:6}}>{ing.name}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {ing.dose.map(d => (
                <button key={d} className={`ing ${picks[ing.id]?.dose===d?'selected':''}`} style={{padding:'4px 10px'}} onClick={() => toggle(ing.id, d)}>{d} mg</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:14}}>
        <button className="btn-ghost" onClick={() => { setPicks({}); setMsg(null); }}>Собрать заново</button>
        <button className="btn-gold" onClick={brew}>Заварить «Триплексио»</button>
      </div>
    </PopupShell>
  );
}

// ---------- AVATAR GEN (Stop 1) ----------
function AvatarPopup({ stop, onClose, onSave }) {
  const TAGS = ['кардиолог','терапевт','исследователь','наставник','новатор','скептик','эмпат','ритмолог'];
  const [picked, setPicked] = useState([]);
  const [text, setText] = useState('');
  const [generated, setGenerated] = useState(false);
  const toggle = (t) => setPicked(p => p.includes(t) ? p.filter(x => x!==t) : [...p, t]);
  return (
    <PopupShell onClose={onClose} eyebrow="Стоп 1 · Река Аватария" title={stop.title}>
      <p className="pop-body">Зачерпните воду из реки Аватарии — и она покажет, кем вы предстанете на дипломе.</p>
      <div style={{margin:'14px 0',display:'flex',flexWrap:'wrap',gap:6}}>
        {TAGS.map(t => (
          <button key={t} onClick={() => toggle(t)} style={{
            padding:'6px 12px',border:`1px solid ${picked.includes(t)?'var(--gold)':'var(--gold-deep)'}`,
            background:picked.includes(t)?'var(--gold)':'transparent',
            color:picked.includes(t)?'#1a1410':'var(--ink)',fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontSize:13,cursor:'pointer'}}>
            {t}
          </button>
        ))}
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Опишите свой образ свободно — несколько слов..."
        style={{width:'100%',minHeight:64,padding:10,border:'1px solid var(--gold-deep)',background:'rgba(255,255,255,0.5)',fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontSize:14,color:'var(--ink)',resize:'vertical'}}/>
      {generated && (
        <div style={{margin:'14px auto 0',width:160,height:160,border:'2px solid var(--gold)',borderRadius:'50%',background:'radial-gradient(circle,#3a2e1c,#1a1410)',display:'grid',placeItems:'center'}}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="38" r="18" fill="#e3c39a"/>
            <path d="M22 90 Q22 60 50 60 Q78 60 78 90 Z" fill="#2e2440"/>
            <circle cx="44" cy="36" r="2" fill="#1a1410"/><circle cx="56" cy="36" r="2" fill="#1a1410"/>
          </svg>
        </div>
      )}
      <div style={{display:'flex',justifyContent:'space-between',marginTop:14}}>
        <button className="btn-ghost" onClick={() => setGenerated(false)}>Сбросить</button>
        {!generated
          ? <button className="btn-gold" onClick={() => setGenerated(true)}>Призвать аватар</button>
          : <button className="btn-gold" onClick={() => { onSave && onSave(); onClose(); }}>Сохранить для диплома</button>}
      </div>
    </PopupShell>
  );
}

// ---------- DIPLOMA (Stop 22) ----------
function DiplomaPopup({ stop, onClose, points }) {
  const lvl = diplomaLevel(points);
  return (
    <PopupShell onClose={onClose} eyebrow="Стоп 22 · Пик Достижений" title="Диплом Ученика" wide>
      <div className="diploma">
        <h2>Волшебная Школа Медицинских Инноваций</h2>
        <div style={{fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontStyle:'italic',color:'var(--gold-deep)',fontSize:15,marginBottom:6}}>имени Асклепия</div>
        <div className="seal" style={{background:`radial-gradient(circle, ${lvl.color}, ${lvl.cls==='gold'?'#8a6a25':lvl.cls==='silver'?'#5e6670':'#5a3a18'})`}}>
          {lvl.cls === 'gold' ? 'AU' : lvl.cls === 'silver' ? 'AG' : lvl.cls === 'bronze' ? 'CU' : '—'}
        </div>
        <p style={{fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontSize:15,color:'var(--ink-soft)',maxWidth:480}}>
          Сим удостоверяется, что Ученик с честью прошёл путь по двадцати двум вехам школы, овладев заклинаниями ритма, давления и здравого смысла.
        </p>
        <div className="level-badge" style={{borderColor:lvl.color,color:lvl.color}}>{lvl.name} уровень · {points}/20 баллов</div>
        <div style={{marginTop:18,display:'flex',gap:10}}>
          <span style={{fontFamily: "Inter, system-ui, -apple-system, sans-serif",fontStyle:'italic',color:'var(--gold-deep)'}}>Орден Ритма и Давления Триархия</span>
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:14}}>
        <button className="btn-ghost" onClick={() => window.print()}>Распечатать</button>
        <button className="btn-gold" onClick={onClose}>Принять</button>
      </div>
    </PopupShell>
  );
}

// ---------- Generic placeholder for shells we haven't fully designed ----------
function GenericPopup({ stop, onClose }) {
  return (
    <PopupShell onClose={onClose} eyebrow={`Стоп ${stop.id} · ${stop.faculty}`} title={stop.title} spell={stop.spell}>
      <p className="pop-body">Содержимое этой остановки будет добавлено в следующем витке. Тип: <em>{stop.type}</em>.</p>
      <p className="pop-body" style={{fontStyle:'italic',color:'var(--gold-deep)',marginTop:10}}>{stop.subtitle}</p>
    </PopupShell>
  );
}

window.PopupShell = PopupShell;
window.BookPopup = BookPopup;
window.VideoPopup = VideoPopup;
window.CardsPopup = CardsPopup;
window.QuizPopup = QuizPopup;
window.PotionPopup = PotionPopup;
window.AvatarPopup = AvatarPopup;
window.DiplomaPopup = DiplomaPopup;
window.GenericPopup = GenericPopup;
