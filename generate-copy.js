'use strict';
const path = require('path');
const fs   = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  PageBreak
} = require(path.join(__dirname, 'tmp_modules', 'node_modules', 'docx'));

// ── Helpers ────────────────────────────────────────────────────────────────

const BLUE  = '1B4F8A';
const AMBER = 'E8820A';
const CREAM = 'FBF5E9';
const GRAY  = 'F0EDE8';
const WHITE = 'FFFFFF';
const DARK  = '21232E';

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    shading: { type: ShadingType.CLEAR, fill: BLUE, color: WHITE },
    run: { color: WHITE },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
  });
}

function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: AMBER, size: 22 })],
    spacing: { before: 200, after: 80 },
  });
}

function label(text) {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 18, color: '666666', characterSpacing: 60 })],
    spacing: { before: 120, after: 40 },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function divider() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: AMBER, space: 6 } },
    spacing: { before: 120, after: 120 },
  });
}

function biRow(kkText, enText) {
  const cellStyle = {
    shading: { type: ShadingType.CLEAR, fill: WHITE },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  };
  return new TableRow({
    children: [
      new TableCell({
        ...cellStyle,
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: kkText, size: 20 })] })],
      }),
      new TableCell({
        ...cellStyle,
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: enText, size: 20 })] })],
      }),
    ],
  });
}

function biTable(rows) {
  const headerRow = new TableRow({
    children: [
      new TableCell({
        shading: { type: ShadingType.CLEAR, fill: BLUE },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: 'ҚАЗАҚША (KK)', bold: true, color: WHITE, size: 18, characterSpacing: 40 })] })],
      }),
      new TableCell({
        shading: { type: ShadingType.CLEAR, fill: BLUE },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: 'ENGLISH (EN)', bold: true, color: WHITE, size: 18, characterSpacing: 40 })] })],
      }),
    ],
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows.map(([kk, en]) => biRow(kk, en))],
    margins: { top: 80, bottom: 80 },
  });
}

// ── Content builders ────────────────────────────────────────────────────────

function coverPage() {
  return [
    new Paragraph({ spacing: { before: 2400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'AUL BILIM', bold: true, size: 56, color: BLUE })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Website Copy — Bilingual Document', size: 28, color: AMBER })],
      spacing: { before: 120, after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, size: 22, color: '888888' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Languages: Kazakh (KK)  ·  English (EN)', size: 22, color: '888888' })],
      spacing: { before: 60, after: 600 },
    }),
    divider(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Pages covered: index · programs · stories · about · partner', size: 20, color: '888888' })],
      spacing: { before: 160 },
    }),
    pageBreak(),
  ];
}

function sharedSection() {
  return [
    h1('SHARED ELEMENTS (all pages)'),

    h2('Navigation'),
    biTable([
      ['Бағдарламалар', 'Programs'],
      ['Аймақтар', 'Regions'],
      ['Оқиғалар', 'Stories'],
      ['Біз туралы', 'About'],
      ['ҚАЗ', '(language switch)'],
      ['ENG', '(language switch)'],
    ]),

    h2('Footer'),
    biTable([
      ['Aul Bilim — Jelken қорының бағдарламасы. Қазақстанның ауыл мектептерін жабдықтап, ұстаздарды оқытып, балаларды қолдаймыз.', 'Aul Bilim, a Jelken Foundation programme, equips schools, trains teachers, and supports children across rural Kazakhstan.'],
      ['Зерттеу', 'Explore'],
      ['Байланыс', 'Contact'],
      ['Астана, Қазақстан', 'Astana, Kazakhstan'],
      ['hello@aulbilim.kz', 'hello@aulbilim.kz'],
      ['Серіктес болу', 'Become a Partner'],
      ['© 2026 Jelken қоры · Қоғамдық ұйым', '© 2026 Jelken Foundation · Non-profit organisation'],
    ]),
    pageBreak(),
  ];
}

function indexPage() {
  return [
    h1('PAGE: index.html — Home'),

    h2('Page Title'),
    biTable([
      ['Aul Bilim — Ауыл — білім желкені', 'Aul Bilim — The village sail of education'],
    ]),

    h2('Hero'),
    biTable([
      ['Ауыл — білім желкені', 'The village sail of education'],
      ['Әр балаға заманауи мектеп', 'A modern school for every child'],
      ['Еліміздің әр түкпіріндегі оқушыларға сапалы білім беру үшін мектептерді заманауи жиһазбен, жаратылыстану зертханаларымен және цифрлық технологиямен толық жабдықтаймыз.', 'To deliver quality education across our country, we fully equip schools with modern furniture, science labs, and digital technology.'],
      ['Ұстаздардың біліктілігін жетілдіреміз әрі тұрақты тәлімгерлік қолдау көрсетеміз.', 'We develop teachers\' skills and provide ongoing mentorship support.'],
      ['Жобамен танысу →', 'Explore our projects →'],
      ['Толығырақ →', 'Learn more →'],
    ]),

    h2('Stat Strip'),
    biTable([
      ['300+  жабдықталған сынып', '300+  classrooms equipped'],
      ['450+  оқытылған ұстаз', '450+  teachers trained'],
      ['9  Қазақстан өңірі', '9  regions of Kazakhstan'],
      ['15 000+  оқушы мен ұстаз', '15 000+  students & teachers'],
    ]),

    h2('Partners'),
    biTable([
      ['Серіктестеріміз', 'Our partners'],
    ]),

    h2('Programs Section'),
    biTable([
      ['Біздің бағыттар', 'What we do'],
      ['Ауыл әлеуетін арттырудың біртұтас экожүйесі', 'A Holistic Ecosystem for Rural Empowerment'],
      ['Біз сырттан келетін уақытша көмекке сенбейміз. Ортаны түбегейлі өзгертетін, мұғалімді күшейтетін және балаға бағыт беретін үш өзара байланысты бағдарламаны ұсынамыз. Сыныптарды заманауи жабдықтаудан бастап, үлкен өмірге қадам басқан жасөспірімдерге жол көрсетуге дейін — әрбір бастамамыз ауылдың шынайы мұқтаждығына негізделген.', 'We don\'t believe in temporary aid. We deploy three interconnected programs that transform the physical environment, empower the educator, and guide the child. From rebuilding classrooms to mentoring teenagers transitioning into adult careers—every initiative meets a village at its true, specific point of need.'],
    ]),

    h3('Program 01 — School Fit-Out'),
    biTable([
      ['01 · Мектептерді жаңғырту', '01 · School Fit-Out'],
      ['Сынып қабырғалары бала арманының ауқымын айқындайды.', 'Infrastructure dictates the scale of a child\'s ambition.'],
      ['Біз ескірген парталардан бастап заманауи зертханаларға дейін толық жабдықтаймыз. Орта өзгергенде, оқушының мақсаты да өзгереді.', 'We fully equip rural classrooms from the ground up, replacing worn-out desks with functioning, modern learning spaces. When we upgrade a classroom, we upgrade what a student believes is possible.'],
      ['✓  Заманауи парталар мен сынып жиһазы', '✓  Modern desks and classroom furniture'],
      ['✓  Физика, химия, биология зертханалары', '✓  Physics, chemistry and biology labs'],
      ['✓  Цифрлық тақталар мен ноутбуктер', '✓  Digital boards and laptops'],
      ['✓  STEM және робототехника жинақтары', '✓  STEM and robotics kits'],
      ['Толығырақ →', 'Learn more →'],
    ]),

    h3('Program 02 — Teacher Training / USTAZ'),
    biTable([
      ['02 · Ұстаздарды оқыту · USTAZ', '02 · Teacher Training · USTAZ'],
      ['Ауыл ұстазы жалғыз қалмауы үшін', 'So a village teacher never stands alone'],
      ['USTAZ коворкинг орталықтары ауыл педагогтарына кәсіби өсуге, тәжірибе алмасуға және бірге жұмыс істеуге кеңістік береді — қала мен ауыл арасындағы алшақтықты жабады.', 'USTAZ coworking centres provide rural educators with dedicated spaces to collaborate, swap experiences, and scale their professional skills—effectively bridging the urban-rural divide.'],
      ['✓  USTAZ коворкинг кеңістіктері', '✓  USTAZ coworking spaces'],
      ['✓  Пәндік семинарлар мен шеберханалар', '✓  Subject workshops and masterclasses'],
      ['✓  Тәжірибелі тәлімгерлермен жұмыс', '✓  Work with experienced mentors'],
      ['✓  Кәсіби қауымдастық пен желі', '✓  A professional community and network'],
      ['Толығырақ →', 'Learn more →'],
    ]),

    h3('Program 03 — Child Mentorship / Samruk Umiti'),
    biTable([
      ['03 · Тәлімгерлік · Samruk Umiti', '03 · Child Mentorship · Samruk Umiti'],
      ['Ересек өмірге сенімді алғашқы қадам', 'A confident first step into adult life'],
      ['Samruk Umiti балалар үйі тәрбиеленушілерін жалғыз қалдырмайды: кәсіп таңдау, оқуға түсу және алғашқы жұмысқа орналасудың әр кезеңінде тұрақты тәлімгер қасында болады.', 'Samruk Umiti ensures that youth leaving orphanages navigate their critical transition independently: choosing a path, applying to college, and landing a first job with a steady mentor at their side.'],
      ['✓  Жеке кәсіптік бағдарлау', '✓  One-on-one career guidance'],
      ['✓  Колледж бен ЖОО-ға түсуге көмек', '✓  Help applying to college and university'],
      ['✓  Алғашқы жұмысқа орналасу қолдауы', '✓  Support landing a first job'],
      ['✓  Тұрақты тәлімгер-серіктес', '✓  A steady mentor and companion'],
      ['Толығырақ →', 'Learn more →'],
    ]),

    h2('Why Section'),
    biTable([
      ['Неліктен сынып бәрін өзгертеді', 'Why a classroom changes everything'],
      ['Ауыл мектебінде бір мұғалім бес пәнді оқытуы мүмкін, жиһазы 90-жылдардан қалған. Бала өзін кім бола алатынын қоршаған ортасынан түсінеді — сондықтан біз оны жергілікті тұрғындармен бірге қайта құрамыз.', 'A rural school may have one teacher covering five subjects, with furniture from the 1990s. A child\'s environment shapes what they believe they can become — so we rebuild it, together with the people who live there.'],
      ['300+  жабдықталған сынып', '300+  classrooms equipped'],
      ['450+  оқытылған ұстаз', '450+  teachers trained'],
      ['9  Қазақстан өңірі', '9  regions of Kazakhstan'],
      ['120  серіктес мектеп', '120  partner schools'],
    ]),

    h2('Regions / Map Section'),
    biTable([
      ['Аймақтар', 'Where we work'],
      ['Қазақстанның тоғыз өңірінде', 'Across nine regions'],
      ['Бөлектелген аймақты басыңыз', 'Tap a highlighted region'],
      ['Барлық аймақтар', 'All regions'],
      ['Біз жұмыс істейтін аудандар', 'Districts where we work'],
      ['[n] мектеп', '[n] schools'],
    ]),

    h3('Region names (map panel headings)'),
    biTable([
      ['Батыс Қазақстан облысы', 'West Kazakhstan Region'],
      ['Қостанай облысы', 'Kostanay Region'],
      ['Ақмола облысы', 'Akmola Region'],
      ['Қарағанды облысы', 'Karaganda Region'],
      ['Абай облысы', 'Abay Region'],
      ['Қызылорда облысы', 'Kyzylorda Region'],
      ['Түркістан облысы', 'Turkistan Region'],
      ['Жамбыл облысы', 'Jambyl Region'],
      ['Алматы облысы', 'Almaty Region'],
    ]),

    h3('Map short labels'),
    biTable([
      ['Абай', 'Abay'],
      ['Ақмола', 'Akmola'],
      ['Ақтөбе', 'Aktobe'],
      ['Алматы', 'Almaty'],
      ['Атырау', 'Atyrau'],
      ['БҚО', 'West KZ'],
      ['Жамбыл', 'Jambyl'],
      ['Жетісу', 'Jetisu'],
      ['Қарағанды', 'Karaganda'],
      ['Қостанай', 'Kostanay'],
      ['Қызылорда', 'Kyzylorda'],
      ['Маңғыстау', 'Mangystau'],
      ['Павлодар', 'Pavlodar'],
      ['СҚО', 'North KZ'],
      ['Түркістан', 'Turkestan'],
      ['Ұлытау', 'Ulytau'],
      ['ШҚО', 'East KZ'],
    ]),

    h3('Districts — West Kazakhstan (36 schools)'),
    biTable([
      ['Орал', 'Oral — 8 schools'],
      ['Бәйтерек', 'Baiterek — 6 schools'],
      ['Бөрлі', 'Borli — 6 schools'],
      ['Теректі', 'Terekti — 6 schools'],
      ['Ақжайық', 'Akzhaiyk — 5 schools'],
      ['Сырым', 'Syrym — 5 schools'],
    ]),

    h3('Districts — Kostanay (43 schools)'),
    biTable([
      ['Меңдіқара', 'Mendykara — 8 schools'],
      ['Әулиекөл', 'Auliekol — 7 schools'],
      ['Денисов', 'Denisov — 6 schools'],
      ['Қарабалық', 'Qarabalyq — 7 schools'],
      ['Сарыкөл', 'Sarykol — 8 schools'],
      ['Федоров', 'Fedorov — 7 schools'],
    ]),

    h3('Districts — Akmola (36 schools)'),
    biTable([
      ['Бурабай', 'Burabay — 8 schools'],
      ['Зеренді', 'Zerendi — 6 schools'],
      ['Атбасар', 'Atbasar — 5 schools'],
      ['Целиноград', 'Tselinograd — 7 schools'],
      ['Шортанды', 'Shortandy — 5 schools'],
      ['Аршалы', 'Arshaly — 5 schools'],
    ]),

    h3('Districts — Karaganda (67 schools)'),
    biTable([
      ['Абай', 'Abai — 12 schools'],
      ['Бұқар жырау', 'Bukhar-Zhyrau — 14 schools'],
      ['Қарқаралы', 'Karkaraly — 9 schools'],
      ['Нұра', 'Nura — 10 schools'],
      ['Осакаров', 'Osakarov — 11 schools'],
      ['Шет', 'Shet — 11 schools'],
    ]),

    h3('Districts — Abay (67 schools)'),
    biTable([
      ['Семей', 'Semey — 13 schools'],
      ['Аягөз', 'Ayagoz — 12 schools'],
      ['Бесқарағай', 'Beskaragai — 10 schools'],
      ['Бородулиха', 'Borodulikha — 11 schools'],
      ['Жарма', 'Zharma — 11 schools'],
      ['Көкпекті', 'Kokpekti — 10 schools'],
    ]),

    h3('Districts — Kyzylorda (43 schools)'),
    biTable([
      ['Арал', 'Aral — 7 schools'],
      ['Қазалы', 'Kazaly — 7 schools'],
      ['Қармақшы', 'Karmakshy — 7 schools'],
      ['Жалағаш', 'Zhalagash — 7 schools'],
      ['Сырдария', 'Syrdarya — 8 schools'],
      ['Шиелі', 'Shieli — 7 schools'],
    ]),

    h3('Districts — Turkistan (43 schools)'),
    biTable([
      ['Сайрам', 'Sairam — 8 schools'],
      ['Сарыағаш', 'Saryagash — 8 schools'],
      ['Мақтаарал', 'Maktaaral — 7 schools'],
      ['Ордабасы', 'Ordabasy — 6 schools'],
      ['Түлкібас', 'Tulkibas — 7 schools'],
      ['Қазығұрт', 'Kazygurt — 7 schools'],
    ]),

    h3('Districts — Jambyl (32 schools)'),
    biTable([
      ['Байзақ', 'Baizak — 6 schools'],
      ['Жамбыл', 'Zhambyl — 5 schools'],
      ['Жуалы', 'Zhualy — 5 schools'],
      ['Қордай', 'Korday — 6 schools'],
      ['Меркі', 'Merki — 5 schools'],
      ['Шу', 'Shu — 5 schools'],
    ]),

    h3('Districts — Almaty (43 schools)'),
    biTable([
      ['Еңбекшіқазақ', 'Enbekshikazakh — 9 schools'],
      ['Қарасай', 'Karasai — 8 schools'],
      ['Талғар', 'Talgar — 7 schools'],
      ['Іле', 'Ile — 6 schools'],
      ['Жамбыл', 'Zhambyl (Almaty) — 7 schools'],
      ['Райымбек', 'Raiymbek — 6 schools'],
    ]),

    h2('Stories Preview'),
    biTable([
      ['Ауылдардан оқиғалар', 'Stories from villages'],
      ['Нақты адамдар. Нақты өзгеріс.', 'Real people. Real change.'],
    ]),

    h3('Story card 1 — Қарағанды'),
    biTable([
      ['Бордан химия зертханасына дейін', 'From chalk to a chemistry lab'],
      ['№86 мектеп жиырма жыл бойы жаңа жабдық көрмеген. Біз келдік — және химия сабақтары бір түнде өзгерді.', 'School No. 86 hadn\'t seen new equipment in twenty years. Then we arrived — and the science lessons changed overnight.'],
    ]),

    h3('Story card 2 — Қостанай'),
    biTable([
      ['Оқуын тоқтатпаған ұстаз', 'A teacher who wouldn\'t stop learning'],
      ['Айзат жылдар бойы сынған құралдармен физика оқытты. USTAZ-дан кейін ол басқа мұғалімдер бірінші болып хабарласатын тәлімгерге айналды.', 'Aizat taught physics with broken instruments for years. After USTAZ, she became the mentor other teachers now call first.'],
    ]),

    h3('Story card 3 — Ақмола'),
    biTable([
      ['Бір ауылды өзгерткен сынып', 'The classroom that changed a village'],
      ['Ақкөлде ата-аналар балаларын қалаға репетиторға апаратын. Енді ұстаздар ауылдың өзінен — және ешкім кетпейді.', 'In Akkol, parents drove children to the city for tutoring. Now the tutors come from the village — and no one is leaving.'],
    ]),

    h2('Partner CTA'),
    biTable([
      ['Бізбен бірге жарқын дала құрыңыз', 'Build a brighter steppe with us'],
      ['Корпоративтік серіктестер, мемлекеттік органдар және жеке демеушілер — бірге біз мектептерге және оларды ұстап тұрған ұстаздарға нақты, тұрақты өзгеріс әкелеміз.', 'Corporate partners, government bodies, and individual donors — together we bring real, lasting change to schools and the teachers who hold them together.'],
      ['Қор туралы →', 'About the Foundation →'],
    ]),
    pageBreak(),
  ];
}

function programsPage() {
  return [
    h1('PAGE: programs.html — Programs'),

    h2('Page Title'),
    biTable([
      ['Бағдарламалар — Aul Bilim', 'Programs — Aul Bilim'],
    ]),

    h2('Page Hero'),
    biTable([
      ['Aul Bilim · Бағдарламалар', 'Aul Bilim · Programs'],
      ['Бір миссия, үш бағдарлама.', 'One mission, three programmes.'],
      ['Біз сырттан келетін уақытша көмекке сенбейміз. Ортаны түбегейлі өзгертетін, мұғалімді күшейтетін және балаға бағыт беретін үш өзара байланысты бағдарламаны ұсынамыз. Сыныптарды заманауи жабдықтаудан бастап, үлкен өмірге қадам басқан жасөспірімдерге жол көрсетуге дейін — әрбір бастамамыз ауылдың шынайы мұқтаждығына негізделген.', 'We don\'t believe in temporary aid. We deploy three interconnected programs that transform the physical environment, empower the educator, and guide the child. From rebuilding classrooms to mentoring teenagers transitioning into adult careers—every initiative meets a village at its true, specific point of need.'],
    ]),

    h2('Program 01 — School Fit-Out (#fitout)'),
    biTable([
      ['01 · Мектептерді жаңғырту', '01 · School Fit-Out'],
      ['Сынып қабырғалары бала арманының ауқымын айқындайды.', 'Infrastructure dictates the scale of a child\'s ambition.'],
      ['Біз ескірген парталардан бастап заманауи зертханаларға дейін толық жабдықтаймыз. Орта өзгергенде, оқушының мақсаты да өзгереді.', 'We fully equip rural classrooms from the ground up, replacing worn-out desks with functioning, modern learning spaces. When we upgrade a classroom, we upgrade what a student believes is possible.'],
      ['✓  Заманауи парталар мен сынып жиһазы', '✓  Modern desks and classroom furniture'],
      ['✓  Физика, химия, биология зертханалары', '✓  Physics, chemistry and biology labs'],
      ['✓  Цифрлық тақталар мен ноутбуктер', '✓  Digital boards and laptops'],
      ['✓  STEM және робототехника жинақтары', '✓  STEM and robotics kits'],
    ]),

    h2('Program 02 — Teacher Training / USTAZ (#ustaz)'),
    biTable([
      ['02 · Ұстаздарды оқыту · USTAZ', '02 · Teacher Training · USTAZ'],
      ['Ауыл ұстазы жалғыз қалмауы үшін', 'So a village teacher never stands alone'],
      ['USTAZ коворкинг орталықтары ауыл педагогтарына кәсіби өсуге, тәжірибе алмасуға және бірге жұмыс істеуге кеңістік береді — қала мен ауыл арасындағы алшақтықты жабады.', 'USTAZ coworking centres provide rural educators with dedicated spaces to collaborate, swap experiences, and scale their professional skills—effectively bridging the urban-rural divide.'],
      ['✓  USTAZ коворкинг кеңістіктері', '✓  USTAZ coworking spaces'],
      ['✓  Пәндік семинарлар мен шеберханалар', '✓  Subject workshops and masterclasses'],
      ['✓  Тәжірибелі тәлімгерлермен жұмыс', '✓  Work with experienced mentors'],
      ['✓  Кәсіби қауымдастық пен желі', '✓  A professional community and network'],
    ]),

    h2('Program 03 — Child Mentorship / Samruk Umiti (#samruk)'),
    biTable([
      ['03 · Тәлімгерлік · Samruk Umiti', '03 · Child Mentorship · Samruk Umiti'],
      ['Ересек өмірге сенімді алғашқы қадам', 'A confident first step into adult life'],
      ['Samruk Umiti балалар үйі тәрбиеленушілерін жалғыз қалдырмайды: кәсіп таңдау, оқуға түсу және алғашқы жұмысқа орналасудың әр кезеңінде тұрақты тәлімгер қасында болады.', 'Samruk Umiti ensures that youth leaving orphanages navigate their critical transition independently: choosing a path, applying to college, and landing a first job with a steady mentor at their side.'],
      ['✓  Жеке кәсіптік бағдарлау', '✓  One-on-one career guidance'],
      ['✓  Колледж бен ЖОО-ға түсуге көмек', '✓  Help applying to college and university'],
      ['✓  Алғашқы жұмысқа орналасу қолдауы', '✓  Support landing a first job'],
      ['✓  Тұрақты тәлімгер-серіктес', '✓  A steady mentor and companion'],
    ]),

    h2('Impact Band'),
    biTable([
      ['Үш бағдарлама — бір нәтиже', 'Three programmes, one result'],
      ['Жабдықталған сынып, дайын ұстаз және қолдау тапқан бала бірге бір ауылдың болашағын өзгертеді. Сан түрінде көрінісі — осы.', 'An equipped classroom, a supported teacher and a mentored child together change a village\'s future. Here is what that looks like in numbers.'],
      ['300+  жабдықталған сынып', '300+  classrooms equipped'],
      ['450+  оқытылған ұстаз', '450+  teachers trained'],
      ['2  USTAZ орталығы', '2  USTAZ centres'],
      ['15 000+  оқушы мен ұстаз', '15 000+  students & teachers'],
    ]),

    h2('Partner CTA'),
    biTable([
      ['Бір бағдарламаны бірге алып барайық', 'Let\'s take one programme further, together'],
      ['Сізге қай бағыт жақын? Бір сыныпты жабдықтаңыз, бір USTAZ орталығын қолдаңыз немесе бір баланың тәлімгері болыңыз.', 'Which direction speaks to you? Equip a single classroom, back a USTAZ centre, or stand behind one child as a mentor.'],
      ['Оқиғаларды көру →', 'See the stories →'],
    ]),
    pageBreak(),
  ];
}

function storiesPage() {
  return [
    h1('PAGE: stories.html — Stories'),

    h2('Page Title'),
    biTable([
      ['Оқиғалар — Aul Bilim', 'Stories — Aul Bilim'],
    ]),

    h2('Page Hero'),
    biTable([
      ['Aul Bilim · Оқиғалар', 'Aul Bilim · Stories'],
      ['Нақты адамдар. Нақты өзгеріс.', 'Real people. Real change.'],
      ['Әр сан артында бала, ұстаз және ауыл тұр. Міне солардың кейбірінің әңгімесі.', 'Behind every number is a child, a teacher and a village. Here are a few of their stories.'],
    ]),

    h2('Featured Story — Қарағанды / Karagandy'),
    biTable([
      ['Қарағанды · Мектептерді жаңғырту', 'Karagandy · School Fit-Out'],
      ['Бордан химия зертханасына дейін', 'From chalk to a chemistry lab'],
      ['№86 мектеп жиырма жыл бойы жаңа жабдық көрмеген. Мұғалімдер тәжірибелерді тек тақтаға сызумен түсіндіретін. Aul Bilim келгеннен кейін сыныпта нағыз зертхана пайда болды.', 'School No. 86 hadn\'t seen new equipment in twenty years. Teachers could only sketch experiments on the board. After Aul Bilim arrived, the classroom got a real, working laboratory.'],
      ['«Балалар енді реакцияны өз қолымен жасайды. Олардың көзіндегі қызығушылық — біз үшін ең үлкен нәтиже», — дейді химия пәнінің мұғалімі.', '"The children now run reactions with their own hands. The curiosity in their eyes is the biggest result we could ask for," says the chemistry teacher.'],
      ['Толық оқиғаны оқу →', 'Read the full story →'],
    ]),

    h2('Story Grid'),

    h3('Story 1 — Қостанай'),
    biTable([
      ['Оқуын тоқтатпаған ұстаз', 'A teacher who wouldn\'t stop learning'],
      ['Айзат жылдар бойы сынған құралдармен физика оқытты. USTAZ-дан кейін ол басқа мұғалімдер бірінші болып хабарласатын тәлімгерге айналды.', 'Aizat taught physics with broken instruments for years. After USTAZ, she became the mentor other teachers now call first.'],
    ]),

    h3('Story 2 — Ақмола'),
    biTable([
      ['Бір ауылды өзгерткен сынып', 'The classroom that changed a village'],
      ['Ақкөлде ата-аналар балаларын қалаға репетиторға апаратын. Енді ұстаздар ауылдың өзінен — және ешкім кетпейді.', 'In Akkol, parents drove children to the city for tutoring. Now the tutors come from the village — and no one is leaving.'],
    ]),

    h3('Story 3 — Түркістан'),
    biTable([
      ['Менің алғашқы робототехника сабағым', 'My first robotics lesson'],
      ['Он екі жасар Дамир өмірінде роботты алғаш рет құрастырды. «Мен инженер боламын», — дейді ол енді еш күмәнсіз.', 'Twelve-year-old Damir built his first robot ever. "I\'m going to be an engineer," he now says, without a flicker of doubt.'],
    ]),

    h3('Story 4 — Алматы обл.'),
    biTable([
      ['Балалар үйінен студенттік партаға', 'From the orphanage to a university desk'],
      ['Samruk Umiti тәлімгері Аружанға құжат тапсырудан бастап жатақханаға дейін көмектесті. Бүгін ол — бірінші курс студенті.', 'A Samruk Umiti mentor helped Aruzhan with everything from applications to a dorm room. Today she\'s a first-year student.'],
    ]),

    h3('Story 5 — Павлодар'),
    biTable([
      ['Ұстаздар бір-бірін тапқан жер', 'Where teachers found each other'],
      ['USTAZ орталығы ашылғанда, бөлек ауылдардан келген мұғалімдер алғаш рет бір үстел басына жиналды — енді олар бір команда.', 'When the USTAZ centre opened, teachers from scattered villages sat at one table for the first time — now they\'re one team.'],
    ]),

    h3('Story 6 — Ақтөбе'),
    biTable([
      ['Қалаға көшпеген отбасы', 'The family that didn\'t move to the city'],
      ['«Бұрын біз балаларды оқыту үшін көшуді жоспарлағанбыз. Енді ауылда жақсы мектеп бар — қалуға болады», — дейді ата-ана.', '"We used to plan on moving so the kids could get a good education. Now the village has a strong school — we can stay," a parent says.'],
    ]),

    h2('Partner CTA'),
    biTable([
      ['Келесі оқиғаның авторы болыңыз', 'Help write the next story'],
      ['Әр жабдықталған сынып пен қолдау тапқан бала жаңа оқиға бастайды. Сіздің қолдауыңыз оны мүмкін етеді.', 'Every equipped classroom and supported child begins a new story. Your support is what makes the next one possible.'],
      ['Бағдарламалар →', 'Our programmes →'],
    ]),
    pageBreak(),
  ];
}

function aboutPage() {
  return [
    h1('PAGE: about.html — About'),

    h2('Page Title'),
    biTable([
      ['Біз туралы — Aul Bilim', 'About — Aul Bilim'],
    ]),

    h2('Page Hero'),
    biTable([
      ['Aul Bilim · Біз туралы', 'Aul Bilim · About'],
      ['Әр ауылға тең мүмкіндік.', 'An equal chance for every village.'],
      ['Aul Bilim — Jelken қорының бағдарламасы. Біз Қазақстанның ауыл мектептеріндегі балалар мен ұстаздарға қала балаларымен тең білім ортасын жасаймыз.', 'Aul Bilim is a programme of the Jelken Foundation. We build, for children and teachers in Kazakhstan\'s rural schools, the same quality of learning a city child enjoys.'],
    ]),

    h2('Mission'),
    biTable([
      ['Біздің жол', 'Our story'],
      ['Бір сыныптан басталды', 'It started with a single classroom'],
      ['Біз бір ауыл мектебіне барып, сынған парталар мен жиырма жылдық жабдықты көрдік. Сол сыныпты жаңартқанда, балалардың сабаққа деген көзқарасы бір аптада өзгерді.', 'We visited one village school and saw broken desks and twenty-year-old equipment. When we renovated that single classroom, the children\'s relationship with learning changed within a week.'],
      ['Содан бері Aul Bilim жетіден астам өңірге жетті. Бірақ біз әр жобаны әлі күнге дейін бір сынып, бір ұстаз, бір баладан санаймыз.', 'Since then Aul Bilim has reached more than seven regions. But we still count every project the same way — one classroom, one teacher, one child at a time.'],
    ]),

    h2('Values'),
    biTable([
      ['Біз сенетін нәрсе', 'What we stand for'],
      ['Үш қарапайым ұстаным', 'Three simple convictions'],
    ]),

    h3('Value 1 — Equity'),
    biTable([
      ['Теңдік', 'Equity'],
      ['Ауыл баласы қала баласымен бірдей сапалы білім алуға лайық. Орналасқан жер тағдырды шешпеуі керек.', 'A village child deserves the same quality of education as a city child. Where you\'re born shouldn\'t decide your future.'],
    ]),

    h3('Value 2 — Community'),
    biTable([
      ['Қауымдастық', 'Community'],
      ['Біз ауылға емес, ауылмен бірге жұмыс істейміз. Шешімдер жергілікті ұстаздар мен ата-аналармен бірге қабылданады.', 'We work with a village, not for it. Decisions are made together with local teachers and parents.'],
    ]),

    h3('Value 3 — Lasting Change'),
    biTable([
      ['Тұрақтылық', 'Lasting change'],
      ['Біз тек жабдық қалдырмаймыз — дағды, білім және өзара қолдау желісін қалдырамыз. Жоба біз кеткеннен кейін де жұмыс істеуі тиіс.', 'We don\'t just leave equipment — we leave skills, knowledge and a support network. The work must keep going long after we leave.'],
    ]),

    h2('Partners'),
    biTable([
      ['Бізге сенетін серіктестер', 'Partners who trust us'],
    ]),

    h2('Team'),
    biTable([
      ['Команда', 'The team'],
      ['Жобаны жүргізетін адамдар', 'The people behind the work'],
    ]),

    h3('Team members'),
    biTable([
      ['Аружан Қ. — Атқарушы директор', 'Aruzhan K. — Executive Director'],
      ['Дәурен М. — Бағдарламалар жетекшісі', 'Dauren M. — Head of Programmes'],
      ['Әсем Т. — USTAZ үйлестірушісі', 'Asem T. — USTAZ Coordinator'],
      ['Нұрлан Б. — Серіктестік жетекшісі', 'Nurlan B. — Head of Partnerships'],
    ]),

    h2('Partner CTA'),
    biTable([
      ['Бізбен бірге жұмыс істеңіз', 'Work alongside us'],
      ['Демеуші, серіктес немесе ерікті — Aul Bilim-ге қосылудың көп жолы бар. Қайдан бастарыңызды бірге ойлайық.', 'Donor, partner or volunteer — there are many ways to join Aul Bilim. Let\'s figure out where you fit, together.'],
      ['Оқиғаларды көру →', 'See the stories →'],
    ]),
    pageBreak(),
  ];
}

function partnerPage() {
  return [
    h1('PAGE: partner.html — Become a Partner'),

    h2('Page Title'),
    biTable([
      ['Серіктес болу — Aul Bilim', 'Become a Partner — Aul Bilim'],
    ]),

    h2('Page Hero'),
    biTable([
      ['Aul Bilim · Серіктес болу', 'Aul Bilim · Become a Partner'],
      ['Бізбен бірге жарқын дала құрыңыз.', 'Build a brighter steppe with us.'],
      ['Корпоративтік серіктестер, мемлекеттік органдар мен жеке демеушілер — әрқайсысы ауыл мектебінің тағдырын өзгерте алады. Қалай қосылатыныңызды таңдаңыз.', 'Corporate partners, government bodies and individual donors — each can change the course of a rural school. Choose how you\'d like to join in.'],
    ]),

    h2('Ways to Partner'),

    h3('1 — Corporate Partnership'),
    biTable([
      ['Корпоративтік серіктестік', 'Corporate partnership'],
      ['Бір мектепті, USTAZ орталығын немесе бүкіл өңірді демеуші болыңыз. Брендіңіз нақты, өлшенетін әсермен байланысады.', 'Sponsor a school, a USTAZ centre or an entire region. Your brand gets tied to real, measurable impact.'],
      ['бір сыныптан бастап', 'from one classroom up'],
    ]),

    h3('2 — Government Collaboration'),
    biTable([
      ['Мемлекеттік ынтымақтастық', 'Government collaboration'],
      ['Аймақтық білім бағдарламаларын бірге масштабтаймыз. Біз орындау тәжірибесін, сіз ауқым мен қолжетімділікті қосасыз.', 'We scale regional education programmes together. We bring delivery experience, you bring reach and access.'],
      ['аймақтық бағдарламалар', 'regional programmes'],
    ]),

    h3('3 — Individual Giving'),
    biTable([
      ['Жеке демеушілік', 'Individual giving'],
      ['Кез келген сома маңызды. Бір парта, бір кітап, бір баланың сабағы — сіздің қолдауыңыздан басталады.', 'Any amount matters. One desk, one book, one child\'s lesson — it starts with your support.'],
      ['кез келген сома', 'any amount'],
    ]),

    h2('How It Works'),
    biTable([
      ['Қалай жұмыс істейді', 'How it works'],
      ['Хабарласудан нақты әсерге дейін', 'From hello to real impact'],
    ]),

    h3('Steps'),
    biTable([
      ['1 · Хабарласу — Төмендегі форманы толтырасыз — біз бір жұмыс күні ішінде жауап береміз.', '1 · Get in touch — Fill in the form below — we reply within one working day.'],
      ['2 · Кездесу — Мақсаттарыңызды, бюджетіңізді және қалаған өңіріңізді бірге талқылаймыз.', '2 · We meet — We discuss your goals, budget and the region you care about.'],
      ['3 · Жоспар — Нақты мектеп пен бағдарламаны таңдап, айқын жоспар құрамыз.', '3 · A plan — We pick a specific school and programme and build a clear plan.'],
      ['4 · Әсер — Есептер, фотолар және далаға сапарлар арқылы нәтижені өз көзіңізбен көресіз.', '4 · Impact — You see the result yourself through reports, photos and field visits.'],
    ]),

    h2('Partnership Form'),
    biTable([
      ['Бізге жазыңыз', 'Write to us'],
      ['Серіктестік сұранысы', 'Partnership enquiry'],
      ['Атыңыз', 'Your name'],
      ['Ұйым', 'Organisation'],
      ['Email', 'Email'],
      ['Телефон', 'Phone'],
      ['Серіктестік түрі', 'Partnership type'],
      ['Хабарлама', 'Message'],
      ['Сұранысты жіберу →', 'Send enquiry →'],
      ['Рақмет! Біз жақын арада хабарласамыз.', 'Thank you! We\'ll be in touch shortly.'],
    ]),

    h3('Partnership type options'),
    biTable([
      ['Корпоративтік серіктестік', 'Corporate partnership'],
      ['Мемлекеттік ынтымақтастық', 'Government collaboration'],
      ['Жеке демеушілік', 'Individual giving'],
    ]),
  ];
}

// ── Build & write ──────────────────────────────────────────────────────────

async function main() {
  const sections = [
    ...coverPage(),
    ...sharedSection(),
    ...indexPage(),
    ...programsPage(),
    ...storiesPage(),
    ...aboutPage(),
    ...partnerPage(),
  ];

  const doc = new Document({
    creator: 'Aul Bilim',
    title: 'Aul Bilim Website Copy',
    description: 'Bilingual KK/EN copy for all public pages',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: 'Calibri', bold: true, size: 32, color: WHITE },
          paragraph: {
            spacing: { before: 400, after: 200 },
            shading: { type: ShadingType.CLEAR, fill: BLUE, color: WHITE },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: 'Calibri', bold: true, size: 26, color: BLUE },
          paragraph: { spacing: { before: 280, after: 100 } },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: 'Calibri', bold: true, size: 22, color: AMBER },
          paragraph: { spacing: { before: 200, after: 80 } },
        },
      ],
    },
    sections: [{ children: sections }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, 'Aul-Bilim-Website-Copy.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Done:', outPath);
  console.log('Size:', (buffer.length / 1024).toFixed(1) + ' KB');
}

main().catch(err => { console.error(err); process.exit(1); });
