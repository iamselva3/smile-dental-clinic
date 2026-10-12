import React from 'react';

/**
 * Frontispiece: Hero section designed as "The Clinical Frontispiece".
 * - Huge typographic composition "Smile Dental Clinic" (-0.025em tracking).
 * - Monospaced descriptor line: "Implantology / Endodontics / Restorative".
 * - Tall documentary photographic plate (Ceramic crown macro) with anatomical annotation lines.
 * - Marginal notes in the side margin.
 * - Ruled line appointment ticket CTA opening the booking drawer.
 */
export default function Frontispiece({ onOpenBooking }) {
  return (
    <section id="frontispiece" className="journal-section frontispiece" aria-label="Frontispiece">
      <div className="journal-container">
        {/* Section Marker */}
        <div className="section-marker-row">
          <div className="section-num-tag">
            <span>01</span>
            <span>FRONTISPIECE</span>
          </div>
          <div className="section-category">
            MONOGRAPH VOL. XXIV — ARCHIVES OF CLINICAL RESTORATION
          </div>
        </div>

        {/* Masthead Composition */}
        <div className="frontispiece-masthead">
          <h1 className="clinic-monograph-title">
            Smile Dental <em>Clinic</em>
          </h1>
          <div className="monograph-descriptor">
            Specialist Dental &amp; Implant Centre<br />
            <span>Implantology / Endodontics / Restorative</span>
          </div>
        </div>

        {/* Asymmetric 12-Column Grid: Plate & Clinical Essay */}
        <div className="frontispiece-plate-grid">
          {/* Left Column: Documentary Plate with Anatomical Annotations */}
          <div className="plate-figure-wrapper">
            <div className="plate-image-container">
              <img
                src="/images/ceramic_crown_macro.jpg"
                alt="Documentary macro photograph of a precision handcrafted zirconia crown on titanium abutment"
                className="plate-image"
              />

              {/* Anatomical Plate Annotation Callout 1 */}
              <div className="plate-callout callout-pos-1">
                <div className="callout-dot"></div>
                <div className="callout-line"></div>
                <div className="callout-badge">Fig. 1A: Translucent Zirconia Marginal Seal (&lt;18µm)</div>
              </div>

              {/* Anatomical Plate Annotation Callout 2 */}
              <div className="plate-callout callout-pos-2">
                <div className="callout-dot"></div>
                <div className="callout-line"></div>
                <div className="callout-badge">Plate 1B: Grade V Titanium Implant Collar</div>
              </div>
            </div>

            <div className="plate-caption">
              <div>
                <strong>Plate I:</strong> Precision-milled ceramic crown on osteointegrated fixture.
              </div>
              <div className="tabular">MAG: 40× MACRO OPTICS</div>
            </div>

            <div className="marginal-note">
              <strong>Observation Note:</strong> Biological width preservation and sub-crestal prosthetic connection verified under Zeiss surgical optics. Zero micro-leakage documented at 36-month review.
            </div>
          </div>

          {/* Right Column: Editorial Thesis & Ruled Appointment Ticket */}
          <div className="frontispiece-essay">
            <div className="frontispiece-lead">
              We treat oral restoration not as cosmetic embellishment, but as high-tolerance clinical engineering.
            </div>

            <p className="frontispiece-body">
              Every crown, bone augmentation, and endodontic obturation completed at Smile Dental Clinic follows strict biomimetic principles. Our surgical theatre operates with 3D CBCT computer-guided planning, Class-B sterilization protocols, and surgical microscopic magnification up to 25x.
            </p>

            <div className="marginal-note">
              <strong>Clinical Standard §4.2:</strong> We do not offer hurried, volume-driven procedures. Each operative chair is dedicated to a single patient session, ensuring non-compromised surgical asepsis and meticulous restorative seating.
            </div>

            {/* Ruled Line Appointment Ticket CTA */}
            <div
              className="ruled-appointment-ticket"
              onClick={() => onOpenBooking()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenBooking();
                }
              }}
              aria-label="Reserve appointment slot"
            >
              <div className="ticket-header">
                <span className="ticket-header-label">
                  <span className="status-dot"></span> Priority Operatory Slot
                </span>
                <span className="ticket-header-code">ENTRY TICKET / SDC-OPERATORY</span>
              </div>

              <div className="ticket-slot-main">
                <span>Next Available: Thu 15 Oct, 10:30 AM</span>
                <span className="ticket-action-arrow">→</span>
              </div>

              <div className="ticket-subtext">
                <span>Direct Access to Specialist Surgery</span>
                <span className="tabular">Immediate Drawer Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
