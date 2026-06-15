/* ============================================================
   AUL BILIM — interactive regions map
   - 7 highlighted oblasts are clickable zones over img/map.png
   - click "collapses into" the region (zoom) and opens its districts
   Coordinate space for hotspots/pins is the natural PNG: 1150 x 660
   ============================================================ */
(function () {
  var VB_W = 1150, VB_H = 660, SCALE = 2.35;

  /* Each region: id, names, total schools, pin centre (fraction of map),
     hotspot polygon (in 1150x660 space) and its real districts (auдандар). */
  var REGIONS = [
    {
      id: 'aktobe', kk: 'Ақтөбе облысы', en: 'Aktobe Region', total: 36,
      cx: 0.152, cy: 0.432,
      poly: '147,199 162,204 159,208 162,212 168,209 172,212 177,202 181,204 188,199 194,212 216,210 222,214 222,219 226,223 236,227 238,233 246,238 243,247 247,252 244,267 248,272 241,287 235,288 225,296 224,307 218,315 204,315 201,318 195,338 178,336 174,329 157,329 124,353 112,354 110,357 96,352 52,346 32,339 38,320 46,311 46,306 40,301 42,283 54,272 53,265 57,257 61,255 64,258 78,280 84,282 92,278 96,270 91,259 91,249 111,237 111,227 120,227 134,219 141,206 148,205',
      districts: [
        { kk: 'Алға', en: 'Alga', n: 7 },
        { kk: 'Мұғалжар', en: 'Mugalzhar', n: 6 },
        { kk: 'Хромтау', en: 'Khromtau', n: 8 },
        { kk: 'Қобда', en: 'Qobda', n: 5 },
        { kk: 'Мәртөк', en: 'Martok', n: 6 },
        { kk: 'Шалқар', en: 'Shalqar', n: 4 }
      ]
    },
    {
      id: 'kostanay', kk: 'Қостанай облысы', en: 'Kostanay Region', total: 43,
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
      id: 'pavlodar', kk: 'Павлодар облысы', en: 'Pavlodar Region', total: 67,
      cx: 0.857, cy: 0.485,
      poly: '919,203 938,242 941,241 939,238 942,239 951,232 950,223 956,219 968,223 966,233 975,233 977,243 990,241 994,244 1005,244 1012,236 1018,237 1022,232 1031,232 1044,240 1055,265 1058,264 1073,272 1071,277 1079,291 1089,290 1097,292 1099,296 1106,296 1108,291 1120,283 1116,291 1122,294 1129,306 1135,308 1124,310 1119,315 1120,327 1115,334 1106,338 1095,338 1091,342 1086,358 1091,385 1086,393 1080,393 1067,402 1065,396 1043,396 1022,386 1019,388 1000,450 927,403 940,400 924,400 922,397 921,399 915,395 917,393 913,394 828,337 825,289 835,267 841,262 848,263 852,251 858,247 873,255 876,266 896,273 904,265 906,256 903,244 887,227 904,219 906,213 910,213',
      districts: [
        { kk: 'Баянауыл', en: 'Bayanaul', n: 13 },
        { kk: 'Ертіс', en: 'Ertis', n: 12 },
        { kk: 'Май', en: 'May', n: 9 },
        { kk: 'Успен', en: 'Uspen', n: 10 },
        { kk: 'Шарбақты', en: 'Sharbakty', n: 11 },
        { kk: 'Аққулы', en: 'Akkuly', n: 12 }
      ]
    },
    {
      id: 'kyzylorda', kk: 'Қызылорда облысы', en: 'Kyzylorda Region', total: 43,
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

  document.addEventListener('DOMContentLoaded', function () {
    var stage = document.getElementById('map-stage');
    var pan = document.getElementById('map-pan');
    var svg = document.getElementById('map-hot');
    var tip = document.getElementById('map-tip');
    var intro = document.getElementById('map-intro');
    var panel = document.getElementById('region-panel');
    if (!stage || !pan || !svg) return;

    var current = null;

    /* build hotspots + pins */
    REGIONS.forEach(function (r) {
      var pg = el('polygon', { points: r.poly, 'class': 'hot', 'data-region': r.id });
      svg.appendChild(pg);
    });
    REGIONS.forEach(function (r) {
      var px = r.cx * VB_W, py = r.cy * VB_H;
      var p1 = el('circle', { cx: px, cy: py, r: 10, 'class': 'pulse', 'data-pulse': r.id });
      var p2 = el('circle', { cx: px, cy: py, r: 10, 'class': 'pulse pulse2', 'data-pulse': r.id });
      svg.appendChild(p1);
      svg.appendChild(p2);
      if (!r.noPin) {
        var pin = el('circle', { cx: px, cy: py, r: 7, 'class': 'pin', 'data-region': r.id });
        svg.appendChild(pin);
      }
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
    function showTip(r, evt) {
      var rect = stage.getBoundingClientRect();
      tip.innerHTML = bi(r.kk, r.en);
      tip.style.left = (evt.clientX - rect.left) + 'px';
      tip.style.top = (evt.clientY - rect.top) + 'px';
      tip.classList.add('show');
    }
    function hideTip() { tip.classList.remove('show'); }

    svg.addEventListener('mousemove', function (e) {
      if (current) return;
      var id = e.target.getAttribute && e.target.getAttribute('data-region');
      if (id) showTip(regionById(id), e); else hideTip();
    });
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
