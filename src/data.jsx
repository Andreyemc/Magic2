// Stops data — positions in % of map image (6336x2688)
const FACULTIES = {
  F1: 'Факультет инновационного развития врача и лидерства',
  F2: 'Факультет искусственного интеллекта',
  F3: 'Факультет сложных материй и фиксированной тройной комбинации',
  F4: 'Факультет пациентов высокого СС-риска',
  LIB: 'Вековая библиотека',
  FOREST: 'Лес заклинаний',
  PEAK: 'Пик достижений',
  COFFEE: 'Кофейня «Три зерна кардиологии»',
  STREAM: 'Ручей Знаний',
};

// Coordinates (x%, y%) anchored to landmarks on the provided map image.
// Refined per landmark guide in spec; multiple stops cluster around their building.
const STOPS = [
  // F1 — Stop 1: river hit area handled separately. Pin sits over river label.
  { id:1,  faculty:FACULTIES.F1, title:'Река Аватария', subtitle:'Развлечение · аватар',
    professor:'demkina', type:'avatar-gen', awardsPoints:false,
    position:{x:24, y:48}, glyph:'river' },
  // 2,3 — F1 academic building (39%, 38%)
  { id:2,  faculty:FACULTIES.F1, title:'Видео мотивации врача', subtitle:'Личный блог · нетворкинг',
    professor:'demkina', type:'video', awardsPoints:true,
    position:{x:36, y:36}, glyph:'scroll' },
  { id:3,  faculty:FACULTIES.F1, title:'Шпаргалка от лидера', subtitle:'Соцсети · PDF',
    professor:'demkina', type:'cards-download', awardsPoints:true,
    position:{x:42, y:40}, glyph:'feather' },
  // 4,5 — Coffee shop (22%, 72%)
  { id:4,  faculty:FACULTIES.COFFEE, title:'Видео трёх лидеров', subtitle:'О пользе и вреде кофе',
    type:'video', awardsPoints:true,
    position:{x:20, y:70}, glyph:'cup' },
  { id:5,  faculty:FACULTIES.COFFEE, title:'«Элевато Максима»', subtitle:'Вещества, повышающие АГ',
    spell:'Elevato Maxima', type:'cards-download', awardsPoints:true,
    position:{x:25, y:74}, glyph:'flask' },
  // 6,7 — F2 gear tower (30%, 50%)
  { id:6,  faculty:FACULTIES.F2, title:'ИИ в медицине', subtitle:'Прокачка с Демкиной',
    professor:'demkina', type:'video', awardsPoints:true,
    position:{x:28, y:48}, glyph:'eye' },
  { id:7,  faculty:FACULTIES.F2, title:'Боишься ИИ?', subtitle:'Шпаргалка · PDF',
    professor:'demkina', type:'cards-download', awardsPoints:true,
    position:{x:33, y:52}, glyph:'gear' },
  // 8,9 — F3 three-tower castle (50%, 47%)
  { id:8,  faculty:FACULTIES.F3, title:'«Триптих»', subtitle:'Видео исследования',
    professor:'chernova', type:'video', awardsPoints:true,
    position:{x:48, y:45}, glyph:'tablet' },
  { id:9,  faculty:FACULTIES.F3, title:'Кардиоонкология', subtitle:'Слайды · клинреки',
    professor:'chernova', type:'cards-no-download', awardsPoints:true,
    position:{x:54, y:49}, glyph:'heart' },
  // 10,11,12 — Stream of Knowledge (62%, 42%)
  { id:10, faculty:FACULTIES.STREAM, title:'ОАС и АГ', subtitle:'Шпаргалка · PDF',
    type:'cards-download', awardsPoints:true,
    position:{x:60, y:40}, glyph:'wave' },
  { id:11, faculty:FACULTIES.STREAM, title:'Глаукома и АГ', subtitle:'Шпаргалка · PDF',
    type:'cards-download', awardsPoints:true,
    position:{x:64, y:44}, glyph:'eye' },
  { id:12, faculty:FACULTIES.STREAM, title:'Перименопауза и АГ', subtitle:'Шпаргалка · PDF',
    type:'cards-download', awardsPoints:true,
    position:{x:67, y:42}, glyph:'moon' },
  // 13–16 — F4 fortress (68%, 52%)
  { id:13, faculty:FACULTIES.F4, title:'150 — проблема или нет?', subtitle:'Вертикальное видео',
    professor:'tamaz', type:'video-vertical', awardsPoints:true,
    position:{x:66, y:50}, glyph:'gauge' },
  { id:14, faculty:FACULTIES.F4, title:'Лечить нельзя игнорировать', subtitle:'Тихие пациенты',
    professor:'tamaz', type:'video-vertical', awardsPoints:true,
    position:{x:70, y:54}, glyph:'shield' },
  { id:15, faculty:FACULTIES.F4, title:'«Васкуло Репэро»', subtitle:'АГ при ИБС',
    spell:'Vasculo Reparo', professor:'tamaz', type:'cards-no-download', awardsPoints:true,
    position:{x:73, y:50}, glyph:'flask' },
  { id:16, faculty:FACULTIES.F4, title:'Вторичная гипертензия', subtitle:'Принципы диагностики',
    professor:'tamaz', type:'cards-no-download', awardsPoints:true,
    position:{x:69, y:46}, glyph:'feather' },
  // 17,18,19 — Library (76%, 24%)
  { id:17, faculty:FACULTIES.LIB, title:'«Рекомендацио»', subtitle:'Карманное руководство',
    spell:'Recommendatio', professor:'tamaz', type:'book', awardsPoints:true,
    position:{x:74, y:22}, glyph:'book' },
  { id:18, faculty:FACULTIES.LIB, title:'«Выбиракулус»', subtitle:'Противопоказания классов',
    spell:'Vybiraculus', professor:'tamaz', type:'cards-no-download', awardsPoints:true,
    position:{x:78, y:26}, glyph:'scroll' },
  { id:19, faculty:FACULTIES.LIB, title:'«Масси»', subtitle:'ESH 2025',
    type:'cards-no-download', awardsPoints:true,
    position:{x:80, y:22}, glyph:'feather' },
  // 20 — Forest of Spells (78%, 76%)
  { id:20, faculty:FACULTIES.FOREST, title:'«Триплексио»', subtitle:'Котёл · мини-игра',
    spell:'Triplexio', professor:'tamaz', type:'potion-game', awardsPoints:true,
    position:{x:78, y:74}, glyph:'cauldron' },
  // 21,22 — Peak (95%, 52%)
  { id:21, faculty:FACULTIES.PEAK, title:'Кардиоринг', subtitle:'Квиз · правда/вымысел',
    type:'quiz', awardsPoints:true,
    position:{x:93, y:50}, glyph:'mountain' },
  { id:22, faculty:FACULTIES.PEAK, title:'Получение диплома', subtitle:'Магистр',
    type:'diploma', awardsPoints:false,
    position:{x:96, y:45}, glyph:'diploma' },
];

const GLYPHS = {
  river:'<path d="M6 22 Q15 12 22 18 T40 14" fill="none" stroke="#3a342a" stroke-width="1.4"/><path d="M6 28 Q15 18 22 24 T40 20" fill="none" stroke="#3a342a" stroke-width="1.4"/><circle cx="34" cy="10" r="1.5" fill="#3a342a"/>',
  scroll:'<rect x="10" y="12" width="26" height="20" fill="#e3d8bc" stroke="#3a342a" stroke-width="1.2"/><circle cx="10" cy="12" r="3" fill="#c9a961" stroke="#3a342a"/><circle cx="36" cy="32" r="3" fill="#c9a961" stroke="#3a342a"/><line x1="14" y1="20" x2="32" y2="20" stroke="#3a342a"/><line x1="14" y1="24" x2="28" y2="24" stroke="#3a342a"/>',
  feather:'<path d="M14 30 Q18 14 30 10 Q26 22 18 32 Z" fill="#e3d8bc" stroke="#3a342a" stroke-width="1.2"/><line x1="22" y1="20" x2="14" y2="34" stroke="#3a342a"/>',
  cup:'<path d="M12 16 H32 V26 Q32 32 22 32 Q12 32 12 26 Z" fill="#e3d8bc" stroke="#3a342a" stroke-width="1.3"/><path d="M32 18 Q38 18 38 22 Q38 26 32 26" fill="none" stroke="#3a342a" stroke-width="1.3"/><path d="M16 12 Q18 10 16 8 M22 12 Q24 10 22 8 M28 12 Q30 10 28 8" fill="none" stroke="#3a342a"/>',
  flask:'<path d="M18 8 V18 L12 32 Q12 36 22 36 Q32 36 32 32 L26 18 V8 Z" fill="#e3d8bc" stroke="#3a342a" stroke-width="1.3"/><line x1="14" y1="8" x2="30" y2="8" stroke="#3a342a" stroke-width="1.4"/><circle cx="20" cy="28" r="1.5" fill="#3a342a"/>',
  eye:'<path d="M6 22 Q22 10 38 22 Q22 34 6 22Z" fill="#e3d8bc" stroke="#3a342a" stroke-width="1.3"/><circle cx="22" cy="22" r="5" fill="#3a342a"/><circle cx="22" cy="22" r="2" fill="#e3d8bc"/>',
  gear:'<g stroke="#3a342a" stroke-width="1.2" fill="#e3d8bc"><circle cx="22" cy="22" r="8"/><rect x="20" y="6" width="4" height="6"/><rect x="20" y="32" width="4" height="6"/><rect x="6" y="20" width="6" height="4"/><rect x="32" y="20" width="6" height="4"/></g><circle cx="22" cy="22" r="3" fill="#3a342a"/>',
  tablet:'<rect x="10" y="14" width="24" height="16" rx="8" fill="#e3d8bc" stroke="#3a342a" stroke-width="1.3"/><line x1="22" y1="14" x2="22" y2="30" stroke="#3a342a"/>',
  heart:'<path d="M22 32 Q8 22 8 16 Q8 10 14 10 Q18 10 22 14 Q26 10 30 10 Q36 10 36 16 Q36 22 22 32Z" fill="#e3d8bc" stroke="#3a342a" stroke-width="1.3"/><path d="M14 18 H18 L20 14 L24 24 L26 18 H30" fill="none" stroke="#3a342a" stroke-width="1.2"/>',
  wave:'<path d="M6 18 Q12 12 18 18 T30 18 T42 18" fill="none" stroke="#3a342a" stroke-width="1.4"/><path d="M6 26 Q12 20 18 26 T30 26 T42 26" fill="none" stroke="#3a342a" stroke-width="1.4"/>',
  moon:'<path d="M28 8 A14 14 0 1 0 28 36 A11 11 0 1 1 28 8Z" fill="#e3d8bc" stroke="#3a342a" stroke-width="1.3"/>',
  gauge:'<path d="M8 28 A14 14 0 0 1 36 28" fill="none" stroke="#3a342a" stroke-width="1.4"/><line x1="22" y1="28" x2="32" y2="14" stroke="#3a342a" stroke-width="1.6"/><circle cx="22" cy="28" r="2" fill="#3a342a"/>',
  shield:'<path d="M22 8 L34 12 V22 Q34 30 22 36 Q10 30 10 22 V12 Z" fill="#e3d8bc" stroke="#3a342a" stroke-width="1.3"/><path d="M22 16 V28 M16 22 H28" stroke="#3a342a" stroke-width="1.3"/>',
  book:'<path d="M8 10 L22 14 L36 10 V32 L22 36 L8 32 Z" fill="#e3d8bc" stroke="#3a342a" stroke-width="1.3"/><line x1="22" y1="14" x2="22" y2="36" stroke="#3a342a"/>',
  cauldron:'<ellipse cx="22" cy="28" rx="14" ry="6" fill="#3a342a"/><path d="M8 22 Q22 32 36 22 V28 Q36 36 22 36 Q8 36 8 28Z" fill="#3a342a"/>',
  mountain:'<path d="M6 32 L16 14 L22 22 L30 10 L40 32 Z" fill="#e3d8bc" stroke="#3a342a" stroke-width="1.3"/>',
  diploma:'<rect x="8" y="10" width="28" height="20" fill="#e3d8bc" stroke="#3a342a" stroke-width="1.3"/><line x1="12" y1="16" x2="32" y2="16" stroke="#3a342a"/><line x1="12" y1="20" x2="28" y2="20" stroke="#3a342a"/><circle cx="32" cy="30" r="4" fill="#c9a961" stroke="#3a342a"/>',
};

function diplomaLevel(points){
  if (points >= 15) return { name:'Золотой', cls:'gold', color:'#d4ac5a' };
  if (points >= 10) return { name:'Серебряный', cls:'silver', color:'#aab2bb' };
  if (points >= 5)  return { name:'Бронзовый', cls:'bronze', color:'#a06a3a' };
  return { name:'Не присвоено', cls:'none', color:'#7a6a4a' };
}

const QUIZ_QUESTIONS = [
  { q:'Кофе абсолютно противопоказан пациентам с АГ.', truth:false },
  { q:'Фиксированные тройные комбинации улучшают комплаенс.', truth:true },
  { q:'У пациентов с глаукомой можно безопасно назначать любые антигипертензивные.', truth:false },
  { q:'НПВС могут повышать АД у некоторых пациентов.', truth:true },
  { q:'Перименопауза не влияет на АД.', truth:false },
  { q:'При АГ + ИБС бета-блокаторы остаются препаратами выбора.', truth:true },
  { q:'150/95 в пожилом возрасте — это вариант нормы.', truth:false },
  { q:'Вторичная гипертензия требует исключения у молодых с резистентной АГ.', truth:true },
  { q:'Тройная фиксированная комбинация всегда содержит бета-блокатор.', truth:false },
  { q:'Регулярное АД-мониторирование снижает сердечно-сосудистый риск.', truth:true },
];

window.STOPS = STOPS;
window.GLYPHS = GLYPHS;
window.FACULTIES = FACULTIES;
window.diplomaLevel = diplomaLevel;
window.QUIZ_QUESTIONS = QUIZ_QUESTIONS;
window.MAP_W = 3168;
window.MAP_H = 1344;
