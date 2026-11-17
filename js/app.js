const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
const compactLayout = window.matchMedia('(max-width: 940px)');
const siteHeader = document.querySelector('.site-header');

if (siteHeader) {
  const scrollIdleDelay = 1400;
  let scrollIdleTimer;

  function updateHeader() {
    clearTimeout(scrollIdleTimer);

    if (window.scrollY <= 12) {
      delete siteHeader.dataset.scrollState;
      return;
    }

    siteHeader.dataset.scrollState = 'scrolling';
    scrollIdleTimer = setTimeout(() => {
      siteHeader.dataset.scrollState = 'idle';
    }, scrollIdleDelay);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('pageshow', updateHeader);
  updateHeader();
}

function setMenu(open) {
  navigation.hidden = compactLayout.matches && !open;
  menu.setAttribute('aria-expanded', String(open));
}

if (menu && navigation) {
  menu.hidden = false;
  setMenu(false);
  compactLayout.addEventListener('change', () => setMenu(false));
  menu.addEventListener('click', () => setMenu(navigation.hidden));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
}

const copyStatus = document.querySelector('#copy-status');
document.querySelectorAll('[data-copy]').forEach((button) => {
  const label = button.querySelector('.copy-label');
  let resetLabel;

  button.addEventListener('click', async () => {
    clearTimeout(resetLabel);

    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.dataset.copied = '';
      label.textContent = 'Copied';
      copyStatus.textContent = 'Server address copied.';
    } catch {
      delete button.dataset.copied;
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(button.querySelector('.address'));
      selection.removeAllRanges();
      selection.addRange(range);
      label.textContent = 'Copy selected text';
      copyStatus.textContent = 'Server address selected. Copy it with your keyboard or selection menu.';
    }

    resetLabel = setTimeout(() => {
      delete button.dataset.copied;
      label.textContent = 'Copy IP';
      copyStatus.textContent = '';
    }, 3000);
  });
});

const themeToggle = document.querySelector('.theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');

if (themeToggle) {
  let savedTheme;
  try {
    savedTheme = localStorage.getItem('sylvarion-theme');
  } catch {
    // The toggle still works for this page when browser storage is unavailable.
  }

  function applyTheme(theme) {
    const light = theme === 'light';
    document.documentElement.dataset.theme = theme;
    themeToggle.setAttribute('aria-pressed', String(light));
    themeColor?.setAttribute('content', light ? '#f1f5fb' : '#10141d');
  }

  applyTheme(savedTheme === 'light' ? 'light' : 'dark');
  themeToggle.hidden = false;
  themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(theme);
    try {
      localStorage.setItem('sylvarion-theme', theme);
    } catch {
      // Keep the selected theme for the current page.
    }
  });
}
