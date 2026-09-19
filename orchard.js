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
    document.querySelectorAll('.falling-apple,.landing-ring').forEach(element => element.remove());
    document.querySelectorAll('.apple').forEach(apple => {
      apple.classList.remove('picking');
      apple.removeAttribute('aria-disabled');
    });
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
    const image = swing.querySelector('img');
    const rect = image.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const others = [...document.querySelectorAll('.apple')].filter(apple => apple !== link);
    const landingTop = innerHeight - 72 - rect.height;
    const drop = Math.max(100, landingTop - rect.top);
    const isRightDrift = link.classList.contains('apple-atmosphere') || link.classList.contains('apple-contact');
    const drift = isRightDrift ? Math.min(34, innerWidth * .028) : -Math.min(28, innerWidth * .024);
    const spin = isRightDrift ? 86 : -74;
    const clone = document.createElement('img');
    clone.src = image.src;
    clone.alt = '';
    clone.className = 'falling-apple';
    Object.assign(clone.style, {
      left: rect.left + 'px',
      top: rect.top + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px'
    });
    document.body.append(clone);
    link.classList.add('picking');
    note(392, .24, .025);

    try {
      await Promise.all([
        animate(clone, [
          { transform: 'translate3d(0,0,0) rotate(180deg) scale(1)', offset: 0 },
          { transform: 'translate3d(-1px,-8px,0) rotate(176deg) scale(1.035)', offset: .46 },
          { transform: 'translate3d(1px,-4px,0) rotate(182deg) scale(1.018)', offset: 1 }
        ], { duration: 270, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }),
        ...others.map(apple => animate(apple, [
          { opacity: 1 },
          { opacity: .68 }
        ], { duration: 340, easing: 'ease-out', fill: 'forwards' }))
      ]);

      await animate(clone, [
        { transform: 'translate3d(1px,-4px,0) rotate(182deg) scale(1.018)', offset: 0 },
        { transform: `translate3d(${drift * .10}px,${drop * .06}px,0) rotate(${180 + spin * .08}deg) scale(1.012)`, offset: .16 },
        { transform: `translate3d(${drift * .36}px,${drop * .31}px,0) rotate(${180 + spin * .34}deg) scale(1.006)`, offset: .47 },
        { transform: `translate3d(${drift * .74}px,${drop * .68}px,0) rotate(${180 + spin * .72}deg) scale(1.002)`, offset: .76 },
        { transform: `translate3d(${drift}px,${drop}px,0) rotate(${180 + spin}deg) scale(1)`, offset: 1 }
      ], { duration: 860, easing: 'cubic-bezier(.28,.03,.78,.42)', fill: 'forwards' });

      const landingX = cx + drift;
      const landingY = rect.top + drop + rect.height;
      const ring = document.createElement('span');
      ring.className = 'landing-ring';
      Object.assign(ring.style, { left: (landingX - 28) + 'px', top: (landingY - 5) + 'px', width: '56px', height: '12px' });
      document.body.append(ring);
      note(118, .2, .035);
      await Promise.all([
        animate(clone, [
          { transform: `translate3d(${drift}px,${drop}px,0) rotate(${180 + spin}deg) scale(1,1)` },
          { transform: `translate3d(${drift + 1}px,${drop + 5}px,0) rotate(${180 + spin + (isRightDrift ? 5 : -5)}deg) scale(1.075,.91)`, offset: .34 },
          { transform: `translate3d(${drift - 1}px,${drop - 2}px,0) rotate(${180 + spin - (isRightDrift ? 2 : -2)}deg) scale(.995,1.02)`, offset: .68 },
          { transform: `translate3d(${drift}px,${drop}px,0) rotate(${180 + spin}deg) scale(1,1)` }
        ], { duration: 330, easing: 'cubic-bezier(.2,.78,.25,1)', fill: 'forwards' }),
        animate(ring, [
          { transform: 'scale(.45)', opacity: .55 },
          { transform: 'scale(2.1)', opacity: 0 }
        ], { duration: 480, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'forwards' })
      ]);

      overlay.style.setProperty('--cx', landingX + 'px');
      overlay.style.setProperty('--cy', landingY + 'px');
      overlay.querySelector('.transition-name').textContent = link.dataset.name;
      overlay.classList.add('active');
      await animate(overlay, [
        { clipPath: `circle(0 at ${landingX}px ${landingY}px)` },
        { clipPath: `circle(${Math.hypot(innerWidth, innerHeight)}px at ${landingX}px ${landingY}px)` }
      ], { duration: 680, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'forwards' });
      location.assign(destination);
    } catch {
      location.assign(destination);
    }
  }));
})();


/*
 * Orchard image-space anchors (0..1 across the actual desktop/mobile image).
 * object-fit:cover can crop the photograph; viewport percentages cannot track
 * the branches. Keep the CSS percentage positions as the no-JavaScript fallback.
 */
(() => {
  const orchard = document.querySelector('.home-v3 .orchard');
  const image = orchard?.querySelector('.tree');
  const header = document.querySelector('.home-v3 .garden-header');
  const footer = document.querySelector('.home-v3 .garden-footer');
  const copy = document.querySelector('.home-v3 .home-copy');
  if (!orchard || !image || !header || !footer) return;

  // Order: services, atmosphere, NeoDrain, contact.
  // Coordinates are on the source photograph, not on the browser viewport.
  const anchors = {
    desktop: [[.225,.31],[.345,.25],[.31,.42],[.36,.36]],
    mobile:  [[.27,.48],[.56,.40],[.41,.59],[.63,.52]]
  };
  const fruit = [...orchard.querySelectorAll('.fruit-navigation .apple')];
  if (fruit.length !== 4) return;
  const mobileView = matchMedia('(max-width: 680px)');
  let pending = false;

  function placeFruit() {
    pending = false;
    const iw = image.naturalWidth;
    const ih = image.naturalHeight;
    if (!(iw > 0 && ih > 0)) return;

    const bounds = orchard.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    if (!(width > 0 && height > 0)) return;

    // Mirrors CSS object-fit:cover and the center/left object-position rules.
    const scale = Math.max(width / iw, height / ih);
    const renderedWidth = iw * scale;
    const renderedHeight = ih * scale;
    const position = getComputedStyle(image).objectPosition;
    const cropX = (width - renderedWidth) * (position.startsWith('left') ? 0 : .5);
    const cropY = (height - renderedHeight) / 2;
    const headerBottom = header.getBoundingClientRect().bottom - bounds.top;
    const footerTop = footer.getBoundingClientRect().top - bounds.top;
    const copyRect = copy?.getBoundingClientRect();
    const positions = anchors[mobileView.matches ? 'mobile' : 'desktop'];

    fruit.forEach((link, i) => {
      const [u, v] = positions[i];
      const halfWidth = link.offsetWidth / 2;
      const halfHeight = link.offsetHeight / 2;

      // Include stem and visible focus ring in the safe area below the header.
      const minY = Math.max(halfHeight + 8, headerBottom + halfHeight + 19);
      const maxY = Math.max(minY, footerTop - halfHeight - 12);
      const minX = halfWidth + 8;
      const maxX = Math.max(minX, width - halfWidth - 8);

      let x = Math.min(maxX, Math.max(minX, cropX + u * renderedWidth));
      let y = Math.min(maxY, Math.max(minY, cropY + v * renderedHeight));

      // In compact layouts, avoid positioning a fruit over the headline.
      if (copyRect) {
        const gap = 12;
        const overlaps = x + halfWidth + gap > copyRect.left - bounds.left &&
          x - halfWidth - gap < copyRect.right - bounds.left &&
          y + halfHeight + gap > copyRect.top - bounds.top &&
          y - halfHeight - gap < copyRect.bottom - bounds.top;
        if (overlaps) {
          const leftOfCopy = copyRect.left - bounds.left - halfWidth - gap;
          if (leftOfCopy >= minX) x = Math.min(x, leftOfCopy);
          else y = Math.min(maxY, Math.max(y, copyRect.bottom - bounds.top + halfHeight + gap));
        }
      }

      link.style.left = x.toFixed(2) + 'px';
      link.style.top = y.toFixed(2) + 'px';
    });
  }

  function queuePlacement() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(placeFruit);
  }

  image.addEventListener('load', queuePlacement);
  if (image.complete) queuePlacement();
  window.addEventListener('resize', queuePlacement, { passive: true });
  window.addEventListener('orientationchange', queuePlacement, { passive: true });
  mobileView.addEventListener?.('change', queuePlacement);
  if ('ResizeObserver' in window) new ResizeObserver(queuePlacement).observe(orchard);
  document.fonts?.ready.then(queuePlacement).catch(() => {});
})();
