(function () {
  const STORAGE_KEY = 'portfolio-theme';
  const root = document.documentElement;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const themeValueNodes = Array.from(document.querySelectorAll('[data-theme-value]'));
  const themeToggle = document.getElementById('themeToggle');
  const themeToggleIcon = document.getElementById('themeToggleIcon');
  const themeToggleText = document.getElementById('themeToggleText');
  const terminalThemeCommand = document.getElementById('terminalThemeCommand');

  function normalizeTheme(theme) {
    return theme === 'light' ? 'light' : 'dark';
  }

  function readStoredTheme() {
    try {
      const storedTheme = localStorage.getItem(STORAGE_KEY);
      return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : '';
    } catch (error) {
      return '';
    }
  }

  function readQueryTheme() {
    const queryTheme = new URLSearchParams(window.location.search).get('theme');
    return queryTheme === 'light' || queryTheme === 'dark' ? queryTheme : '';
  }

  function readSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  function updateThemeUi(theme) {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
      themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
    }
    if (themeToggleIcon) {
      themeToggleIcon.textContent = theme === 'dark' ? 'LM' : 'DM';
    }
    if (themeToggleText) {
      themeToggleText.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    }
    if (terminalThemeCommand) {
      terminalThemeCommand.dataset.terminalCommand = `theme ${nextTheme}`;
      terminalThemeCommand.textContent = `theme ${nextTheme}`;
    }
    themeValueNodes.forEach((node) => {
      node.textContent = theme;
    });
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'light' ? '#f4f7fb' : '#02060d');
    }
  }

  function applyTheme(theme, options) {
    const settings = Object.assign({ persist: true, source: 'ui' }, options);
    const normalizedTheme = normalizeTheme(theme);

    root.setAttribute('data-theme', normalizedTheme);
    updateThemeUi(normalizedTheme);

    if (settings.persist) {
      try {
        localStorage.setItem(STORAGE_KEY, normalizedTheme);
      } catch (error) {}
    }

    window.dispatchEvent(new CustomEvent('portfolio:theme-change', {
      detail: { theme: normalizedTheme, source: settings.source }
    }));

    return normalizedTheme;
  }

  const initialTheme = normalizeTheme(
    readQueryTheme() ||
    readStoredTheme() ||
    root.getAttribute('data-theme') ||
    readSystemTheme()
  );

  window.PortfolioTheme = {
    getTheme() {
      return normalizeTheme(root.getAttribute('data-theme') || initialTheme);
    },
    setTheme(theme, options) {
      return applyTheme(theme, options);
    },
    toggleTheme(source) {
      const nextTheme = this.getTheme() === 'dark' ? 'light' : 'dark';
      return applyTheme(nextTheme, { source: source || 'ui' });
    }
  };

  applyTheme(initialTheme, { persist: false, source: 'init' });

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      window.PortfolioTheme.toggleTheme('toggle');
    });
  }

  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const syncSystemTheme = (event) => {
      if (readStoredTheme() || readQueryTheme()) return;
      applyTheme(event.matches ? 'light' : 'dark', { persist: false, source: 'system' });
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncSystemTheme);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(syncSystemTheme);
    }
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-terminal-command]');
    if (!trigger) return;

    event.preventDefault();
    window.dispatchEvent(new CustomEvent('portfolio:terminal-run', {
      detail: { command: trigger.dataset.terminalCommand || '' }
    }));
  });
})();
