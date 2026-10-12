import React, { useState } from 'react';

/**
 * CaseSlider: Before / After split-view with an interactive divider
 * styled like an archival medical journal case study plate.
 */
export default function CaseSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <section id="case-study" className="journal-section case-documentation-section" aria-label="Case Documentation">
      <div className="journal-container">
        {/* Section Marker */}
        <div className="section-marker-row">
          <div className="section-num-tag">
            <span>04</span>
            <span>CASE DOCUMENTATION</span>
          </div>
          <div className="section-category">
            CLINICAL STUDY NO. 402 — ANTERIOR ARCH RECONSTRUCTION
          </div>
        </div>

        {/* Section Headline */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 className="serif-heading" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
            Case Study Plate: Before &amp; After
          </h2>
          <p style={{ maxWidth: '720px', marginTop: '0.75rem', fontSize: '1.05rem' }}>
            Interactive optical comparison plate. Drag the vertical divider horizontally to inspect pre-operative attrition against the completed biomimetic ceramic restoration.
          </p>
        </div>

        {/* Case Plate Card */}
        <div className="case-plate-card">
          <div className="case-plate-header">
            <div>
              <span className="case-number">ARCHIVE FILE #402</span>
              <h3 className="case-title" style={{ marginTop: '0.25rem' }}>
                Maxillary Anterior Biomimetic Veneer Rehabilitation
              </h3>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-400)', textAlign: 'right' }}>
              PRIMARY OPERATOR: DR. ELENA VANCE<br />
              <span className="tabular">ETHICS &amp; CONSENT AUDIT: CLEARED</span>
            </div>
          </div>

          {/* Draggable Split-View Slider */}
          <div className="case-split-container">
            {/* Base: After Image (Full width background) */}
            <img
              src="/images/case_after.jpg"
              alt="Post-operative anterior porcelain veneer restoration"
              className="case-image-before"
            />

            {/* Overlay: Before Image (Clipped by slider position) */}
            <div
              className="case-image-after-wrap"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src="/images/case_before.jpg"
                alt="Pre-operative incisal enamel attrition and micro-fractures"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  maxWidth: 'none',
                  minWidth: '100%'
                }}
              />
            </div>

            {/* Split Divider Line & Handle */}
            <div
              className="case-split-divider"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="case-split-handle" aria-hidden="true">
                <span>◀ ▶</span>
              </div>
            </div>

            {/* Range Input for Keyboard & Touch dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="case-range-input"
              aria-label="Drag before and after dental slider"
            />

            {/* Badges */}
            <div className="case-badge-pill case-badge-left">
              ANTE-OP (PRE-RESTORATIVE ATTRITION)
            </div>
            <div className="case-badge-pill case-badge-right">
              POST-OP (HAND-LAYERED CERAMIC)
            </div>
          </div>

          {/* Case Study Metadata Ledger Notes */}
          <div className="case-plate-notes">
            <div className="case-note-field">
              <label>Clinical Diagnosis</label>
              <span>Severe Incisal Enamel Attrition &amp; Micro-Fractures</span>
            </div>

            <div className="case-note-field">
              <label>Treatment Protocol</label>
              <span>6 Minimally Invasive Feldspathic Porcelain Veneers</span>
            </div>

            <div className="case-note-field">
              <label>Operative Duration</label>
              <span className="tabular">2 Clinical Sessions (Mock-Up &amp; Bonding)</span>
            </div>

            <div className="case-note-field">
              <label>Follow-Up Status</label>
              <span className="tabular">36 Months Asymptomatic, Intact Margins</span>
            </div>
          </div>

          <div className="marginal-note">
            <strong>Biological Assessment:</strong> Preserved 94% of native coronal enamel substrate. Restored incisal guidance without tooth devitalization or pulpal irritation. Gingival sulcus depth remains physiological at &lt;1.5mm.
          </div>
        </div>
      </div>
    </section>
  );
}
