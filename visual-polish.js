'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer:fine)');
  const body = document.body;
  const orchard = document.querySelector('.atelier-home .orchard');

  if(!orchard || reduced.matches || !finePointer.matches) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let raf = 0;

  const animate = () => {
    currentX += (targetX - currentX) * .04;
    currentY += (targetY - currentY) * .04;
    orchard.style.setProperty('--mx', currentX.toFixed(2) + 'px');
    orchard.style.setProperty('--my', currentY.toFixed(2) + 'px');

    if(Math.abs(targetX-currentX) > .02 || Math.abs(targetY-currentY) > .02){
      raf = requestAnimationFrame(animate);
    } else {
      raf = 0;
    }
  };

  const queue = () => {
    if(!raf) raf = requestAnimationFrame(animate);
  };

  addEventListener('pointermove', event => {
    if(body.classList.contains('motion-paused')) return;
    const nx = event.clientX / innerWidth - .5;
    const ny = event.clientY / innerHeight - .5;
    targetX = Math.max(-4, Math.min(4, nx * -6));
    targetY = Math.max(-3, Math.min(3, ny * -4));
    queue();
  }, {passive:true});

  document.documentElement.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    queue();
  }, {passive:true});
})();
