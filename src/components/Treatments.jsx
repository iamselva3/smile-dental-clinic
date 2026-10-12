import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { CLINIC_CONFIG } from '../config';

export default function Treatments({ onSelectTreatment }) {
  const { lang, t } = useI18n();

  return (
    <section id="treatments" className="section section-tinted" aria-label="Clinical Treatments">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">{t('treatments.sectionTag')}</span>
          <h2 className="section-heading">{t('treatments.heading')}</h2>
          <p className="section-subheading">{t('treatments.subheading')}</p>
        </div>

        {/* Scroll-Snap Carousel (Mobile) / 4-Col Grid (Desktop) */}
        <div className="treatments-carousel-wrap">
          <div className="treatments-scroll">
            {CLINIC_CONFIG.treatments.map((treatment) => {
              const displayName = lang === 'ta' && treatment.nameTamil ? treatment.nameTamil : treatment.name;

              return (
                <div key={treatment.id} className="treatment-card">
                  {/* Photo Frame */}
                  <div className="treatment-image-frame">
                    <img
                      src={treatment.image}
                      alt={displayName}
                      className="treatment-img"
                      loading="lazy"
                    />
                    <span className="treatment-cat-pill">{treatment.category}</span>
                  </div>

                  {/* Body Content */}
                  <div className="treatment-body">
                    <div>
                      <h3 className="treatment-title">{displayName}</h3>
                      <p className="treatment-benefit" style={{ marginTop: '0.4rem' }}>
                        {treatment.benefit}
                      </p>
                    </div>

                    {/* Footer: Price & Book Link */}
                    <div className="treatment-footer">
                      <div>
                        <div className="price-sub">{t('treatments.startingFrom')}</div>
                        <div className="price-val">{treatment.priceLabel}</div>
                      </div>

                      <button
                        type="button"
                        className="btn-book-treatment"
                        onClick={() => onSelectTreatment(treatment.name, treatment.defaultDoctor)}
                      >
                        {t('treatments.bookThis')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
