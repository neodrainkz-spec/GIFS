(() => {
  const loadHero = async () => {
    const img = document.querySelector('.home-v3 .tree');
    if (!img) return;

    try {
      const urls = Array.from({ length: 8 }, (_, i) => `assets/hero-data/p${i}.txt?v=20260917-tree-approved`);
      const parts = await Promise.all(urls.map(async (url) => {
        const response = await fetch(url, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`Hero part failed: ${response.status}`);
        return (await response.text()).trim();
      }));

      img.src = `data:image/webp;base64,${parts.join('')}`;
      try { await img.decode(); } catch (_) {}
      document.body.classList.add('hero-loaded');
    } catch (error) {
      console.error('GIFS hero load failed', error);
      document.body.classList.add('hero-loaded');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHero, { once: true });
  } else {
    loadHero();
  }
})();
