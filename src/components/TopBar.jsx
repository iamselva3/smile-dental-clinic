import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { CLINIC_CONFIG } from '../config';

export default function TopBar({ onOpenBooking }) {
  const { lang, setLang, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="topbar" aria-label="Main Navigation">
        <div className="container topbar-inner">
          {/* Brand Logo & Clinic Name (Neat & Clean - Logo + Name Only) */}
          <a
            href="#"
            className="brand-logo"
            onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}
            title="Smile Dental Clinic — Home"
          >
            <div className="brand-mark" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                <path d="M8 13s1.5 2.5 4 2.5 4-2.5 4-2.5" />
                <circle cx="9" cy="9" r="1" fill="currentColor" />
                <circle cx="15" cy="9" r="1" fill="currentColor" />
              </svg>
            </div>
            <span className="brand-name">
              Smile Dental Clinic
            </span>
          </a>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            <li><button type="button" className="nav-link" onClick={() => scrollTo('treatments')}>{t('nav.treatments')}</button></li>
            <li><button type="button" className="nav-link" onClick={() => scrollTo('doctors')}>{t('nav.doctors')}</button></li>
            <li><button type="button" className="nav-link" onClick={() => scrollTo('pricing')}>{t('nav.pricing')}</button></li>
            <li><button type="button" className="nav-link" onClick={() => scrollTo('reviews')}>{t('nav.reviews')}</button></li>
            <li><button type="button" className="nav-link" onClick={() => scrollTo('faq')}>{t('nav.faq')}</button></li>
            <li><button type="button" className="nav-link" onClick={() => scrollTo('contact')}>{t('nav.contact')}</button></li>
          </ul>

          {/* TopBar Actions (Language Toggle, Call Icon, Book Pill, Hamburger) */}
          <div className="topbar-actions">
            {/* Language Switcher Toggle */}
            <div className="lang-toggle" role="group" aria-label="Language selection">
              <button
                type="button"
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                className={`lang-btn ${lang === 'ta' ? 'active' : ''}`}
                onClick={() => setLang('ta')}
                title="தமிழுக்கு மாறவும்"
              >
                தமிழ்
              </button>
            </div>

            {/* Click to Call Icon */}
            <a
              href={`tel:${CLINIC_CONFIG.phoneTel}`}
              className="btn-call-icon"
              title={`Call clinic directly: ${CLINIC_CONFIG.phone}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </a>

            {/* Book Now Pill CTA */}
            <button
              type="button"
              className="btn-pill-primary"
              onClick={() => onOpenBooking()}
            >
              <span>{t('nav.bookNow')}</span>
              <span>→</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <ul className="mobile-menu-links">
            <li><button type="button" className="mobile-menu-link" onClick={() => scrollTo('treatments')}><span>{t('nav.treatments')}</span> <span>→</span></button></li>
            <li><button type="button" className="mobile-menu-link" onClick={() => scrollTo('doctors')}><span>{t('nav.doctors')}</span> <span>→</span></button></li>
            <li><button type="button" className="mobile-menu-link" onClick={() => scrollTo('pricing')}><span>{t('nav.pricing')}</span> <span>→</span></button></li>
            <li><button type="button" className="mobile-menu-link" onClick={() => scrollTo('reviews')}><span>{t('nav.reviews')}</span> <span>→</span></button></li>
            <li><button type="button" className="mobile-menu-link" onClick={() => scrollTo('faq')}><span>{t('nav.faq')}</span> <span>→</span></button></li>
            <li><button type="button" className="mobile-menu-link" onClick={() => scrollTo('contact')}><span>{t('nav.contact')}</span> <span>→</span></button></li>
            <li><a href="/admin" className="mobile-menu-link" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}><span>{t('nav.admin')}</span> <span>🔒</span></a></li>
          </ul>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a
              href={`tel:${CLINIC_CONFIG.phoneTel}`}
              className="btn-pill-teal"
              style={{ width: '100%', textAlign: 'center' }}
            >
              Call {CLINIC_CONFIG.phone}
            </a>
            <button
              type="button"
              className="btn-pill-primary"
              style={{ width: '100%' }}
              onClick={() => { setMobileMenuOpen(false); onOpenBooking(); }}
            >
              {t('nav.bookNow')} →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
