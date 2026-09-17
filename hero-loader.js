(() => {
  const markReady = () => document.body.classList.add('hero-loaded');
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markReady, { once: true });
  } else {
    markReady();
  }
})();
