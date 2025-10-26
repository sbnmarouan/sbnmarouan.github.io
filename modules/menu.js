// Menu mobile + fermeture auto au clic sur un lien
const btn  = document.querySelector(".menu-button") || document.querySelector(".nav__toggle");
const menu = document.querySelector("#site-nav")    || document.querySelector("#nav-menu");

if (btn && menu) {
  const toggle = () => {
    const open = menu.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  };
  btn.addEventListener("click", toggle);

  // Ferme le menu quand on clique un lien
  menu.querySelectorAll("a[href]").forEach(a =>
    a.addEventListener("click", () => {
      menu.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    })
  );
}
