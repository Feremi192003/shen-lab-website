const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-navigation');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      navigation.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
}

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});