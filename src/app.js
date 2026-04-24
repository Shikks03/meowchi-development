// ======= Meowchi app =======

// --- Page loader ---
(function pageLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const assetSrcs = [
    'assets/logo.jpg',
    'assets/chat.svg',
    'assets/poppy.svg',
    'assets/zoro.svg',
    'assets/strawberryoptimize2.gif',
    'assets/chocolateoptimize2.gif',
    'assets/matchaoptimize2.gif',
  ];

  function loadAsset(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = img.onerror = resolve;
      img.src = src;
    });
  }

  function dismiss() {
    loader.classList.add('loaded');
    setTimeout(() => loader.remove(), 600);
  }

  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.all([fontsReady, ...assetSrcs.map(loadAsset)]).then(dismiss);

  // Failsafe: never block the user more than 6 seconds
  setTimeout(dismiss, 6000);
})();

// --- Render characters ---
(function renderCharacters() {
  const row = document.getElementById('charRow');
  if (!row) return;
  row.innerHTML = window.CHARACTERS.map((c, i) => `
    <article class="char-card reveal" data-id="${c.id}" style="--card-color:${c.color}; --card-deep:${c.deep};">
      <div class="swatch-bg"></div>
      <div class="katakana">${c.katakana}</div>
      <div class="char-avatar">
        ${c.gif
          ? `<img src="assets/${c.gif}" alt="${c.name}">`
          : `<img src="assets/${c.id}.svg" alt="${c.name}">`
        }
      </div>
      <span class="tag">${c.tagline}</span>
      <h3>${c.name}.</h3>
      <div class="char-meta">
        <span>${c.breed}</span><span>${c.flavor}</span><span>${c.debut}</span>
      </div>
      <p class="char-story">${c.story}</p>
      <div class="char-traits">${c.traits.map(t => `<span>${t}</span>`).join('')}</div>
      <div class="char-bite"><strong>One bite:</strong> ${c.bite}</div>
    </article>
  `).join('');
})();

// --- Render FAQs ---
(function renderFAQs() {
  const list = document.getElementById('faqList');
  if (!list) return;
  list.innerHTML = window.FAQS.map((f, i) => `
    <details class="faq-item reveal" ${i === 0 ? 'open' : ''}>
      <summary class="faq-q"><span>${f.q}</span><span class="icon">+</span></summary>
      <div class="faq-a">${f.a}</div>
    </details>
  `).join('');
})();

// --- Time-based hero cat (cycles every 5 minutes) ---
(function heroCat() {
  const cats = [
    { src: 'assets/poppy.svg',       label: 'Poppy' },
    { src: 'assets/strawberryoptimize2.gif',  label: 'Poppy' },
    { src: 'assets/chat.svg',                label: 'Chat' },
    { src: 'assets/chocolateoptimize2.gif',  label: 'Chat' },
    { src: 'assets/zoro.svg',                label: 'Zoro' },
    { src: 'assets/matchaoptimize2.gif',     label: 'Zoro' },
  ];
  const img = document.getElementById('heroCatImg');
  if (!img) return;

  function getCat() {
    const now = new Date();
    const block = Math.floor((now.getHours() * 60 + now.getMinutes()) / 5);
    return cats[block % cats.length];
  }

  function update() {
    const cat = getCat();
    if (img.getAttribute('data-src') === cat.src) return;
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = cat.src;
      img.alt = cat.label;
      img.setAttribute('data-src', cat.src);
      img.style.opacity = '1';
    }, 300);
  }

  update();
  // recheck at the start of each 5-minute boundary
  function scheduleNext() {
    const now = new Date();
    const msUntilNext = (5 - (now.getMinutes() % 5)) * 60000 - now.getSeconds() * 1000 - now.getMilliseconds();
    setTimeout(() => { update(); scheduleNext(); }, msUntilNext);
  }
  scheduleNext();
})();

// --- Scroll-driven giant mochi squish ---
(function mochiSquish() {
  const el = document.getElementById('giantMochi');
  const hero = document.querySelector('.hero');
  if (!el || !hero) return;

  let ticking = false;
  function update() {
    const rect = hero.getBoundingClientRect();
    const h = rect.height;
    // progress 0 at hero top, 1 when hero scrolled past
    const p = Math.min(1, Math.max(0, -rect.top / h));
    // squish: at p=0 idle; at p=0.5 wide squish; at p=1 stretched tall
    const scaleX = 1 + Math.sin(p * Math.PI) * 0.18 + p * 0.05;
    const scaleY = 1 - Math.sin(p * Math.PI) * 0.18 + p * 0.05;
    const rot = p * 18 - 4;
    const translateY = p * 80;
    el.style.transform = `translateY(${translateY}px) rotate(${rot}deg) scale(${scaleX}, ${scaleY})`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

// --- Reveal-on-scroll ---
(function revealOnScroll() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// --- Nav shadow on scroll ---
(function navShadow() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 20
      ? '0 4px 18px rgba(74,44,26,0.08)'
      : 'none';
  }, { passive: true });
})();

// ======= TWEAKS =======
(function tweaks() {
  const panel = document.getElementById('tweaksPanel');
  const body = document.body;
  const state = { ...(window.TWEAKS || { theme: 'cream', accent: 'green', featured: 'poppy' }) };

  function applyFeatured() {
    document.querySelectorAll('.char-card').forEach(el => {
      el.dataset.featured = el.dataset.id === state.featured ? 'true' : 'false';
    });
  }
  function apply() {
    body.dataset.theme = state.theme;
    body.dataset.accent = state.accent;
    applyFeatured();
    panel.querySelectorAll('[data-key]').forEach(group => {
      const key = group.dataset.key;
      group.querySelectorAll('[data-val]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.val === state[key]);
      });
    });
  }
  apply();

  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-val]');
    if (!btn) return;
    const group = btn.closest('[data-key]');
    const key = group.dataset.key;
    state[key] = btn.dataset.val;
    apply();
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: state[key] } }, '*');
    } catch(_) {}
  });

  // Host protocol
  window.addEventListener('message', (ev) => {
    const m = ev.data || {};
    if (m.type === '__activate_edit_mode') panel.classList.add('active');
    else if (m.type === '__deactivate_edit_mode') panel.classList.remove('active');
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch(_) {}
})();

// --- Click a character card to feature it ---
document.addEventListener('click', (e) => {
  const card = e.target.closest('.char-card');
  if (!card) return;
  document.querySelectorAll('.char-card').forEach(c => c.dataset.featured = 'false');
  card.dataset.featured = 'true';
});
