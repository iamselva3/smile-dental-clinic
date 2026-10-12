import React from 'react';
import { useI18n } from '../i18n/I18nContext';

export default function HowItWorks({ onOpenBooking }) {
  const { t } = useI18n();

  return (
    <section className="section section-tinted" aria-label="How Your Dental Visit Works">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">{t('howItWorks.sectionTag')}</span>
          <h2 className="section-heading">{t('howItWorks.heading')}</h2>
          <p className="section-subheading">{t('howItWorks.subheading')}</p>
        </div>

        {/* 3 Big Steps */}
        <div className="how-steps-grid">
          {/* Step 1 */}
          <div className="step-card">
            <div className="step-num-badge">1</div>
            <h3>{t('howItWorks.step1Title')}</h3>
            <p>{t('howItWorks.step1Desc')}</p>
          </div>

          {/* Step 2 */}
          <div className="step-card">
            <div className="step-num-badge">2</div>
            <h3>{t('howItWorks.step2Title')}</h3>
            <p>{t('howItWorks.step2Desc')}</p>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div className="step-num-badge">3</div>
            <h3>{t('howItWorks.step3Title')}</h3>
            <p>{t('howItWorks.step3Desc')}</p>
          </div>
        </div>

        {/* Action button */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button
            type="button"
            className="btn-pill-primary"
            style={{ padding: '14px 32px', fontSize: '1.05rem' }}
            onClick={() => onOpenBooking()}
          >
            <span>{t('nav.bookNow')} (Under 60 Secs)</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
