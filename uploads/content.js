/**
 * content.js — All site copy, three languages.
 *
 * Keys match the data-i18n attributes in the HTML.
 * app.js reads window.TRANSLATIONS and swaps text nodes on lang switch.
 *
 * To add a new string:
 *   1. Add a data-i18n="your.key" attribute to the HTML element.
 *   2. Add "your.key": "…" to each language block below.
 */

window.TRANSLATIONS = {

  /* ═══════════════════════════════════════
     KAZAKH (default)
  ═══════════════════════════════════════ */
  kk: {
    // Meta
    'meta.title':       'Аул Білім — Jelken Foundation',
    'meta.description': 'Біз ауыл мектептерін жарақтандырып, мұғалімдерді оқытамыз — ауылдағы бала да қалалықтай білім алсын деп.',

    // Navigation
    'nav.home':     'Басты бет',
    'nav.programs': 'Бағдарламалар',
    'nav.impact':   'Нәтижелер',
    'nav.about':    'Біз туралы',
    'nav.contact':  'Байланыс',

    // Hero
    'hero.label':           'Jelken Foundation',
    'hero.title':           'Әр балаға тең мүмкіндік',
    'hero.subtitle':        'Біз ауыл мектептерін жарақтандырып, мұғалімдерді оқытамыз — ауылдағы бала да қалалықтай білім алсын деп.',
    'hero.cta_primary':     'Серіктес болу',
    'hero.cta_secondary':   'Жобаларымыз →',
    'hero.stat_classrooms': 'жабдықталған сынып',
    'hero.stat_teachers':   'дайындалған мұғалім',
    'hero.stat_regions':    'облыс',
    'hero.stat_since':      'бастап',

    // Programs section
    'programs.label':    'Бағдарламалар',
    'programs.title':    'Біз не істейміз',
    'programs.subtitle': 'Үш бағытта жұмыс жасаймыз — мектептерді жарақтандырудан бастап, балаларды қолдауға дейін.',

    // Card: School Fit-Out
    'card_fitout.title': 'Мектепті жарақтандыру',
    'card_fitout.text':  'Ауыл мектептеріне заманауи жиһаз, зертханалық жабдық және цифрлық техника орнатамыз.',
    'card_fitout.link':  'Толығырақ →',

    // Card: Teacher Training
    'card_ustaz.title': 'Мұғалімдерді даярлау',
    'card_ustaz.text':  'USTAZ Coworking орталықтары арқылы ауыл мұғалімдері тренингтер мен тәлімгерлік бағдарламаларына қатыса алады.',
    'card_ustaz.link':  'Толығырақ →',

    // Card: Child Mentorship
    'card_samruk.title': 'Балаларды қолдау',
    'card_samruk.text':  'Samruk Umiti бағдарламасы балалар үйі тәрбиеленушілеріне мамандық таңдауда және колледжге түсуде жәрдем береді.',
    'card_samruk.link':  'Толығырақ →',

    // Why it matters
    'why.label': 'Неліктен маңызды',
    'why.title': 'Бұл неге маңызды',
    'why.p1':    'Қазақстандағы ауыл мектебінде бір мұғалім бес пәнді жүргізуі мүмкін — ешқайсысы бойынша арнайы білімсіз.',
    'why.p2':    'Ауыл мектептерінің көпшілігінде 1990-жылдардағы жиһаз бен оқулықтар әлі де пайдаланылады. Оқу ортасы баланың өзіне деген сенімін қалыптастырады.',
    'why.p3':    'Ауыл балалары зертханаларға, цифрлық техникаға және ағылшын тіліне қол жеткізе алмайды — олар аз қабілетті емес, тек мектептерінде ресурс жетіспейді.',
    'why.cta':   'Нәтижелерімізді қараңыз',

    // Stats strip
    'stats.classrooms': 'жабдықталған сынып бөлмесі',
    'stats.teachers':   'дайындалған мұғалім',
    'stats.regions':    'Қазақстан облысы',
    'stats.schools':    'серіктес мектеп',

    // Stories
    'stories.label': 'Ауылдардан оқиғалар',
    'stories.title': 'Нақты адамдар. Нақты өзгерістер.',

    'story1.region':  'Қарағанды облысы',
    'story1.title':   'Бормен жазудан химия зертханасына дейін',
    'story1.excerpt': '№86 мектепте жиырма жыл бойы жаңа жабдық болмады. Біз келген соң — жаратылыстану сабақтары бірден өзгерді.',

    'story2.region':  'Қостанай облысы',
    'story2.title':   'Оқуын тоқтатпаған мұғалім',
    'story2.excerpt': 'Айзат жылдар бойы сынған жабдықпен физика сабағын жүргізді. USTAZ оқуынан кейін ол аудандағы мұғалімдер алдымен хабарласатын тәлімгерге айналды.',

    'story3.region':  'Ақмола облысы',
    'story3.title':   'Ауылды өзгерткен сынып бөлмесі',
    'story3.excerpt': 'Ақкөлде ата-аналар балаларын қалаға репетиторға апаратын. Енді репетиторлар осы ауылдан шыққандар — және ешкім кетпек емес.',

    // Foundation / Partner CTA
    'foundation.label':       'Jelken Foundation',
    'foundation.title':       'Бізбен бірге',
    'foundation.p1':          'Аул Білім — Jelken Foundation қорының бағдарламасы. Қор Қазақстан бойынша білім мен әлеуметтік бастамаларға инвестиция салатын коммерциялық емес ұйым.',
    'foundation.p2':          'Серіктес компаниялар, мемлекеттік органдар және жеке демеушілер — бірге мектептер мен мұғалімдерге нақты өзгеріс әкелеміз.',
    'foundation.cta_primary': 'Серіктес болу',
    'foundation.cta_secondary': 'Біз туралы →',

    // Footer
    'footer.tagline':       'Ауыл мектептерін жарақтандырады, мұғалімдерді оқытады және балаларды қолдайды — өйткені әр ауылдың болашағы бар.',
    'footer.nav_title':     'Сілтемелер',
    'footer.contact_title': 'Байланыс',
    'footer.address':       'Астана қ., Қазақстан',
    'footer.copyright':     '© 2025 Jelken Foundation. Барлық құқықтар сақталған.',
    'footer.org_type':      'Коммерциялық емес ұйым',
  },

  /* ═══════════════════════════════════════
     RUSSIAN
  ═══════════════════════════════════════ */
  ru: {
    // Meta
    'meta.title':       'Аул Билим — Jelken Foundation',
    'meta.description': 'Мы оснащаем сельские школы и обучаем учителей, чтобы дети из аулов учились наравне с городскими.',

    // Navigation
    'nav.home':     'Главная',
    'nav.programs': 'Программы',
    'nav.impact':   'Результаты',
    'nav.about':    'О нас',
    'nav.contact':  'Контакты',

    // Hero
    'hero.label':           'Jelken Foundation',
    'hero.title':           'Каждому ребёнку — достойная школа',
    'hero.subtitle':        'Мы оснащаем сельские школы и обучаем учителей, чтобы дети из аулов учились наравне с городскими.',
    'hero.cta_primary':     'Стать партнёром',
    'hero.cta_secondary':   'Наши проекты →',
    'hero.stat_classrooms': 'оснащённых класса',
    'hero.stat_teachers':   'обученных учителей',
    'hero.stat_regions':    'региона',
    'hero.stat_since':      'год основания',

    // Programs section
    'programs.label':    'Программы',
    'programs.title':    'Что мы делаем',
    'programs.subtitle': 'Три направления работы — от оснащения школ до поддержки детей-сирот.',

    // Card: School Fit-Out
    'card_fitout.title': 'Оснащение школ',
    'card_fitout.text':  'Полностью оборудуем сельские кабинеты: современная мебель, лаборатории, интерактивные панели и цифровая техника.',
    'card_fitout.link':  'Подробнее →',

    // Card: Teacher Training
    'card_ustaz.title': 'Обучение педагогов',
    'card_ustaz.text':  'Через центры USTAZ Coworking сельские учителя проходят тренинги, получают наставничество и обмениваются опытом с коллегами.',
    'card_ustaz.link':  'Подробнее →',

    // Card: Child Mentorship
    'card_samruk.title': 'Поддержка детей',
    'card_samruk.text':  'Программа Samruk Umiti помогает воспитанникам детских домов с профориентацией, поступлением в колледж и трудоустройством.',
    'card_samruk.link':  'Подробнее →',

    // Why it matters
    'why.label': 'Почему это важно',
    'why.title': 'Почему это важно',
    'why.p1':    'В сельской школе Казахстана один учитель нередко ведёт пять предметов — не имея профессиональной подготовки ни по одному из них.',
    'why.p2':    'В большинстве сельских кабинетов до сих пор стоит мебель и лежат учебники 90-х годов. Среда, в которой учится ребёнок, влияет на то, кем он себя видит.',
    'why.p3':    'Дети из сёл значительно реже имеют доступ к лабораториям, цифровой технике и урокам английского — не потому что они менее способны, а потому что их школы получают меньше ресурсов.',
    'why.cta':   'Смотреть результаты',

    // Stats strip
    'stats.classrooms': 'оснащённых класса',
    'stats.teachers':   'обученных учителей',
    'stats.regions':    'региона Казахстана',
    'stats.schools':    'школы-партнёра',

    // Stories
    'stories.label': 'Истории из аулов',
    'stories.title': 'Реальные люди. Реальные перемены.',

    'story1.region':  'Карагандинская область',
    'story1.title':   'От мела до химической лаборатории',
    'story1.excerpt': 'В школе №86 двадцать лет не было нового оборудования. Потом пришли мы — и уроки естественных наук изменились в один день.',

    'story2.region':  'Костанайская область',
    'story2.title':   'Учительница, которая не переставала учиться',
    'story2.excerpt': 'Айзат годами вела физику со сломанным оборудованием. После обучения в USTAZ она стала наставником, к которому теперь первым обращаются учителя всего района.',

    'story3.region':  'Акмолинская область',
    'story3.title':   'Кабинет, изменивший аул',
    'story3.excerpt': 'В Аккольском районе родители возили детей на репетиторство в город. Теперь репетиторы сами из этого аула — и уезжать никто не собирается.',

    // Foundation / Partner CTA
    'foundation.label':         'Jelken Foundation',
    'foundation.title':         'Вместе с нами',
    'foundation.p1':            'Аул Билим — программа фонда Jelken Foundation, некоммерческой организации, которая инвестирует в образование и социальные инициативы по всему Казахстану.',
    'foundation.p2':            'Компании-партнёры, государственные органы и частные спонсоры — вместе мы приносим реальные перемены в школы и жизнь учителей.',
    'foundation.cta_primary':   'Стать партнёром',
    'foundation.cta_secondary': 'О нас →',

    // Footer
    'footer.tagline':       'Оснащаем школы, обучаем учителей и поддерживаем детей в сёлах Казахстана — потому что у каждого аула должно быть будущее.',
    'footer.nav_title':     'Разделы',
    'footer.contact_title': 'Контакты',
    'footer.address':       'г. Астана, Казахстан',
    'footer.copyright':     '© 2025 Jelken Foundation. Все права защищены.',
    'footer.org_type':      'Некоммерческая организация',
  },

  /* ═══════════════════════════════════════
     ENGLISH
  ═══════════════════════════════════════ */
  en: {
    // Meta
    'meta.title':       'Aul Bilim — Jelken Foundation',
    'meta.description': 'We equip rural schools and train village teachers so every child in Kazakhstan learns in conditions equal to the city.',

    // Navigation
    'nav.home':     'Home',
    'nav.programs': 'Programs',
    'nav.impact':   'Impact',
    'nav.about':    'About',
    'nav.contact':  'Contact',

    // Hero
    'hero.label':           'Jelken Foundation',
    'hero.title':           'Every Child Deserves a Brilliant Classroom',
    'hero.subtitle':        'We equip rural schools and train village teachers — so children across Kazakhstan\'s countryside learn as well as any city child.',
    'hero.cta_primary':     'Become a Partner',
    'hero.cta_secondary':   'Our Work →',
    'hero.stat_classrooms': 'classrooms equipped',
    'hero.stat_teachers':   'teachers trained',
    'hero.stat_regions':    'regions',
    'hero.stat_since':      'since',

    // Programs section
    'programs.label':    'Programs',
    'programs.title':    'What We Do',
    'programs.subtitle': 'Three programmes — from equipping classrooms to guiding orphaned teenagers into careers.',

    // Card: School Fit-Out
    'card_fitout.title': 'School Fit-Out',
    'card_fitout.text':  'We furnish and equip rural classrooms from scratch — modern desks, science labs, digital tools, and everything a great lesson needs.',
    'card_fitout.link':  'Learn more →',

    // Card: Teacher Training
    'card_ustaz.title': 'Teacher Training',
    'card_ustaz.text':  'Through USTAZ Coworking centres, rural teachers join workshops, mentoring programmes, and professional communities — closing the gap with city educators.',
    'card_ustaz.link':  'Learn more →',

    // Card: Child Mentorship
    'card_samruk.title': 'Child Mentorship',
    'card_samruk.text':  'Our Samruk Umiti programme guides teenagers from orphanages through career choices, college applications, and their first steps into adult life.',
    'card_samruk.link':  'Learn more →',

    // Why it matters
    'why.label': 'Why It Matters',
    'why.title': 'Why It Matters',
    'why.p1':    'A rural school in Kazakhstan may have one teacher covering five different subjects — with specialist training in none of them.',
    'why.p2':    'Most village classrooms still use furniture and textbooks from the 1990s. A child\'s learning environment shapes what they believe they can achieve.',
    'why.p3':    'Rural children are far less likely to access science labs, digital equipment, or English-language instruction — not because they are less capable, but because their schools have fewer resources.',
    'why.cta':   'See Our Impact',

    // Stats strip
    'stats.classrooms': 'classrooms equipped',
    'stats.teachers':   'teachers trained',
    'stats.regions':    'regions of Kazakhstan',
    'stats.schools':    'partner schools',

    // Stories
    'stories.label': 'Stories from Villages',
    'stories.title': 'Real People. Real Change.',

    'story1.region':  'Karagandy Region',
    'story1.title':   'From Chalk to Chemistry Lab',
    'story1.excerpt': 'School No. 86 hadn\'t seen new equipment in twenty years. Then we arrived — and the science lessons changed overnight.',

    'story2.region':  'Kostanay Region',
    'story2.title':   'A Teacher Who Wouldn\'t Stop Learning',
    'story2.excerpt': 'Aizat had taught physics with broken instruments for years. After USTAZ training, she became the mentor other teachers in her district now call first.',

    'story3.region':  'Akmola Region',
    'story3.title':   'The Classroom That Changed a Village',
    'story3.excerpt': 'In Akkol, parents used to send children to the city for tutoring. Now the tutors come from the village — and no one is leaving.',

    // Foundation / Partner CTA
    'foundation.label':         'Jelken Foundation',
    'foundation.title':         'Partner With Us',
    'foundation.p1':            'Aul Bilim is a programme of Jelken Foundation — a Kazakhstani nonprofit committed to investing in education and social initiatives across the country.',
    'foundation.p2':            'Corporate partners, government bodies, and individual donors — together we bring real, lasting change to schools and teachers.',
    'foundation.cta_primary':   'Become a Partner',
    'foundation.cta_secondary': 'About Us →',

    // Footer
    'footer.tagline':       'Aul Bilim equips schools, trains teachers, and supports children across rural Kazakhstan — because every village deserves a future.',
    'footer.nav_title':     'Links',
    'footer.contact_title': 'Contact',
    'footer.address':       'Astana, Kazakhstan',
    'footer.copyright':     '© 2025 Jelken Foundation. All rights reserved.',
    'footer.org_type':      'Non-profit organisation',
  }

};
