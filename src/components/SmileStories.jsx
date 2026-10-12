import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';

const CASES = [
  {
    id: 1,
    title: 'Anterior Ceramic Veneers & Enamel Restoration',
    treatment: 'Smile Makeover (6 Handcrafted Veneers)',
    duration: '2 Clinical Visits',
    doctor: 'Dr. Priya Sundaram',
    beforeImg: '/images/case_before.jpg',
    afterImg: '/images/case_after.jpg',
    patient: 'Smt. Jayanthi R., 42 yrs (Anna Nagar, Chennai)',
    note: '"I used to hide my smile in family photographs because of chipping and stains. Dr. Priya restored my front teeth with zero pain. My friends couldn’t believe how natural it looks!"'
  },
  {
    id: 2,
    title: 'Immediate Molar Implant & Natural Crown',
    treatment: 'Single Tooth Keyhole Implant',
    duration: 'Single 45-min Sitting',
    doctor: 'Dr. K. Rajesh',
    beforeImg: '/images/case_before.jpg',
    afterImg: '/images/case_after.jpg',
    patient: 'Mr. Venkatraman S., 54 yrs (Mogappair)',
    note: '"Lost my lower molar and couldn’t chew favorite crunchy dosas or murukku. Dr. Rajesh placed a titanium implant so gently that I didn’t even need a painkiller that evening."'
  },
  {
    id: 3,
    title: 'Clear Invisible Aligners & Teeth Brightening',
    treatment: 'Teeth Alignment & Laser Whitening',
    duration: '8 Months (Clear Trays)',
    doctor: 'Dr. Ananya Ramesh',
    beforeImg: '/images/case_before.jpg',
    afterImg: '/images/case_after.jpg',
    patient: 'Kavitha M., 26 yrs (IT Professional, OMR)',
    note: '"No ugly metal clips or ulcers! I wore the transparent trays to office every day without anyone noticing. My wedding smile was absolutely glowing."'
  }
];

export default function SmileStories({ onSelectTreatment }) {
  const { t } = useI18n();
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);

  const activeCase = CASES[activeCaseIdx];

  return (
    <section className="section section-tinted" aria-label="Smile Stories and Before After Transformations">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">{t('stories.sectionTag')}</span>
          <h2 className="section-heading">{t('stories.heading')}</h2>
          <p className="section-subheading">{t('stories.subheading')}</p>
        </div>

        {/* Case Selector Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {CASES.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              className={`slot-pill-btn ${activeCaseIdx === idx ? 'selected' : ''}`}
              onClick={() => {
                setActiveCaseIdx(idx);
                setSliderPos(50);
              }}
            >
              Case 0{c.id}: {c.treatment.split('(')[0]}
            </button>
          ))}
        </div>

        {/* Interactive Before / After Split Slider Card */}
        <div className="story-card-wrap">
          <div className="story-slider-box">
            {/* Base Image (After) */}
            <img
              src={activeCase.afterImg}
              alt="After smile transformation"
              className="story-img-base"
            />

            {/* Overlay Image (Before, clipped by slider position) */}
            <div className="story-img-overlay" style={{ width: `${sliderPos}%` }}>
              <img
                src={activeCase.beforeImg}
                alt="Before smile treatment"
                style={{
                  width: '100%',
                  minWidth: '820px'
                }}
              />
            </div>

            {/* Draggable Divider Line & Thumb */}
            <div className="story-divider-bar" style={{ left: `${sliderPos}%` }}>
              <div className="story-divider-thumb" aria-hidden="true">
                ◀▶
              </div>
            </div>

            {/* Native Range Input for Keyboard & Touch dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="story-range-input"
              aria-label="Drag before and after dental comparison"
            />

            {/* Badges */}
            <div className="story-badge-label story-badge-left">
              BEFORE TREATMENT
            </div>
            <div className="story-badge-label story-badge-right">
              AFTER (NATURAL SMILE)
            </div>
          </div>

          {/* Case Metadata & Real Patient Quote */}
          <div className="story-meta-box">
            <div className="story-tags-row">
              <span className="story-tag-chip">Procedure: {activeCase.treatment}</span>
              <span className="story-tag-chip">Duration: {activeCase.duration}</span>
              <span className="story-tag-chip">Doctor: {activeCase.doctor}</span>
            </div>

            <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
              {activeCase.note}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-teal)' }}>
                — {activeCase.patient}
              </span>

              <button
                type="button"
                className="btn-book-treatment"
                onClick={() => onSelectTreatment(activeCase.treatment.split('(')[0].trim(), activeCase.doctor)}
              >
                Inquire About Similar Treatment →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
