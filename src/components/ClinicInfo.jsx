import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { CLINIC_CONFIG } from '../config';

export default function ClinicInfo({ onOpenBooking }) {
  const { lang, t } = useI18n();
  const whatsappUrl = `https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello Smile Dental Clinic, I would like to visit your Anna Nagar clinic.')}`;

  return (
    <>
      <section id="contact" className="section section-white" aria-label="Clinic Information and Location">
        <div className="container">
          {/* Section Header */}
          <div className="section-header">
            <span className="section-tag">{t('clinicInfo.sectionTag')}</span>
            <h2 className="section-heading">{t('clinicInfo.heading')}</h2>
            <p className="section-subheading">{t('clinicInfo.subheading')}</p>
          </div>

          <div className="clinic-info-grid">
            {/* Left: Address, Operating Timings, Emergency Info */}
            <div className="clinic-info-card">
              {/* Address Item */}
              <div className="info-item-row">
                <div className="info-icon-badge" aria-hidden="true">📍</div>
                <div className="info-details">
                  <h4>{t('clinicInfo.addressTitle')}</h4>
                  <p>
                    {CLINIC_CONFIG.address.line1}, {CLINIC_CONFIG.address.line2},<br />
                    {CLINIC_CONFIG.address.city}, {CLINIC_CONFIG.address.state} - {CLINIC_CONFIG.address.pincode}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--primary-teal)', fontWeight: 600, marginTop: '4px' }}>
                    🚇 {CLINIC_CONFIG.address.landmark}
                  </p>
                </div>
              </div>

              {/* Timings Item */}
              <div className="info-item-row">
                <div className="info-icon-badge" aria-hidden="true">⏰</div>
                <div className="info-details">
                  <h4>{t('clinicInfo.hoursTitle')}</h4>
                  <p>{CLINIC_CONFIG.timings.weekdays}</p>
                  <p>{CLINIC_CONFIG.timings.sunday}</p>
                </div>
              </div>

              {/* Emergency Item */}
              <div className="info-item-row">
                <div className="info-icon-badge" aria-hidden="true">📞</div>
                <div className="info-details">
                  <h4>{t('clinicInfo.callTitle')}</h4>
                  <p style={{ fontWeight: 700, color: 'var(--primary-teal)' }}>
                    {CLINIC_CONFIG.phone}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent-marigold-hover)', fontWeight: 600 }}>
                    Emergency Helpline: {CLINIC_CONFIG.emergencyPhone}
                  </p>
                </div>
              </div>

              {/* Big Action Buttons Row */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <a
                  href={`tel:${CLINIC_CONFIG.phoneTel}`}
                  className="btn-pill-teal"
                  style={{ flex: 1, minWidth: '140px', textAlign: 'center' }}
                >
                  {t('clinicInfo.callNow')}
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill-primary"
                  style={{ flex: 1, minWidth: '160px', textAlign: 'center', backgroundColor: '#25D366', color: '#FFFFFF' }}
                >
                  {t('clinicInfo.whatsappChat')}
                </a>

                <button
                  type="button"
                  className="btn-pill-primary"
                  style={{ width: '100%', textAlign: 'center' }}
                  onClick={() => onOpenBooking()}
                >
                  {t('clinicInfo.bookVisit')} →
                </button>
              </div>
            </div>

            {/* Right: Map Card & Directions */}
            <div className="map-plate-box">
              <div className="map-plate-content">
                <div style={{ fontSize: '2.5rem' }}>🗺️</div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--primary-teal)' }}>
                  {CLINIC_CONFIG.name} — Anna Nagar
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
                  Easily accessible by car, bus, or Chennai Metro. Dedicated ground-floor patient valet parking.
                </p>
                <a
                  href={CLINIC_CONFIG.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill-teal"
                  style={{ marginTop: '0.5rem', fontSize: '0.88rem', padding: '10px 20px' }}
                >
                  {t('clinicInfo.getDirections')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple, Friendly Clean Footer */}
      <footer className="site-footer" aria-label="Site Footer">
        <div className="container footer-inner">
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-teal)' }}>
              {lang === 'ta' ? CLINIC_CONFIG.nameTamil : CLINIC_CONFIG.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Family Dental &amp; Implant Centre • {CLINIC_CONFIG.locationName}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.88rem' }}>
            <a href="#treatments">Treatments</a>
            <a href="#doctors">Doctors</a>
            <a href="#pricing">Pricing</a>
            <a href="#reviews">Reviews</a>
            <a href="#faq">FAQ</a>
            <a href="/admin" style={{ color: 'var(--primary-teal)', fontWeight: 600 }}>Staff Desk 🔒</a>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
            © {new Date().getFullYear()} Smile Dental Clinic. All Rights Reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
