document.addEventListener('DOMContentLoaded', () => {
  const btn  = document.querySelector('.menu-button, .nav__toggle');
  if (!btn) return;

  // Trouve le menu associé en priorité via aria-controls
  const targetId = btn.getAttribute('aria-controls');
  const menu = (targetId && document.getElementById(targetId))   // <-- By majuscule
            || document.querySelector('#site-nav, #nav-menu');
  if (!menu) return;

  // Si le bouton est dans un <form>, évite le submit
  try { btn.type = 'button'; } catch {}

  const open  = () => { menu.classList.add('is-open');  btn.setAttribute('aria-expanded', 'true');  };
  const close = () => { menu.classList.remove('is-open');btn.setAttribute('aria-expanded', 'false'); };

  // État initial fermé
  close();

  // Toggle au clic
  btn.addEventListener('click', () => {
    menu.classList.contains('is-open') ? close() : open();
  });

  // Ferme au clic sur un lien
  menu.querySelectorAll('a[href]').forEach(a => a.addEventListener('click', close));

  // Ferme avec Échap
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); btn.focus(); }
  });

  // Ferme en cliquant hors du menu/bouton
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (e.target === btn || btn.contains(e.target) || menu.contains(e.target)) return;
    close();
  });
});
