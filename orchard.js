'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('#motion-toggle');
  const soundButton = document.querySelector('#sound-toggle');
  const overlay = document.querySelector('.page-transition');
  const status = document.querySelector('#garden-status');
  let busy = false;
  let paused = false;
  let sound = false;
  let audio = null;
  let activeAnimations = [];

  const syncMotion = () => {
    const stopped = paused || reduced.matches;
    document.body.classList.toggle('motion-paused', stopped);
    motionButton.textContent = stopped ? 'Включить движение' : 'Остановить движение';
    motionButton.setAttribute('aria-pressed', String(stopped));
  };

  motionButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reduced.addEventListener('change', syncMotion);
  syncMotion();

  soundButton.addEventListener('click', () => {
    sound = !sound;
    soundButton.textContent = sound ? 'Звук: вкл.' : 'Звук: выкл.';
    soundButton.setAttribute('aria-pressed', String(sound));
    if (!sound) return;
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume().catch(() => {});
    } catch {
      sound = false;
      soundButton.textContent = 'Звук недоступен';
      soundButton.setAttribute('aria-pressed', 'false');
    }
  });

  function note(frequency, duration, volume) {
    if (!sound || !audio) return;
    try {
      const now = audio.currentTime;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + .025);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + .03);
    } catch {}
  }

  function animate(element, keyframes, options) {
    const animation = element.animate(keyframes, options);
    activeAnimations.push(animation);
    return animation.finished;
  }

  function reset() {
    busy = false;
    activeAnimations.forEach(animation => animation.cancel());
    activeAnimations = [];
    document.querySelectorAll('.apple').forEach(apple => apple.removeAttribute('aria-disabled'));
    overlay.classList.remove('active');
    overlay.style.clipPath = '';
    document.body.removeAttribute('aria-busy');
    status.textContent = '';
  }

  window.addEventListener('pageshow', reset);
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('document-hidden', document.hidden));

  document.querySelectorAll('.apple').forEach(link => link.addEventListener('click', async event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (busy) return;
    const destination = link.href;
    if (reduced.matches || paused || !Element.prototype.animate) {
      location.assign(destination);
      return;
    }

    busy = true;
    document.body.setAttribute('aria-busy', 'true');
    document.querySelectorAll('.apple').forEach(apple => apple.setAttribute('aria-disabled', 'true'));
    status.textContent = 'Открываем: ' + link.dataset.name;

    const swing = link.querySelector('.apple-swing');
    const rect = swing.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const others = [...document.querySelectorAll('.apple')].filter(apple => apple !== link);
    note(392, .24, .025);

    try {
      await Promise.all([
        animate(swing, [
          { transform: 'translate3d(0,0,0) scale(1)' },
          { transform: 'translate3d(0,-5px,0) scale(1.08)', offset: .55 },
          { transform: 'translate3d(0,-2px,0) scale(1.03)' }
        ], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }),
        ...others.map(apple => animate(apple, [
          { opacity: 1, transform: 'translate3d(0,0,0)' },
          { opacity: .28, transform: 'translate3d(0,4px,0)' }
        ], { duration: 320, easing: 'ease-out', fill: 'forwards' }))
      ]);

      overlay.style.setProperty('--cx', cx + 'px');
      overlay.style.setProperty('--cy', cy + 'px');
      overlay.querySelector('.transition-name').textContent = link.dataset.name;
      overlay.classList.add('active');
      await animate(overlay, [
        { clipPath: `circle(0 at ${cx}px ${cy}px)` },
        { clipPath: `circle(${Math.hypot(innerWidth, innerHeight)}px at ${cx}px ${cy}px)` }
      ], { duration: 720, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'forwards' });
      location.assign(destination);
    } catch {
      location.assign(destination);
    }
  }));
})();
