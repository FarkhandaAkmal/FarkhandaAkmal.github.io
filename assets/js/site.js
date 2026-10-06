document.documentElement.classList.add("js");

const header = document.querySelector("[data-site-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const siteNavigation = document.querySelector("#site-navigation");
const backToTop = document.querySelector("[data-back-to-top]");

function setMenuOpen(isOpen) {
  if (!menuToggle || !siteNavigation) {
    return;
  }
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  siteNavigation.dataset.open = String(isOpen);
}

menuToggle?.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

siteNavigation?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement && window.matchMedia("(max-width: 900px)").matches) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

function updateScrollControls() {
  const isScrolled = window.scrollY > 12;
  header?.classList.toggle("is-scrolled", isScrolled);
  backToTop?.classList.toggle("is-visible", window.scrollY > 500);
}

window.addEventListener("scroll", updateScrollControls, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    setMenuOpen(false);
  }
});
backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
document.querySelectorAll("[data-print]").forEach((button) => {
  button.addEventListener("click", () => window.print());
});
updateScrollControls();

const yearNode = document.querySelector("[data-current-year]");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

for (const emailLink of document.querySelectorAll("[data-mail-user][data-mail-domain]")) {
  const address = `${emailLink.dataset.mailUser}@${emailLink.dataset.mailDomain}`;
  emailLink.href = `mailto:${address}`;
}
