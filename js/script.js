const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-navigation');

function closeMenu() {
  if (!menuButton || !navigation) return;
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation menu');
}

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.matches('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
}

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});
