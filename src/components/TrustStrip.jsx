import React from 'react';
import { useI18n } from '../i18n/I18nContext';

export default function TrustStrip() {
  const { t } = useI18n();

  const badges = [
    t('trustStrip.ida'),
    t('trustStrip.iso'),
    t('trustStrip.sterilization'),
    t('trustStrip.cbct'),
    t('trustStrip.painless'),
    t('trustStrip.emi')
  ];

  return (
    <section className="trust-strip-section" aria-label="Accreditations and Standards Strip">
      <div className="trust-strip-scroll">
        {/* Render doubled for continuous looping marquee */}
        {[...badges, ...badges].map((badge, idx) => (
          <div key={idx} className="trust-badge-item">
            <span className="trust-badge-dot"></span>
            <span>{badge}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
