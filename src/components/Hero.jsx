import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { CLINIC_CONFIG } from '../config';
import { getLocalDateString } from '../services/api';

export default function Hero({ onOpenBooking }) {
  const { lang, t } = useI18n();

  // Quick-Book State
  const [selectedTreatment, setSelectedTreatment] = useState(CLINIC_CONFIG.treatments[0].name);
  const [selectedDay, setSelectedDay] = useState('tomorrow');
  const [phoneInput, setPhoneInput] = useState('');

  const handleQuickBook = (e) => {
    e.preventDefault();

    // Determine target date in patient's local timezone
    const targetDate = new Date();
    if (selectedDay === 'tomorrow') {
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (selectedDay === 'thisWeek') {
      targetDate.setDate(targetDate.getDate() + 3);
    }
    const dateStr = getLocalDateString(targetDate);

    onOpenBooking({
      treatment: selectedTreatment,
      date: dateStr,
      phone: phoneInput.trim()
    });
  };

  return (
    <section id="hero" className="section hero-section" aria-label="Hero Introduction">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Headline, Reassurance & Quick-Book Card */}
          <div className="hero-content">
            <div className="hero-pill-badge">
              <span style={{ color: 'var(--accent-marigold)' }}>★</span>
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="hero-headline">
              {t('hero.titleLine1')}<br />
              <span className="word-highlight">{t('hero.titleLine2')}</span>
            </h1>

            <p className="hero-lead">
              {t('hero.subheading')}
            </p>

            {/* QUICK-BOOK CARD IN HERO */}
            <div className="quickbook-card">
              <h3 className="quickbook-title">{t('hero.quickBookTitle')}</h3>
              <p className="quickbook-sub">{t('hero.quickBookSub')}</p>

              <form onSubmit={handleQuickBook} className="quickbook-form-grid">
                {/* Field 1: Treatment */}
                <div className="qb-field">
                  <label className="qb-label">{t('hero.selectTreatment')}</label>
                  <select
                    className="qb-select"
                    value={selectedTreatment}
                    onChange={(e) => setSelectedTreatment(e.target.value)}
                  >
                    {CLINIC_CONFIG.treatments.map((tr) => (
                      <option key={tr.id} value={tr.name}>
                        {lang === 'ta' && tr.nameTamil ? tr.nameTamil : tr.name} ({tr.priceLabel})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 2: Preferred Day */}
                <div className="qb-field">
                  <label className="qb-label">{t('hero.selectDay')}</label>
                  <select
                    className="qb-select"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    <option value="today">{t('hero.today')}</option>
                    <option value="tomorrow">{t('hero.tomorrow')}</option>
                    <option value="thisWeek">{t('hero.thisWeek')}</option>
                  </select>
                </div>

                {/* Field 3: WhatsApp Mobile */}
                <div className="qb-field quickbook-field-full">
                  <label className="qb-label">{t('hero.enterPhone')}</label>
                  <input
                    type="tel"
                    placeholder="e.g. 98401 23456"
                    className="qb-input"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                  />
                </div>

                {/* Submit CTA */}
                <div className="quickbook-field-full">
                  <button type="submit" className="quickbook-btn-submit">
                    <span>{t('hero.bookVisitBtn')}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Trust Chips Below Hero */}
            <div className="hero-trust-chips">
              <div className="trust-chip">
                <span className="trust-chip-star">★★★★★</span>
                <span>{t('hero.trustTagRating')}</span>
              </div>
              <div className="trust-chip">
                <span style={{ color: 'var(--primary-teal)' }}>🛡️</span>
                <span>{t('hero.trustTagExp')}</span>
              </div>
              <div className="trust-chip">
                <span style={{ color: 'var(--accent-marigold)' }}>😊</span>
                <span>{t('hero.trustTagHappy')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Arch-Shaped Photo Frame & Floating Badge */}
          <div className="hero-photo-wrap">
            <div className="hero-arch-frame">
              <img
                src="/images/operatory_microscope.jpg"
                alt="Modern, bright and hygienic dental care suite at Smile Dental Clinic"
                className="hero-photo"
              />

              {/* Floating Reassurance Badge */}
              <div className="hero-floating-badge">
                <div className="badge-icon-wrap" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <div className="badge-text-title">{t('hero.sterilizationTitle')}</div>
                  <div className="badge-text-sub">{t('hero.sterilizationSub')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
