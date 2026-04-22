document.addEventListener('DOMContentLoaded', () => {
  const openButton = document.getElementById('openBurgerMenu');
  const closeButton = document.getElementById('closeBurgerMenu');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');
  const openAuthDesktop = document.getElementById('openAuthModal');
  const openAuthMobile = document.getElementById('openAuthModalMobile');

  if (!openButton || !closeButton || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    openButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    openButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  openButton.addEventListener('click', openMenu);
  closeButton.addEventListener('click', closeMenu);

  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  if (openAuthMobile && openAuthDesktop) {
    openAuthMobile.addEventListener('click', () => {
      closeMenu();
      openAuthDesktop.click();
    });
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
});