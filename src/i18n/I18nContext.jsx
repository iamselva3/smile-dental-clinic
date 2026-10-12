import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './en.json';
import ta from './ta.json';

const translations = { en, ta };

const I18nContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
  dir: 'ltr'
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryLang = urlParams.get('lang');
    if (queryLang && (queryLang === 'en' || queryLang === 'ta')) {
      return queryLang;
    }
    return localStorage.getItem('sdc_language') || 'en';
  });

  const setLang = (newLang) => {
    if (translations[newLang]) {
      setLangState(newLang);
      localStorage.setItem('sdc_language', newLang);
      document.documentElement.lang = newLang;
      if (newLang === 'ta') {
        document.body.classList.add('lang-tamil');
      } else {
        document.body.classList.remove('lang-tamil');
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    if (lang === 'ta') {
      document.body.classList.add('lang-tamil');
    } else {
      document.body.classList.remove('lang-tamil');
    }
  }, [lang]);

  // Nested key resolver, e.g. t('hero.titleLine1')
  const t = (path) => {
    const keys = path.split('.');
    let current = translations[lang] || translations.en;
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to English
        let fallback = translations.en;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return path;
          }
        }
        return fallback || path;
      }
    }
    return typeof current === 'string' ? current : path;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
