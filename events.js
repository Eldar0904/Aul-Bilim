(function () {
  'use strict';

  var card = document.querySelector('[data-event-date]');
  var status = document.getElementById('event-status');
  if (!card || !status) return;

  var start = new Date(card.dataset.eventDate).getTime();
  var end = new Date(card.dataset.eventEnd).getTime();
  var now = Date.now();

  if (now >= end) {
    status.classList.add('is-past');
    status.innerHTML = '<span lang="kk">Өткен іс-шара</span><span lang="ru">Событие прошло</span>';
  } else if (now >= start) {
    status.classList.add('is-live');
    status.innerHTML = '<span lang="kk">Қазір өтіп жатыр</span><span lang="ru">Идёт сейчас</span>';
  }
})();
