'use strict';
(() => {
  const chapters=[...document.querySelectorAll('.story-chapter')];
  const progress=[...document.querySelectorAll('.story-progress a')];
  const stage=document.querySelector('.story-stage');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let queued=false;
  function update(){
    queued=false;
    const center=innerHeight*.5;
    let active=0,nearest=Infinity;
    chapters.forEach((chapter,index)=>{const box=chapter.getBoundingClientRect();const distance=Math.abs(box.top+box.height/2-center);if(distance<nearest){nearest=distance;active=index;}});
    document.body.dataset.chapter=String(active);
    chapters.forEach((chapter,index)=>chapter.classList.toggle('is-active',index===active));
    progress.forEach((link,index)=>index===active?link.setAttribute('aria-current','step'):link.removeAttribute('aria-current'));
    const box=chapters[active].getBoundingClientRect();
    stage.style.setProperty('--drift',reduce.matches?'0px':`${Math.max(-30,Math.min(30,(box.top/innerHeight)*-28))}px`);
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduce.addEventListener('change',schedule);
  update();
})();
