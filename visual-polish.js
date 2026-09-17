'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer:fine)');
  const body = document.body;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function initOrchardParallax(){
    const orchard = document.querySelector('.atelier-home .orchard');
    if(!orchard || reduced.matches || !finePointer.matches) return;

    let targetX = 0, targetY = 0, currentX = 0, currentY = 0, raf = 0;
    const animate = () => {
      currentX += (targetX - currentX) * .075;
      currentY += (targetY - currentY) * .075;
      orchard.style.setProperty('--mx', currentX.toFixed(2) + 'px');
      orchard.style.setProperty('--my', currentY.toFixed(2) + 'px');
      if(Math.abs(targetX-currentX) > .05 || Math.abs(targetY-currentY) > .05) raf = requestAnimationFrame(animate);
      else raf = 0;
    };
    const queue = () => { if(!raf) raf = requestAnimationFrame(animate); };

    addEventListener('pointermove', e => {
      if(body.classList.contains('motion-paused')) return;
      const nx = e.clientX / innerWidth - .5;
      const ny = e.clientY / innerHeight - .5;
      targetX = clamp(nx * -10, -6, 6);
      targetY = clamp(ny * -7, -4, 4);
      queue();
    }, {passive:true});

    addEventListener('pointerleave', () => {
      targetX = 0; targetY = 0; queue();
    }, {passive:true});
  }

  initOrchardParallax();
})();
