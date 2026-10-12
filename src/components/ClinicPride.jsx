import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { CLINIC_CONFIG } from '../config';

export default function ClinicPride({ onSelectDoctor }) {
  const { t } = useI18n();

  return (
    <section id="doctors" className="section section-white" aria-label="Pride of the Clinic and Doctors">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">{t('pride.sectionTag')}</span>
          <h2 className="section-heading">{t('pride.heading')}</h2>
          <p className="section-subheading">{t('pride.subheading')}</p>
        </div>

        {/* 1. Animated / Big Counters Strip */}
        <div className="pride-counters-strip">
          <div className="counter-tile">
            <span className="counter-num">{CLINIC_CONFIG.stats.implantsPlaced}</span>
            <span className="counter-label">Implants Placed</span>
            <span className="counter-sub">99.4% 10-year success rate</span>
          </div>

          <div className="counter-tile">
            <span className="counter-num">{CLINIC_CONFIG.stats.patientsTreated}</span>
            <span className="counter-label">Happy Patients</span>
            <span className="counter-sub">Across South India &amp; overseas</span>
          </div>

          <div className="counter-tile">
            <span className="counter-num">{CLINIC_CONFIG.stats.yearsExperience}</span>
            <span className="counter-label">Years of Care</span>
            <span className="counter-sub">Trusted family practice since 2004</span>
          </div>

          <div className="counter-tile">
            <span className="counter-num">{CLINIC_CONFIG.stats.googleRating}★</span>
            <span className="counter-label">5-Star Google Rating</span>
            <span className="counter-sub">Based on {CLINIC_CONFIG.stats.reviewCount} real reviews</span>
          </div>
        </div>

        {/* Subtle Kolam Divider */}
        <div className="kolam-divider" aria-hidden="true">
          <div className="kolam-line"></div>
          <div className="kolam-dots">
            <div className="kolam-dot"></div>
            <div className="kolam-dot"></div>
            <div className="kolam-dot"></div>
          </div>
          <div className="kolam-line"></div>
        </div>

        {/* 2. Meet Our Doctors */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h3 className="section-heading" style={{ fontSize: '2.2rem' }}>
            {t('pride.doctorsHeading')}
          </h3>
          <p className="section-subheading" style={{ maxWidth: '620px', margin: '0 auto' }}>
            {t('pride.doctorsSub')}
          </p>
        </div>

        <div className="doctors-grid">
          {CLINIC_CONFIG.doctors.map((doctor) => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-photo-wrap">
                <img
                  src={doctor.photo}
                  alt={doctor.name}
                  className="doctor-photo"
                  loading="lazy"
                />
              </div>

              <div className="doctor-info">
                <div>
                  <h4 className="doctor-name">{doctor.name}</h4>
                  <div className="doctor-role">{doctor.role}</div>
                  <div className="doctor-degrees">{doctor.degrees} • {doctor.experience}</div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    {doctor.bio}
                  </p>
                </div>

                <div>
                  <div className="doctor-langs-badge">
                    <span>🗣️ Speaks:</span>
                    <strong>{doctor.languages.join(', ')}</strong>
                  </div>

                  <button
                    type="button"
                    className="btn-book-doctor"
                    onClick={() => onSelectDoctor(doctor.name)}
                  >
                    {t('pride.bookWithDoc')} {doctor.name.split(' ')[0]} {doctor.name.split(' ')[1]} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subtle Kolam Divider */}
        <div className="kolam-divider" aria-hidden="true">
          <div className="kolam-line"></div>
          <div className="kolam-dots">
            <div className="kolam-dot"></div>
            <div className="kolam-dot"></div>
            <div className="kolam-dot"></div>
          </div>
          <div className="kolam-line"></div>
        </div>

        {/* 3. Why Families Choose Us (6 Points) */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h3 className="section-heading" style={{ fontSize: '2.2rem' }}>
            {t('pride.whyHeading')}
          </h3>
        </div>

        <div className="why-reasons-grid">
          <div className="why-reason-card">
            <div className="why-icon-box" aria-hidden="true">✨</div>
            <div className="why-content">
              <h4>{t('pride.reasons.painless.title')}</h4>
              <p>{t('pride.reasons.painless.desc')}</p>
            </div>
          </div>

          <div className="why-reason-card">
            <div className="why-icon-box" aria-hidden="true">📋</div>
            <div className="why-content">
              <h4>{t('pride.reasons.transparent.title')}</h4>
              <p>{t('pride.reasons.transparent.desc')}</p>
            </div>
          </div>

          <div className="why-reason-card">
            <div className="why-icon-box" aria-hidden="true">🛡️</div>
            <div className="why-content">
              <h4>{t('pride.reasons.sterile.title')}</h4>
              <p>{t('pride.reasons.sterile.desc')}</p>
            </div>
          </div>

          <div className="why-reason-card">
            <div className="why-icon-box" aria-hidden="true">💳</div>
            <div className="why-content">
              <h4>{t('pride.reasons.emi.title')}</h4>
              <p>{t('pride.reasons.emi.desc')}</p>
            </div>
          </div>

          <div className="why-reason-card">
            <div className="why-icon-box" aria-hidden="true">🤝</div>
            <div className="why-content">
              <h4>{t('pride.reasons.followup.title')}</h4>
              <p>{t('pride.reasons.followup.desc')}</p>
            </div>
          </div>

          <div className="why-reason-card">
            <div className="why-icon-box" aria-hidden="true">⚡</div>
            <div className="why-content">
              <h4>{t('pride.reasons.emergency.title')}</h4>
              <p>{t('pride.reasons.emergency.desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
