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