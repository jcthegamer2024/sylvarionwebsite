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

const staffProfile = document.querySelector('.staff-profile');

if (staffProfile?.showModal) {
  const profileName = staffProfile.querySelector('#staff-profile-name');
  const profileAvatar = staffProfile.querySelector('.profile-avatar');
  const profileRole = staffProfile.querySelector('.profile-role');
  const profileDetails = staffProfile.querySelector('.profile-details');
  const profileHeading = staffProfile.querySelector('.profile-heading');
  const profileBanner = staffProfile.querySelector('.profile-banner');

  profileBanner.addEventListener('error', () => { profileBanner.hidden = true; });

  document.querySelectorAll('.roster > li > template[data-staff-profile]').forEach((template) => {
    const card = template.parentElement;
    const name = card.querySelector('strong');
    const avatar = card.querySelector('.avatar');
    const role = card.querySelector('.role');
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'profile-trigger';
    trigger.setAttribute('aria-label', `View profile for ${name.textContent.trim()}`);
    trigger.setAttribute('aria-haspopup', 'dialog');
    card.append(trigger);

    trigger.addEventListener('click', () => {
      const banner = template.dataset.banner;
      profileHeading.dataset.role = role.dataset.role;
      profileBanner.hidden = !banner;
      if (banner) {
        profileBanner.src = banner;
      } else {
        profileBanner.removeAttribute('src');
      }
      profileName.replaceChildren(...name.cloneNode(true).childNodes);
      const portrait = avatar.cloneNode();
      portrait.loading = 'eager';
      profileAvatar.replaceChildren(portrait);
      profileRole.replaceChildren(role.cloneNode(true));
      profileDetails.replaceChildren(template.content.cloneNode(true));
      trigger.focus({ preventScroll: true });
      staffProfile.showModal();
    });
  });

  async function closeProfile() {
    if (!staffProfile.open || staffProfile.hasAttribute('data-closing')) return;

    staffProfile.dataset.closing = '';
    const transitions = staffProfile.getAnimations().map((animation) => animation.finished);
    await Promise.allSettled(transitions);
    staffProfile.close();
    delete staffProfile.dataset.closing;
  }

  staffProfile.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    closeProfile();
  });
  staffProfile.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeProfile();
  });
  staffProfile.addEventListener('click', (event) => {
    if (event.target === staffProfile) closeProfile();
  });
}
