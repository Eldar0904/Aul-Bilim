(function () {
  'use strict';
  var button=document.getElementById('pr-more');
  var cards=Array.from(document.querySelectorAll('.pr-card'));
  var additional=cards.slice(6);
  var expanded=false;
  var labels={kk:['Барлық жарияланымдар','Азырақ көрсету'],ru:['Все публикации','Показать меньше']};
  function renderLabel(){
    var lang=document.documentElement.getAttribute('data-lang')||'kk';
    var text=(labels[lang]||labels.kk)[expanded?1:0];
    button.querySelectorAll('[lang]').forEach(function(span){
      var pair=labels[span.getAttribute('lang')];
      if(pair)span.textContent=pair[expanded?1:0];
    });
    button.querySelector('.pr-more-n').textContent=String(additional.length);
    button.querySelector('.pr-more-n').hidden=expanded;
    button.setAttribute('aria-expanded',String(expanded));
  }
  if(!button||!additional.length)return;
  button.addEventListener('click',function(){
    expanded=!expanded;
    additional.forEach(function(card){card.hidden=!expanded;card.classList.toggle('is-hidden',!expanded);});
    renderLabel();
    if(!expanded)document.getElementById('press-title').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });
  renderLabel();
  new MutationObserver(renderLabel).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang']});
})();
