(() => {
  const loadHero = async () => {
    const img = document.querySelector('.home-v2 .tree');
    if (!img) return;
    try {
      const urls = Array.from({ length: 8 }, (_, i) => `assets/hero-data/p${i}.txt?v=20260917-tree`);
      const parts = await Promise.all(urls.map(async (url) => {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Hero part failed: ${response.status}`);
        return (await response.text()).trim();
      }));
      img.src = `data:image/webp;base64,${parts.join('')}`;
      img.classList.add('hero-ready');
      document.body.classList.add('hero-loaded');
    } catch (error) {
      console.error('GIFS hero load failed', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHero, { once: true });
  } else {
    loadHero();
  }
})();
