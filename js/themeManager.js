/**
 * THEMEMANAGER.JS - Gerenciador de Temas Visuais
 * Sincroniza atributos no <body>, meta tags para status bar mobile e LocalStorage
 */

const THEMES = {
  nintendo: { name: 'Nintendo Retro', color: '#e60012' },
  amoled: { name: 'AMOLED Midnight', color: '#000000' },
  emerald: { name: 'Emerald Forest', color: '#064e3b' },
  sunset: { name: 'Cyber Sunset', color: '#180d2b' },
  light: { name: 'Clean Light', color: '#2563eb' }
};

class ThemeManager {
  constructor() {
    this.currentTheme = 'nintendo';
    this.storageKey = 'anagram_theme';
  }

  init() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved && THEMES[saved]) {
      this.applyTheme(saved);
    } else {
      // Detecção de preferência de sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark ? 'amoled' : 'nintendo');
    }

    // Ouvinte para mudanças de preferência do SO se o usuário não escolheu explicitamente
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.applyTheme(e.matches ? 'amoled' : 'nintendo');
      }
    });
  }

  applyTheme(themeKey) {
    if (!THEMES[themeKey]) return;
    this.currentTheme = themeKey;

    if (themeKey === 'nintendo') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', themeKey);
    }

    localStorage.setItem(this.storageKey, themeKey);

    // Sincronizar <meta name="theme-color">
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', THEMES[themeKey].color);
    }

    // Sincronizar select se existir
    const select = document.getElementById('themeSelect');
    if (select && select.value !== themeKey) {
      select.value = themeKey;
    }
  }

  getAvailableThemes() {
    return THEMES;
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}

export const themeManager = new ThemeManager();
