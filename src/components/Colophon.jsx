import React from 'react';

/**
 * Colophon: The final page of the Clinical Journal.
 * Replaces generic footers with a hand-typeset monograph colophon:
 * - Address in a ruled table
 * - Clinical operating timetable grid
 * - Emergency acute trauma line in large monospaced type
 * - Architectural site plate
 * - One-line editorial sign-off
 */
export default function Colophon({ onOpenBooking }) {
  return (
    <footer id="colophon" className="journal-section colophon-section" aria-label="Clinical Colophon">
      <div className="journal-container">
        {/* Section Marker */}
        <div className="section-marker-row">
          <div className="section-num-tag">
            <span>07</span>
            <span>COLOPHON &amp; FACILITY REGISTRY</span>
          </div>
          <div className="section-category">
            CLOSING FOLIO — SMILE DENTAL CLINIC
          </div>
        </div>

        {/* 3-Column Editorial Colophon Grid */}
        <div className="colophon-grid">
          {/* Column 1: Facility & Legal Address Ruled Table */}
          <div>
            <h3 className="serif-heading" style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              Facility Coordinates
            </h3>
            <table className="colophon-table">
              <tbody>
                <tr>
                  <td>INSTITUTION</td>
                  <td>Smile Dental Clinic Ltd.</td>
                </tr>
                <tr>
                  <td>PAVILION</td>
                  <td>Suite 401, Medical Arts Pavilion</td>
                </tr>
                <tr>
                  <td>STREET</td>
                  <td>128 Harley Boulevard, Healthcare Quarter</td>
                </tr>
                <tr>
                  <td>POSTAL CODE</td>
                  <td className="tabular">W1G 7JE / METRO CENTRAL</td>
                </tr>
                <tr>
                  <td>TELEPHONE</td>
                  <td className="tabular">+1 (415) 555-4120</td>
                </tr>
                <tr>
                  <td>CONCIERGE</td>
                  <td>concierge@smiledentalclinic.com</td>
                </tr>
                <tr>
                  <td>COUNCIL REG.</td>
                  <td className="tabular">GDC / State Dental Registry #SDC-0024</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Column 2: Hours Timetable Grid */}
          <div>
            <h3 className="serif-heading" style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              Timetable of Operative Care
            </h3>
            <table className="colophon-table">
              <tbody>
                <tr>
                  <td>MON — THU</td>
                  <td className="tabular">08:30 — 19:30 (Surgical &amp; Microscopic)</td>
                </tr>
                <tr>
                  <td>FRIDAY</td>
                  <td className="tabular">08:30 — 18:00 (Restorative &amp; Prosthetic)</td>
                </tr>
                <tr>
                  <td>SATURDAY</td>
                  <td className="tabular">09:00 — 16:30 (Hygiene &amp; Diagnostics)</td>
                </tr>
                <tr>
                  <td>SUNDAY</td>
                  <td>Emergency Trauma On-Call Only</td>
                </tr>
                <tr>
                  <td>STERILIZATION</td>
                  <td>Class-B Decontamination Cycle 19:30 — 21:00 Daily</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="ticker-slot-ticket"
                onClick={onOpenBooking}
                style={{ padding: '0.6rem 1rem', fontSize: '0.78rem' }}
              >
                <span>Direct Access:</span>
                <strong>Book via Appointment Drawer</strong>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Column 3: Emergency Acute Trauma Box & Map Plate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="colophon-emergency-box">
              <div className="colophon-emergency-label">
                ACUTE TRAUMA &amp; DENTAL EMERGENCY
              </div>
              <div className="colophon-emergency-num">
                +1 (800) 412-DENT
              </div>
              <p className="colophon-emergency-sub">
                24-Hour on-call trauma surgeon for tooth avulsion, acute swelling, and maxillofacial fractures.
              </p>
            </div>

            {/* Architectural Site Plate Placeholder */}
            <div
              style={{
                border: '1px solid var(--hairline-dark)',
                backgroundColor: 'var(--paper-cream)',
                padding: '1.25rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--muted-600)'
              }}
            >
              <div style={{ textTransform: 'uppercase', color: 'var(--slate-900)', fontWeight: 600, marginBottom: '0.35rem' }}>
                Plate IV: Site Blueprint
              </div>
              <div>Medical Arts Pavilion, 4th Floor Operatory Suites A–D. Private surgical valet parking available at rear entrance via Harley Mews.</div>
            </div>
          </div>
        </div>

        {/* Closing Folio & Editorial Sign-off */}
        <div className="colophon-signoff-bar">
          <div className="colophon-signoff-quote">
            "Smile Dental Clinic Monograph — Published in service of oral biology, restorative longevity, and aesthetic truth."
          </div>
          <div>
            <span>VOL. XXIV</span> · <span className="tabular">EST. 2002</span> · <span>ALL ARCHIVES RESERVED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
