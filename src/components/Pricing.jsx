import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { CLINIC_CONFIG } from '../config';

export default function Pricing({ onSelectTreatment }) {
  const { lang, t } = useI18n();

  return (
    <section id="pricing" className="section section-white" aria-label="Transparent Treatment Pricing">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">{t('pricing.sectionTag')}</span>
          <h2 className="section-heading">{t('pricing.heading')}</h2>
          <p className="section-subheading">{t('pricing.subheading')}</p>
        </div>

        {/* Pricing Table Card */}
        <div className="pricing-table-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>{t('pricing.treatmentCol')}</th>
                  <th>Category</th>
                  <th>{t('pricing.durationCol')}</th>
                  <th>{t('pricing.priceCol')}</th>
                  <th style={{ textAlign: 'right' }}>{t('pricing.actionCol')}</th>
                </tr>
              </thead>
              <tbody>
                {CLINIC_CONFIG.treatments.map((tr) => (
                  <tr key={tr.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {lang === 'ta' && tr.nameTamil ? tr.nameTamil : tr.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {tr.benefit}
                      </div>
                    </td>

                    <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {tr.category}
                    </td>

                    <td style={{ fontSize: '0.88rem' }}>
                      {tr.duration}
                    </td>

                    <td>
                      <span className="price-table-fee">{tr.priceLabel}</span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-book-treatment"
                        onClick={() => onSelectTreatment(tr.name, tr.defaultDoctor)}
                      >
                        Book →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 0% EMI Notice Banner */}
        <div className="emi-notice-banner">
          <span className="emi-icon" aria-hidden="true">💳</span>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
            <strong>Easy EMI &amp; Insurance Facility:</strong> {t('pricing.emiNote')}
          </div>
        </div>
      </div>
    </section>
  );
}
