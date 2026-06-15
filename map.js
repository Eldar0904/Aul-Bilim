/* ============================================================
   AUL BILIM — interactive regions map
   - highlighted oblasts are clickable zones over the current Kazakhstan SVG map
   - click "collapses into" the region (zoom) and opens its districts
   Coordinate space for hotspots/pins is the current SVG: 1000 x 549
   ============================================================ */
(function () {
  var VB_W = 1000, VB_H = 549, SCALE = 2.35;

  /* Each region: id, names, total schools, pin centre (fraction of map),
     hotspot polygon (in 1150x660 space) and its real districts (auдандар). */
  var REGIONS = [
    {
      id: 'west-kazakhstan', kk: 'Батыс Қазақстан облысы', en: 'West Kazakhstan Region', total: 36,
      mapId: 'KZ27',
      cx: 0.11, cy: 0.41,
      districts: [
        { kk: 'Орал', en: 'Oral', n: 8 },
        { kk: 'Бәйтерек', en: 'Baiterek', n: 6 },
        { kk: 'Бөрлі', en: 'Borli', n: 6 },
        { kk: 'Теректі', en: 'Terekti', n: 6 },
        { kk: 'Ақжайық', en: 'Akzhaiyk', n: 5 },
        { kk: 'Сырым', en: 'Syrym', n: 5 }
      ]
    },
    {
      id: 'kostanay', kk: 'Қостанай облысы', en: 'Kostanay Region', total: 43,
      mapId: 'KZ39',
      cx: 0.426, cy: 0.265,
      poly: '556,66 562,72 562,87 568,92 559,98 559,102 564,109 561,117 567,124 570,136 561,142 563,153 560,156 559,170 567,175 576,174 577,177 592,178 588,244 583,248 587,249 519,323 480,326 479,320 470,320 461,308 464,304 459,295 464,293 463,289 468,280 476,278 476,273 466,255 464,245 460,243 459,229 455,225 452,227 447,217 441,219 437,212 426,210 421,204 408,202 410,196 399,193 397,189 402,189 409,182 415,182 425,173 416,158 425,145 436,143 439,146 450,147 455,141 453,137 441,131 437,133 428,128 430,122 435,124 439,117 422,115 430,107 424,101 430,102 432,96 439,101 451,101 454,97 462,97 460,100 465,104 468,95 481,94 482,90 488,91 496,87 502,89 506,87 505,84 518,81 525,83 531,80 537,84 539,73 545,69 553,70',
      districts: [
        { kk: 'Меңдіқара', en: 'Mendykara', n: 8 },
        { kk: 'Әулиекөл', en: 'Auliekol', n: 7 },
        { kk: 'Денисов', en: 'Denisov', n: 6 },
        { kk: 'Қарабалық', en: 'Qarabalyq', n: 7 },
        { kk: 'Сарыкөл', en: 'Sarykol', n: 8 },
        { kk: 'Федоров', en: 'Fedorov', n: 7 }
      ]
    },
    {
      id: 'akmola', kk: 'Ақмола облысы', en: 'Akmola Region', total: 36,
      mapId: 'KZ11',
      cx: 0.604, cy: 0.288,
      poly: '657,113 663,113 665,120 671,121 669,126 675,127 681,133 688,125 695,125 702,131 710,127 715,133 713,143 716,147 728,148 733,144 744,143 748,155 775,164 776,191 771,196 770,204 781,208 774,210 765,220 776,224 774,246 778,250 792,249 794,255 801,256 805,263 799,269 802,274 812,268 835,265 825,288 689,266 685,263 683,265 623,255 619,254 615,247 613,253 588,249 593,178 599,176 599,171 611,176 618,172 618,165 625,163 636,152 639,138 630,125 638,115 647,114 653,121 653,116',
      districts: [
        { kk: 'Бурабай', en: 'Burabay', n: 8 },
        { kk: 'Зеренді', en: 'Zerendi', n: 6 },
        { kk: 'Атбасар', en: 'Atbasar', n: 5 },
        { kk: 'Целиноград', en: 'Tselinograd', n: 7 },
        { kk: 'Шортанды', en: 'Shortandy', n: 5 },
        { kk: 'Аршалы', en: 'Arshaly', n: 5 }
      ]
    },
    {
      id: 'karaganda', kk: 'Қарағанды облысы', en: 'Karaganda Region', total: 67,
      mapId: 'KZ35',
      cx: 0.583, cy: 0.515,
      poly: '587,250 591,250 592,254 593,251 598,251 824,289 828,339 757,436 615,436 520,324',
      districts: [
        { kk: 'Абай', en: 'Abai', n: 12 },
        { kk: 'Бұқар жырау', en: 'Bukhar-Zhyrau', n: 14 },
        { kk: 'Қарқаралы', en: 'Karkaraly', n: 9 },
        { kk: 'Нұра', en: 'Nura', n: 10 },
        { kk: 'Осакаров', en: 'Osakarov', n: 11 },
        { kk: 'Шет', en: 'Shet', n: 11 }
      ]
    },
    {
      id: 'abay', kk: 'Абай облысы', en: 'Abay Region', total: 67,
      mapId: 'KZ10',
      cx: 0.78, cy: 0.52,
      districts: [
        { kk: 'Семей', en: 'Semey', n: 13 },
        { kk: 'Аягөз', en: 'Ayagoz', n: 12 },
        { kk: 'Бесқарағай', en: 'Beskaragai', n: 10 },
        { kk: 'Бородулиха', en: 'Borodulikha', n: 11 },
        { kk: 'Жарма', en: 'Zharma', n: 11 },
        { kk: 'Көкпекті', en: 'Kokpekti', n: 10 }
      ]
    },
    {
      id: 'kyzylorda', kk: 'Қызылорда облысы', en: 'Kyzylorda Region', total: 43,
      mapId: 'KZ43',
      cx: 0.443, cy: 0.719,
      poly: '516,324 521,326 614,436 593,437 597,445 593,464 601,471 602,500 618,513 614,516 614,523 611,523 606,535 611,542 580,562 573,563 564,572 561,572 562,550 553,552 547,538 531,522 517,528 480,525 451,530 430,507 423,495 374,463 371,457 371,440 375,430 396,405 408,400 411,393 419,391 432,368 447,366 463,387 473,390 511,361 498,338 480,327',
      districts: [
        { kk: 'Арал', en: 'Aral', n: 7 },
        { kk: 'Қазалы', en: 'Kazaly', n: 7 },
        { kk: 'Қармақшы', en: 'Karmakshy', n: 7 },
        { kk: 'Жалағаш', en: 'Zhalagash', n: 7 },
        { kk: 'Сырдария', en: 'Syrdarya', n: 8 },
        { kk: 'Шиелі', en: 'Shieli', n: 7 }
      ]
    },
    {
      id: 'turkistan', kk: 'Түркістан облысы', en: 'Turkistan Region', total: 43,
      mapId: 'KZ61',
      noPin: true,
      cx: 0.548, cy: 0.815,
      poly: '594,437 690,437 690,560 685,581 660,598 640,614 620,632 615,629 578,613 575,597 560,581 560,573 573,565 587,557 599,549 612,533 615,517 614,509 604,501 603,477 595,461',
      districts: [
        { kk: 'Сайрам', en: 'Sairam', n: 8 },
        { kk: 'Сарыағаш', en: 'Saryagash', n: 8 },
        { kk: 'Мақтаарал', en: 'Maktaaral', n: 7 },
        { kk: 'Ордабасы', en: 'Ordabasy', n: 6 },
        { kk: 'Түлкібас', en: 'Tulkibas', n: 7 },
        { kk: 'Қазығұрт', en: 'Kazygurt', n: 7 }
      ]
    },
    {
      id: 'jambyl', kk: 'Жамбыл облысы', en: 'Jambyl Region', total: 32,
      mapId: 'KZ31',
      noPin: true,
      cx: 0.643, cy: 0.758,
      poly: '690,437 780,437 776,453 771,469 779,477 787,485 790,493 801,501 811,509 809,517 804,525 813,533 811,541 819,549 761,557 759,565 691,573 690,560',
      districts: [
        { kk: 'Байзақ', en: 'Baizak', n: 6 },
        { kk: 'Жамбыл', en: 'Zhambyl', n: 5 },
        { kk: 'Жуалы', en: 'Zhualy', n: 5 },
        { kk: 'Қордай', en: 'Korday', n: 6 },
        { kk: 'Меркі', en: 'Merki', n: 5 },
        { kk: 'Шу', en: 'Shu', n: 5 }
      ]
    },
    {
      id: 'almaty', kk: 'Алматы облысы', en: 'Almaty Region', total: 43,
      mapId: 'KZ19',
      cx: 0.761, cy: 0.742,
      poly: '828,340 999,450 996,452 1001,456 1008,458 1006,468 1000,464 989,467 986,461 982,460 966,467 940,472 933,478 939,483 950,484 946,492 946,507 959,544 949,546 947,550 952,553 942,559 944,578 935,569 923,568 915,556 863,552 859,549 848,552 820,549 812,542 815,532 804,528 812,514 812,508 806,502 796,499 792,495 791,487 780,477 779,472 771,467 779,463 777,449 781,437 758,435',
      districts: [
        { kk: 'Еңбекшіқазақ', en: 'Enbekshikazakh', n: 9 },
        { kk: 'Қарасай', en: 'Karasai', n: 8 },
        { kk: 'Талғар', en: 'Talgar', n: 7 },
        { kk: 'Іле', en: 'Ile', n: 6 },
        { kk: 'Жамбыл', en: 'Zhambyl', n: 7 },
        { kk: 'Райымбек', en: 'Raiymbek', n: 6 }
      ]
    }
  ];

  var SVGNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function bi(kk, en) {
    return '<span lang="kk">' + kk + '</span><span lang="en">' + en + '</span>';
  }
  var MAP_LABELS = {
    KZ10: { kk: 'Абай', en: 'Abay' },
    KZ11: { kk: 'Ақмола', en: 'Akmola' },
    KZ15: { kk: 'Ақтөбе', en: 'Aktobe' },
    KZ19: { kk: 'Алматы', en: 'Almaty' },
    KZ23: { kk: 'Атырау', en: 'Atyrau' },
    KZ27: { kk: 'БҚО', en: 'West KZ' },
    KZ31: { kk: 'Жамбыл', en: 'Jambyl' },
    KZ33: { kk: 'Жетісу', en: 'Jetisu' },
    KZ35: { kk: 'Қарағанды', en: 'Karaganda' },
    KZ39: { kk: 'Қостанай', en: 'Kostanay' },
    KZ43: { kk: 'Қызылорда', en: 'Kyzylorda' },
    KZ47: { kk: 'Маңғыстау', en: 'Mangystau' },
    KZ55: { kk: 'Павлодар', en: 'Pavlodar' },
    KZ59: { kk: 'СҚО', en: 'North KZ' },
    KZ61: { kk: 'Түркістан', en: 'Turkestan' },
    KZ62: { kk: 'Ұлытау', en: 'Ulytau' },
    KZ63: { kk: 'ШҚО', en: 'East KZ' }
  };
  var MAP_LABEL_POSITIONS = {
    KZ11: { x: 575, y: 170 },
    KZ35: { x: 600, y: 315 }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var stage = document.getElementById('map-stage');
    var pan = document.getElementById('map-pan');
    var svg = document.getElementById('map-hot');
    var tip = document.getElementById('map-tip');
    var intro = document.getElementById('map-intro');
    var panel = document.getElementById('region-panel');
    if (!stage || !pan || !svg) return;

    var current = null;

    var regionByMapId = {};
    REGIONS.forEach(function (r) { regionByMapId[r.mapId] = r; });

    function buildCurrentMap(svgText) {
      var doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
      var sourcePaths = doc.querySelectorAll('#features path[id]');
      var activePaths = [];
      var labels = [];

      sourcePaths.forEach(function (sourcePath) {
        var mapId = sourcePath.getAttribute('id');
        var region = regionByMapId[mapId];
        var path = el('path', {
          d: sourcePath.getAttribute('d'),
          id: 'map-' + mapId,
          'class': 'map-region' + (region ? ' hot active' : ''),
          'data-region': region ? region.id : ''
        });
        path.setAttribute('data-map-id', mapId);
        path.setAttribute('aria-label', sourcePath.getAttribute('name') || mapId);
        svg.appendChild(path);
        if (region) activePaths.push({ region: region, path: path });
      });

      svg.querySelectorAll('.map-region').forEach(function (path) {
        var mapId = path.getAttribute('data-map-id');
        var label = MAP_LABELS[mapId];
        if (!label) return;
        var region = regionByMapId[mapId];
        var box = path.getBBox();
        var pos = MAP_LABEL_POSITIONS[mapId] || {
          x: box.x + box.width / 2,
          y: box.y + box.height / 2
        };
        var text = el('text', {
          x: pos.x,
          y: pos.y,
          'class': 'map-label' + (region ? ' active' : ''),
          'data-map-label': mapId
        });
        if (region) text.setAttribute('data-region', region.id);
        svg.appendChild(text);
        labels.push({ node: text, label: label });
      });

      function syncLabels() {
        var lang = document.documentElement.getAttribute('data-lang') || 'kk';
        labels.forEach(function (item) {
          item.node.textContent = item.label[lang] || item.label.kk;
        });
      }
      syncLabels();
      new MutationObserver(syncLabels).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });

      activePaths.forEach(function (item) {
        var box = item.path.getBBox();
        var px = box.x + box.width / 2;
        var py = box.y + box.height / 2;
        item.region.cx = px / VB_W;
        item.region.cy = py / VB_H;
        var p1 = el('circle', { cx: px, cy: py, r: 7, 'class': 'pulse', 'data-pulse': item.region.id });
        var p2 = el('circle', { cx: px, cy: py, r: 7, 'class': 'pulse pulse2', 'data-pulse': item.region.id });
        svg.appendChild(p1);
        svg.appendChild(p2);
      });
    }

    fetch('assets/kazakhstan-admin1-current.svg')
      .then(function (res) { return res.text(); })
      .then(buildCurrentMap)
      .catch(function () {
        svg.setAttribute('aria-label', 'Map could not be loaded');
      });

    /* hover → pulse rings */
    svg.addEventListener('mouseover', function (e) {
      var id = e.target.getAttribute && e.target.getAttribute('data-region');
      if (id) svg.querySelectorAll('[data-pulse="' + id + '"]').forEach(function (p) { p.classList.add('hovered'); });
    });
    svg.addEventListener('mouseout', function (e) {
      var id = e.target.getAttribute && e.target.getAttribute('data-region');
      if (id) svg.querySelectorAll('[data-pulse="' + id + '"]').forEach(function (p) { p.classList.remove('hovered'); });
    });

    function regionById(id) {
      for (var i = 0; i < REGIONS.length; i++) if (REGIONS[i].id === id) return REGIONS[i];
      return null;
    }

    /* ---- tooltip ---- */
    function hideTip() { tip.classList.remove('show'); }

    svg.addEventListener('mouseleave', hideTip);

    /* ---- zoom ---- */
    function applyZoom(r) {
      var W = pan.clientWidth, H = pan.clientHeight;
      var Px = r.cx * W, Py = r.cy * H;
      var tx = W / 2 - SCALE * Px;
      var ty = H / 2 - SCALE * Py;
      tx = Math.min(0, Math.max(W * (1 - SCALE), tx));
      ty = Math.min(0, Math.max(H * (1 - SCALE), ty));
      pan.style.transformOrigin = '0 0';
      pan.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + SCALE + ')';
    }

    function openRegion(id) {
      var r = regionById(id);
      if (!r) return;
      current = r;
      hideTip();
      stage.classList.add('zoomed');
      // mark selected polygon
      svg.querySelectorAll('.hot').forEach(function (p) {
        p.classList.toggle('sel', p.getAttribute('data-region') === id);
      });
      applyZoom(r);

      // build districts
      var chips = r.districts.map(function (d, i) {
        return '<div class="district" style="animation-delay:' + (0.06 * i + 0.15) + 's">' +
          '<span class="dn">' + bi(d.kk, d.en) + '</span>' +
          '<span class="dc">' + d.n + ' ' + bi('мектеп', 'schools') + '</span>' +
        '</div>';
      }).join('');

      panel.innerHTML =
        '<button class="region-back" id="region-back">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>' +
          bi('Барлық аймақтар', 'All regions') +
        '</button>' +
        '<div class="region-head"><h3>' + bi(r.kk, r.en) + '</h3>' +
          '<span class="tot">' + r.total + ' ' + bi('мектеп', 'schools') + '</span></div>' +
        '<p class="region-sub">' + bi('Біз жұмыс істейтін аудандар', 'Districts where we work') + '</p>' +
        '<div class="district-grid">' + chips + '</div>';

      intro.classList.add('hide');
      panel.classList.add('show');
      document.getElementById('region-back').addEventListener('click', closeRegion);

      // on stacked (mobile) layouts the panel sits above the map — bring it into view
      if (window.innerWidth <= 980) {
        var card = stage.closest('.map-card') || panel;
        var top = card.getBoundingClientRect().top + window.scrollY - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }

    function closeRegion() {
      current = null;
      stage.classList.remove('zoomed');
      pan.style.transform = 'none';
      svg.querySelectorAll('.hot').forEach(function (p) { p.classList.remove('sel'); });
      panel.classList.remove('show');
      intro.classList.remove('hide');
    }

    svg.addEventListener('click', function (e) {
      var id = e.target.getAttribute && e.target.getAttribute('data-region');
      if (id) openRegion(id);
    });

    window.addEventListener('resize', function () {
      if (current) applyZoom(current);
    });
  });
})();
