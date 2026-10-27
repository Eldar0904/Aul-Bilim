/* ============================================================
   AUYL BILIM — «Дорожная карта проекта»
   Маршрут из девяти станций: змейка с плавными изгибами,
   иконка и номер на каждой станции, бегущий поток по трассе,
   раскрытие шага в панели. Двуязычие — родным механизмом сайта.
   ============================================================ */
(function () {
  'use strict';

  var PHASES = [
    { id: 'prep',  c: '#1B4F8A', c2: '#2D6AB4', kk: 'Дайындық',  ru: 'Подготовка' },
    { id: 'build', c: '#E8820A', c2: '#F2A413', kk: 'Жабдықтау', ru: 'Оснащение' },
    { id: 'learn', c: '#1C7A5C', c2: '#2E9E77', kk: 'Оқыту',     ru: 'Обучение' },
    { id: 'proof', c: '#6C3E92', c2: '#8A5AB4', kk: 'Нәтиже',    ru: 'Результат' }
  ];

  var OWNERS = {
    local: { cls: 'local', kk: 'Білім басқармасы',    ru: 'Управление образования' },
    jf:    { cls: 'jf',    kk: 'Жоба операторы',       ru: 'Оператор проекта' },
    bi:    { cls: 'bi',    kk: 'Академиялық серіктес', ru: 'Академический партнёр' },
    edu:   { cls: 'edu',   kk: 'Тәуелсіз мониторинг',  ru: 'Независимый мониторинг' },
    all:   { cls: 'all',   kk: 'Барлық серіктестер',    ru: 'Все партнёры' },
    vendor:{ cls: 'vendor',kk: 'Жабдық жеткізушілері',  ru: 'Поставщики оборудования' }
  };

  /* Иконки станций — штриховые, 24×24, рисуются currentColor */
  var ICONS = {
    doc:    '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
    list:   '<path d="M8 5h12M8 12h12M8 19h12"/><circle cx="4" cy="5" r="1.4"/><circle cx="4" cy="12" r="1.4"/><circle cx="4" cy="19" r="1.4"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    tool:   '<path d="M14.5 5.5a4 4 0 0 0 5 5L21 9l-6 6-6 6-3-3 6-6 6-6z"/><path d="M4 20l3-3"/>',
    box:    '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
    gauge:  '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-5"/>',
    cap:    '<path d="M12 4l9 4.5-9 4.5-9-4.5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',
    hands:  '<path d="M9 12a3 3 0 1 1 6 0"/><path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6"/><circle cx="12" cy="6" r="2.6"/>',
    chart:  '<path d="M4 20V10M10 20V5M16 20v-7M22 20H2"/>',
    report: '<path d="M6 3h9l3 3v15H6z"/><path d="M9 11h6M9 15h4"/><path d="M15 3v3h3"/>'
  };

  /* x, y — координаты станции в системе SVG 1200 × 780 */
  var STEPS = [
  {
    "n": 1,
    "phase": "prep",
    "owner": "all",
    "icon": "doc",
    "x": 150,
    "y": 120,
    "kk": "Меморандум және Жол картасы",
    "ru": "Меморандум и дорожная карта",
    "dkk": "Серіктестер жобаның мақсатын, міндеттерін, жауапкершіліктері мен іске асыру тәртібін келіседі.",
    "dru": "Партнёры согласовывают цель проекта, задачи, обязанности и порядок реализации.",
    "okk": "Келісілген міндеттер мен іс-шаралар жоспары",
    "oru": "Согласованные обязанности и план мероприятий"
  },
  {
    "n": 2,
    "phase": "prep",
    "owner": "local",
    "icon": "list",
    "x": 400,
    "y": 120,
    "kk": "Мектептерді іріктеу",
    "ru": "Отбор школ",
    "dkk": "Білім басқармасы мектептерді білім сапасы, инфрақұрылымы, педагогтердің біліктілігі және орналасуы сияқты өлшемдер бойынша іріктейді.",
    "dru": "Управление образования отбирает школы с учётом качества знаний, инфраструктуры, квалификации педагогов и расположения.",
    "okk": "Жобаға қатысатын мектептердің тізімі",
    "oru": "Список школ — участников проекта"
  },
  {
    "n": 3,
    "phase": "prep",
    "owner": "jf",
    "icon": "search",
    "x": 650,
    "y": 120,
    "kk": "Инвентаризация жасау",
    "ru": "Инвентаризация кабинетов",
    "dkk": "Жоба операторы кабинеттер мен қолда бар жабдықтың жағдайын бағалап, әр мектептің қажеттілігін анықтайды.",
    "dru": "Оператор проекта оценивает состояние кабинетов и имеющегося оборудования, определяя потребности каждой школы.",
    "okk": "Кабинеттерді жабдықтау қажеттілігі",
    "oru": "Определённые потребности в оснащении кабинетов"
  },
  {
    "n": 4,
    "phase": "build",
    "owner": "local",
    "icon": "tool",
    "x": 900,
    "y": 120,
    "kk": "Кабинеттерді жөндеу",
    "ru": "Ремонт кабинетов",
    "dkk": "Оқу кабинеттері жабдықтауға дайындалады: жөндеу жүргізіліп, онлайн оқытуға қажетті интернет жағдайы қамтамасыз етіледі.",
    "dru": "Кабинеты подготавливаются к оснащению: проводится ремонт и обеспечивается интернет для онлайн-обучения.",
    "okk": "Жабдықтауға дайын оқу кабинеттері",
    "oru": "Учебные кабинеты, подготовленные к оснащению"
  },
  {
    "n": 5,
    "phase": "build",
    "owner": "vendor",
    "icon": "box",
    "x": 900,
    "y": 320,
    "kk": "Жабдықтау",
    "ru": "Оснащение",
    "dkk": "Мектеп қажеттілігіне қарай кабинеттер жиһазбен, зертханалық және цифрлық жабдықпен толықтырылады. Жеткізушілер жабдықты орнатып, пайдалану бойынша нұсқама береді.",
    "dru": "С учётом потребностей школ кабинеты оснащаются мебелью, лабораторным и цифровым оборудованием. Поставщики устанавливают оборудование и проводят инструктаж.",
    "okk": "Заманауи жабдықпен қамтамасыз етілген кабинеттер",
    "oru": "Кабинеты, оснащённые современным оборудованием"
  },
  {
    "n": 6,
    "phase": "learn",
    "owner": "bi",
    "icon": "cap",
    "x": 550,
    "y": 320,
    "kk": "Біліктілікті арттыру курстары",
    "ru": "Курсы повышения квалификации",
    "dkk": "Педагогтер мен мектеп басшылары пәндік білімін, оқыту әдістемесін, цифрлық және басқарушылық дағдыларын дамытады.",
    "dru": "Педагоги и руководители школ развивают предметные знания, методику преподавания, цифровые и управленческие навыки.",
    "okk": "Біліктілігін арттырған педагогтер мен мектеп басшылары",
    "oru": "Педагоги и руководители школ, повысившие квалификацию"
  },
  {
    "n": 7,
    "phase": "learn",
    "owner": "bi",
    "icon": "hands",
    "x": 400,
    "y": 520,
    "kk": "Менторлық қызмет",
    "ru": "Менторство",
    "dkk": "Менторлар педагогтерге жаңа әдістер мен жабдықты сабақта қолдануға көмектеседі: шеберлік сыныптары, кеңестер және онлайн немесе офлайн қолдау көрсетіледі. Қажеттілікке қарай мектептер арасында онлайн оқыту ұйымдастырылады.",
    "dru": "Менторы помогают педагогам применять новые методики и оборудование: проводят мастер-классы, консультации и оказывают поддержку онлайн и очно. При необходимости между школами организуется онлайн-обучение.",
    "okk": "Оқу тәжірибесіне енгізілген әдістер мен құралдар",
    "oru": "Методики и инструменты, применяемые в обучении"
  },
  {
    "n": 8,
    "phase": "proof",
    "owner": "edu",
    "icon": "chart",
    "x": 650,
    "y": 520,
    "kk": "Оқушылар білімінің мониторингі",
    "ru": "Мониторинг знаний учащихся",
    "dkk": "Оқушылардың бастапқы және қорытынды білім деңгейі салыстырылады. Үлгерім мен сауалнама нәтижелері де талданып, білім беру ортасындағы өзгерістер бағаланады.",
    "dru": "Сравниваются результаты входного и итогового оценивания учащихся. Также анализируются успеваемость и результаты опросов для оценки изменений в образовательной среде.",
    "okk": "Білім нәтижелері мен білім беру ортасындағы өзгерістерді бағалау",
    "oru": "Оценка образовательных результатов и изменений в школьной среде"
  },
  {
    "n": 9,
    "phase": "proof",
    "owner": "jf",
    "icon": "report",
    "x": 900,
    "y": 520,
    "kk": "Есеп беру және теңгерімге қою",
    "ru": "Отчётность и постановка на баланс",
    "dkk": "Жеткізілген жабдық түгенделіп, тиісті қабылдау құжаттары рәсімделеді. Жоба барысы мен нәтижелері бойынша аралық және қорытынды есептер ұсынылады.",
    "dru": "Поставленное оборудование инвентаризируется, оформляются документы приёмки. По ходу реализации и итогам проекта предоставляются промежуточные и итоговые отчёты.",
    "okk": "Жабдық құжаттары және жоба есептері",
    "oru": "Документы на оборудование и отчёты по проекту"
  }
];

  var PATH =
    'M 150 120 L 900 120 ' +
    'C 1052 120 1072 158 1072 220 ' +
    'C 1072 282 1052 320 900 320 ' +
    'L 400 320 ' +
    'C 248 320 228 358 228 420 ' +
    'C 228 482 248 520 400 520 ' +
    'L 900 520';


  /* Вертикальная раскладка для узких экранов: зигзаг сверху вниз.
     Система координат 380 × 1550, шаг между станциями 170. */
  var V_X = [96, 284];
  function vy(i) { return 92 + i * 170; }
  var V_PATH = (function () {
    var d = 'M ' + V_X[0] + ' ' + vy(0);
    for (var i = 1; i < STEPS.length; i++) {
      var px = V_X[(i - 1) % 2], py = vy(i - 1);
      var cx = V_X[i % 2], cy = vy(i);
      var mid = (py + cy) / 2;
      d += ' C ' + px + ' ' + mid + ', ' + cx + ' ' + mid + ', ' + cx + ' ' + cy;
    }
    return d;
  })();

  function two(n) { return n < 10 ? '0' + n : String(n); }
  function bi(kk, ru, en) {
    return '<span lang="kk">' + kk + '</span><span lang="ru">' + ru + '</span>';
  }
  function phaseOf(id) { for (var i = 0; i < PHASES.length; i++) if (PHASES[i].id === id) return PHASES[i]; return PHASES[0]; }

  document.addEventListener('DOMContentLoaded', function () {
    var mapHost = document.getElementById('road-map');
    var panel = document.getElementById('road-panel');
    var listHost = document.getElementById('road-list');
    var legend = document.getElementById('road-legend');
    if (!mapHost || !panel) return;

    /* ---------- легенда фаз ---------- */
    if (legend) {
      legend.innerHTML = PHASES.map(function (p, i) {
        var of = STEPS.filter(function (s) { return s.phase === p.id; });
        var range = two(of[0].n) + '–' + two(of[of.length - 1].n);
        return '<button type="button" class="road-lg" data-phase="' + p.id + '" ' +
                 'style="--lg:' + p.c + '">' +
                 '<i></i><span class="road-lg-name">' + bi(p.kk, p.ru) + '</span>' +
                 '<b>' + range + '</b></button>';
      }).join('');
    }

    /* ---------- SVG ---------- */
    var defs =
      '<defs>' +
        '<linearGradient id="rgFlow" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#1B4F8A"/><stop offset="35%" stop-color="#F2A413"/>' +
          '<stop offset="70%" stop-color="#1C7A5C"/><stop offset="100%" stop-color="#6C3E92"/>' +
        '</linearGradient>' +
        PHASES.map(function (p) {
          return '<linearGradient id="rg-' + p.id + '" x1="0" y1="0" x2="0" y2="1">' +
                 '<stop offset="0%" stop-color="' + p.c2 + '"/>' +
                 '<stop offset="100%" stop-color="' + p.c + '"/></linearGradient>';
        }).join('') +
        '<filter id="rgSoft" x="-60%" y="-60%" width="220%" height="220%">' +
          '<feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="#0E2A52" flood-opacity=".28"/>' +
        '</filter>' +
      '</defs>';

    var out = ['<svg class="road-svg" viewBox="0 0 1200 640" role="group" aria-label="Дорожная карта проекта: десять шагов">', defs];

    out.push('<path class="road-track" d="' + PATH + '"/>');
    out.push('<path class="road-track-line" d="' + PATH + '"/>');
    out.push('<path class="road-track-flow" d="' + PATH + '"/>');

    STEPS.forEach(function (s, i) {
      var ph = phaseOf(s.phase);
      var above = s.y === 390;
      var labelY = above ? -104 : 54;
      out.push(
        '<g class="road-stop" data-n="' + s.n + '" data-phase="' + s.phase + '" ' +
           'transform="translate(' + s.x + ',' + s.y + ')" tabindex="0" role="button" ' +
           'style="--c:' + ph.c + ';--c2:' + ph.c2 + ';animation-delay:' + (i * 70) + 'ms" ' +
           'aria-label="' + s.n + '. ' + s.ru.replace(/"/g, '') + '">' +
          '<circle class="road-pulse" r="30"/>' +
          '<circle class="road-halo" r="33"/>' +
          '<circle class="road-dot" r="26" fill="url(#rg-' + ph.id + ')" filter="url(#rgSoft)"/>' +
          '<g class="road-ico" transform="translate(-11,-11) scale(.92)">' + ICONS[s.icon] + '</g>' +
          '<g class="road-badge" transform="translate(19,-19)">' +
            '<circle r="13"/><text class="road-badge-n" y="4.5">' + two(s.n) + '</text>' +
          '</g>' +
          '<foreignObject x="-120" y="' + labelY + '" width="240" height="52">' +
            '<div xmlns="http://www.w3.org/1999/xhtml" class="road-stop-label">' + bi(s.kk, s.ru) + '</div>' +
          '</foreignObject>' +
        '</g>'
      );
    });
    out.push('</svg>');
    mapHost.innerHTML = out.join('');

    /* ---------- вертикальная карта для узких экранов ---------- */
    var vHost = document.getElementById('road-map-v');
    if (vHost) {
      var v = ['<svg class="road-svg-v" viewBox="0 0 380 1550" role="group" aria-label="Дорожная карта проекта">', defs.replace(/id="rg/g, 'id="vrg')];
      v.push('<path class="road-track" d="' + V_PATH + '"/>');
      v.push('<path class="road-track-line" d="' + V_PATH + '"/>');
      v.push('<path class="road-track-flow" d="' + V_PATH + '"/>');
      STEPS.forEach(function (s, i) {
        var ph = phaseOf(s.phase);
        var x = V_X[i % 2], y = vy(i);
        var right = (i % 2 === 0);
        var lx = right ? 46 : -226;
        v.push(
          '<g class="road-stop road-stop-v" data-n="' + s.n + '" transform="translate(' + x + ',' + y + ')" ' +
             'tabindex="0" role="button" style="--c:' + ph.c + ';--c2:' + ph.c2 + '" ' +
             'aria-label="' + s.n + '. ' + s.ru.replace(/"/g, '') + '">' +
            '<circle class="road-pulse" r="26"/>' +
            '<circle class="road-halo" r="29"/>' +
            '<circle class="road-dot" r="23" fill="url(#vrg-' + ph.id + ')"/>' +
            '<g class="road-ico" transform="translate(-10,-10) scale(.84)">' + ICONS[s.icon] + '</g>' +
            '<g class="road-badge" transform="translate(17,-17)">' +
              '<circle r="12"/><text class="road-badge-n" y="4">' + two(s.n) + '</text>' +
            '</g>' +
            '<foreignObject x="' + lx + '" y="-34" width="180" height="68">' +
              '<div xmlns="http://www.w3.org/1999/xhtml" class="road-stop-label-v' + (right ? '' : ' is-left') + '">' +
                '<span class="rsl-phase">' + bi(ph.kk, ph.ru) + '</span>' +
                '<span class="rsl-name">' + bi(s.kk, s.ru) + '</span>' +
              '</div>' +
            '</foreignObject>' +
          '</g>'
        );
      });
      v.push('</svg>');
      vHost.innerHTML = v.join('');
    }


    /* ---------- панель ---------- */
    var currentN = 0;
    var dialog = document.getElementById('road-dialog');
    function openStep(n) {
      show(n);
      if (dialog && !dialog.open) {
        dialog.showModal();
        document.documentElement.classList.add('road-dialog-open');
      }
    }
    if (dialog) {
      dialog.querySelector('.road-dialog-close').addEventListener('click', function () { dialog.close(); });
      dialog.addEventListener('click', function (e) {
        var box = dialog.getBoundingClientRect();
        if (e.target === dialog && (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom)) dialog.close();
      });
      dialog.addEventListener('close', function () { document.documentElement.classList.remove('road-dialog-open'); });
    }
    function show(n) {
      if (n === currentN) return;
      var s = null;
      STEPS.forEach(function (x) { if (x.n === n) s = x; });
      if (!s) return;
      currentN = n;
      var ph = phaseOf(s.phase), ow = OWNERS[s.owner];

      panel.classList.remove('is-in');
      panel.setAttribute('style', '--c:' + ph.c + ';--c2:' + ph.c2);
      panel.innerHTML =
        '<div class="road-panel-bar"></div>' +
        '<div class="road-panel-head">' +
          '<span class="road-panel-n">' + two(s.n) + '</span>' +
          '<div class="road-panel-title">' +
            '<span class="road-panel-phase">' + bi(ph.kk, ph.ru) + '</span>' +
            '<h4 id="road-dialog-title">' + bi(s.kk, s.ru) + '</h4>' +
          '</div>' +
          '<span class="road-owner road-owner--' + ow.cls + '">' + bi(ow.kk, ow.ru) + '</span>' +
        '</div>' +
        '<p class="road-panel-text">' + bi(s.dkk, s.dru) + '</p>' +
        (s.sections ? '<div class="road-panel-sections">' + s.sections.map(function (item) {
          return '<section class="road-panel-section"><h5>' + bi(item.kk, item.ru) + '</h5><p>' + bi(item.dkk, item.dru) + '</p></section>';
        }).join('') + '</div>' : '') +
        '<div class="road-panel-nav">' +
          '<button type="button" class="road-nav-btn" data-go="' + (n > 1 ? n - 1 : STEPS.length) + '" aria-label="Предыдущий шаг">←</button>' +
          '<span class="road-nav-count"><b>' + two(n) + '</b> / ' + STEPS.length + '</span>' +
          '<button type="button" class="road-nav-btn" data-go="' + (n < STEPS.length ? n + 1 : 1) + '" aria-label="Следующий шаг">→</button>' +
        '</div>';
      requestAnimationFrame(function () { panel.classList.add('is-in'); });

      Array.prototype.forEach.call(panel.querySelectorAll('[data-go]'), function (b) {
        b.addEventListener('click', function () { show(+b.getAttribute('data-go')); });
      });
      Array.prototype.forEach.call(document.querySelectorAll('.road-stop'), function (g) {
        g.classList.toggle('is-active', +g.getAttribute('data-n') === n);
        g.setAttribute('aria-pressed', String(+g.getAttribute('data-n') === n));
      });
      Array.prototype.forEach.call(document.querySelectorAll('.road-item'), function (it) {
        it.classList.toggle('is-active', +it.getAttribute('data-n') === n);
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-dot]'), function (d) {
        d.classList.toggle('on', +d.getAttribute('data-dot') === n);
      });
      if (legend) Array.prototype.forEach.call(legend.querySelectorAll('.road-lg'), function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-phase') === s.phase);
        b.setAttribute('aria-pressed', String(b.getAttribute('data-phase') === s.phase));
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll('.road-stop'), function (g) {
      var n = +g.getAttribute('data-n');
      g.setAttribute('aria-haspopup', 'dialog');
      g.setAttribute('aria-controls', 'road-dialog');
      g.addEventListener('click', function () {
        openStep(n);
      });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStep(n); }
      });
    });

    if (legend) Array.prototype.forEach.call(legend.querySelectorAll('.road-lg'), function (b) {
      b.addEventListener('click', function () {
        var ph = b.getAttribute('data-phase');
        var first = STEPS.filter(function (s) { return s.phase === ph; })[0];
        if (first) {
          openStep(first.n);
        }
      });
    });

    /* ---------- список для узких экранов ---------- */
    if (listHost) {
      listHost.innerHTML = STEPS.map(function (s) {
        var ph = phaseOf(s.phase), ow = OWNERS[s.owner];
        return '<article class="road-item" data-n="' + s.n + '" style="--c:' + ph.c + ';--c2:' + ph.c2 + '">' +
          '<span class="road-item-n">' + two(s.n) + '</span>' +
          '<div class="road-item-body">' +
            '<span class="road-item-phase">' + bi(ph.kk, ph.ru) + '</span>' +
            '<h4>' + bi(s.kk, s.ru) + '</h4>' +
            '<p>' + bi(s.dkk, s.dru) + '</p>' +
          '</div>' +
          '<span class="road-owner road-owner--' + ow.cls + '">' + bi(ow.kk, ow.ru) + '</span>' +
        '</article>';
      }).join('');

      var swipe = document.createElement('div');
      swipe.className = 'road-swipe';
      swipe.innerHTML =
        '<span lang="kk">Сырғытыңыз</span><span lang="ru">Листайте</span>' +
        '<span class="road-swipe-dots">' +
          STEPS.map(function (s) { return '<i data-dot="' + s.n + '"></i>'; }).join('') +
        '</span>';
      listHost.parentNode.insertBefore(swipe, listHost.nextSibling);
    }

    function scrollSliderTo(n) {
      if (!listHost) return;
      var card = listHost.querySelector('.road-item[data-n="' + n + '"]');
      if (!card) return;
      var left = card.offsetLeft - (listHost.clientWidth - card.offsetWidth) / 2;
      listHost.scrollTo({ left: left, behavior: 'smooth' });
    }

    if (listHost) {
      var swTimer = null;
      listHost.addEventListener('scroll', function () {
        clearTimeout(swTimer);
        swTimer = setTimeout(function () {
          var mid = listHost.scrollLeft + listHost.clientWidth / 2;
          var best = null, bestD = Infinity;
          Array.prototype.forEach.call(listHost.querySelectorAll('.road-item'), function (c) {
            var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
            if (d < bestD) { bestD = d; best = c; }
          });
          if (best) {
            var n = +best.getAttribute('data-n');
            if (n !== currentN) show(n);
          }
        }, 90);
      }, { passive: true });
    }

    show(1);

    /* ---------- появление ---------- */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        mapHost.classList.add('is-drawn');
        if (vHost) vHost.classList.add('is-drawn');
        io.disconnect();
      }, { threshold: 0.15 });
      io.observe(mapHost);
      if (vHost) {
        var io2 = new IntersectionObserver(function (en) {
          if (!en[0].isIntersecting) return;
          vHost.classList.add('is-drawn');
          io2.disconnect();
        }, { threshold: 0.05 });
        io2.observe(vHost);
      }
    } else {
      mapHost.classList.add('is-drawn');
      if (vHost) vHost.classList.add('is-drawn');
    }
  });
})();

