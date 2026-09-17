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

    addEventListener('pointerleave', () => { targetX = targetY = 0; queue(); }, {passive:true});
  }

  function initApplePointerLife(){
    if(reduced.matches || !finePointer.matches) return;
    document.querySelectorAll('.atelier-home .apple').forEach(apple => {
      apple.addEventListener('pointermove', e => {
        const rect = apple.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - .5;
        const y = (e.clientY - rect.top) / rect.height - .5;
        apple.style.setProperty('--apple-rx', (y * -2.5).toFixed(2) + 'deg');
        apple.style.setProperty('--apple-ry', (x * 3.5).toFixed(2) + 'deg');
      }, {passive:true});
      apple.addEventListener('pointerleave', () => {
        apple.style.removeProperty('--apple-rx');
        apple.style.removeProperty('--apple-ry');
      }, {passive:true});
    });
  }

  function initPressFeedback(){
    document.querySelectorAll('a,button').forEach(el => {
      el.addEventListener('pointerdown', () => el.classList.add('gifs-pressed'));
      const clear = () => el.classList.remove('gifs-pressed');
      el.addEventListener('pointerup', clear);
      el.addEventListener('pointercancel', clear);
      el.addEventListener('pointerleave', clear);
    });
  }

  initOrchardParallax();
  initApplePointerLife();
  initPressFeedback();
})();
