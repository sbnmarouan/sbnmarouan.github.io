// Scroll doux pour ancres internes
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href").slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  history.pushState(null, "", `#${id}`);
});

// Surligne la section active dans le menu
const navLinks = Array.from(document.querySelectorAll('#site-nav a[href^="#"], #nav-menu a[href^="#"]'));
const sections = navLinks
  .map(a => document.getElementById(a.getAttribute("href").slice(1)))
  .filter(Boolean);

if (sections.length) {
  const io = new IntersectionObserver(entries => {
    const v = entries.filter(e => e.isIntersecting)
                     .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!v) return;
    const id = v.target.id;
    navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
  }, { threshold: [0.3, 0.6] });
  sections.forEach(s => io.observe(s));
}

// Lazy-loading fallback (si tu utilises data-src)
if ("IntersectionObserver" in window) {
  const imgs = document.querySelectorAll('img[data-src]');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      target.src = target.getAttribute("data-src");
      target.removeAttribute("data-src");
      obs.unobserve(target);
    });
  }, { rootMargin: "200px" });
  imgs.forEach(img => io.observe(img));
}
