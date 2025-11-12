try{
// SheckNet minimal JS
// - Adds header shadow on scroll (if HTML didn’t already)
// - Highlights active nav link automatically (robust if you forget aria-current)
// - Optional: smooth-scroll for same-page anchors

(function () {
  const header = document.querySelector('header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initialize state

  // Auto-highlight the current page in the nav (based on pathname)
  try {
    const path = location.pathname.replace(/\/index\.html$/, '/');
    document.querySelectorAll('nav a').forEach(a => {
      const href = a.getAttribute('href');
      // Normalize common cases: "index.html" vs "/"
      const normalized = href.replace(/\/index\.html$/, '/');
      const isSame = normalized === path || (normalized === 'index.html' && (path === '/' || path.endsWith('/index.html')));
      if (isSame) a.setAttribute('aria-current', 'page');
    });
  } catch (e) { /* noop */ }

  // Smooth-scroll for same-page hash links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();

// Guides landing: focus the (disabled) search input with Ctrl/Cmd+K (prefill for future enable)
(function(){
  const input = document.getElementById('search');
  if (!input) return;
  function isMac(){ return navigator.platform.toUpperCase().includes('MAC'); }
  document.addEventListener('keydown', (e)=>{
    const mod = isMac() ? e.metaKey : e.ctrlKey;
    if(mod && (e.key.toLowerCase()==='k')){
      e.preventDefault();
      input.focus();
    }
  });
})();

// Category pages: live-filter articles by text content
(function(){
  const search = document.getElementById('articleSearch');
  if(!search) return;
  const list = document.querySelector('.post-list');
  if(!list) return;

  const cards = Array.from(list.querySelectorAll('.post-card'));
  const empty = document.querySelector('.empty-state');

  function normalize(s){ return (s||'').toLowerCase(); }
  function filter(){
    const q = normalize(search.value);
    let shown = 0;
    cards.forEach(card => {
      const hay = normalize(card.textContent);
      const match = !q || hay.includes(q);
      card.style.display = match ? '' : 'none';
      if(match) shown++;
    });
    if(empty) empty.style.display = shown ? 'none' : '';
  }

  search.addEventListener('input', filter);

  // Keyboard shortcut: Ctrl/Cmd+K focuses #articleSearch
  function isMac(){ return navigator.platform.toUpperCase().includes('MAC'); }
  document.addEventListener('keydown', (e)=>{
    const mod = isMac() ? e.metaKey : e.ctrlKey;
    if(mod && (e.key.toLowerCase()==='k')){
      e.preventDefault();
      search.focus();
    }
  });

  filter();
})();


// Auto-list articles per category via /guides/manifest.json
(function(){
  const main = document.querySelector('main.category-page');
  if(!main) return;
  const slug = main.getAttribute('data-category');
  if(!slug) return;

  const list = document.querySelector('.post-list');
  const empty = document.querySelector('.empty-state');
  if(!list) return;

  const MANIFEST_URL = '/guides/manifest.json';

  function el(tag, attrs={}, children=[]) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v]) => {
      if(k === 'class') e.className = v;
      else if(k === 'html') e.innerHTML = v;
      else e.setAttribute(k, v);
    });
    children.forEach(c => e.appendChild(c));
    return e;
  }

  function render(posts){
    list.innerHTML = '';
    if(!posts || !posts.length){
      if(empty) empty.style.display = '';
      return;
    }
    if(empty) empty.style.display = 'none';

    posts.forEach(p => {
      // skip drafts if provided
      if(p.draft) return;
      const card = el('article', {class: 'post-card'});
      const h4 = el('h4', {}, [ el('a', {href: p.url || '#'}, [document.createTextNode(p.title || 'Untitled')]) ]);
      const summary = el('p', {class:'muted'}, [document.createTextNode(p.summary || '')]);
      const meta = el('p', {}, [ el('time', {datetime: p.date || ''}, [document.createTextNode(p.date || '')]) ]);
      card.appendChild(h4);
      if(p.summary) card.appendChild(summary);
      card.appendChild(meta);
      // tags (optional)
      if(Array.isArray(p.tags) && p.tags.length){
        const tagsWrap = el('div', {class:'tags'});
        p.tags.forEach(t => tagsWrap.appendChild(el('span', {class:'tag'}, [document.createTextNode(t)])));
        card.appendChild(tagsWrap);
      }
      list.appendChild(card);
    });
  }

  fetch(MANIFEST_URL, {cache: 'no-store'}).then(r => r.json()).then(data => {
    const posts = data && data.categories ? data.categories[slug] || [] : [];
    render(posts);
  }).catch(err => {
    console.warn('Failed to load manifest:', err);
    // leave the empty state in place
  });
})();

}catch(e){ console.warn('Manifest disabled; category dashboards hidden.', e); }
