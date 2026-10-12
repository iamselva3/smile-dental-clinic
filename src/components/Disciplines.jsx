import React, { useState } from 'react';

const DISCIPLINES_DATA = [
  {
    index: '01',
    title: 'Dental Implants & Bone Grafting',
    leadDoctor: 'Dr. Aris Thorne',
    degrees: 'BDS, MDS (Implantology)',
    narrative: 'Precision surgical osteotomy with 3D computer-guided surgical stents. Immediate post-extraction loading, sinus floor augmentation, and autogenous bone grafting using titanium Grade V biocompatible fixtures.',
    image: '/images/ceramic_crown_macro.jpg',
    specs: [
      { key: 'Surgical Guidance', val: 'CBCT 75µm Sub-Millimeter Splints' },
      { key: 'Fixture Systems', val: 'Straumann Roxolid & Nobel Biocare Active' },
      { key: 'Biology Factor', val: 'Autologous PRF / L-PRF Centrifugation' },
      { key: 'Clinical Warranty', val: '10-Year Documented Structural Warranty' }
    ]
  },
  {
    index: '02',
    title: 'Microscopic Root Canal Therapy',
    leadDoctor: 'Dr. Elena Vance',
    degrees: 'BDS, MDS (Endodontics)',
    narrative: 'Endodontic microsurgery conducted strictly under surgical operating microscopes with 20x to 25x magnification. Complete canal anatomy debridement, ultrasonically activated irrigation, and warm vertical bioceramic obturation.',
    image: '/images/operatory_microscope.jpg',
    specs: [
      { key: 'Optical Magnification', val: 'Zeiss Extaro 300 Optical Head (25x)' },
      { key: 'Irrigation Protocol', val: 'Multisonic GentleWave & EndoVac Apical Flush' },
      { key: 'Obturation Medium', val: 'Hydrophilic Bio-Ceramic Sealer' },
      { key: 'Diagnostic Depth', val: 'Periapical Digital Sensor (<15µm)' }
    ]
  },
  {
    index: '03',
    title: 'Digital Smile Design & Ceramic Veneers',
    leadDoctor: 'Dr. Elena Vance',
    degrees: 'BDS, MDS (Aesthetic Restorative)',
    narrative: 'Biomimetic porcelain laminates and monolithic zirconia restorations. Planned through facial kinematic analysis, digital intraoral stereolithography, and direct intraoral composite mock-up trial phases.',
    image: '/images/case_after.jpg',
    specs: [
      { key: 'Restorative Medium', val: 'Hand-Layered Feldspathic & Lithium Disilicate' },
      { key: 'Impression Technique', val: '3Shape TRIOS 5 Wireless Optical Scan' },
      { key: 'Margin Precision', val: '<20µm High-Tolerance Chamfer Finish' },
      { key: 'Shade Calibration', val: 'Cross-Polarized 5500K Clinical Photography' }
    ]
  },
  {
    index: '04',
    title: 'Pediatric & Preventive Dentistry',
    leadDoctor: 'Dr. Aris Thorne & Clinical Hygiene Team',
    degrees: 'Specialist Pedodontics Team',
    narrative: 'Conservative interceptive pedodontics, pit-and-fissure sealant therapies, guided eruption monitoring, and minimally invasive remineralization protocols designed to foster lifelong positive dental comfort.',
    image: '/images/autoclave_station.jpg',
    specs: [
      { key: 'Aseptic Standard', val: 'Class-B Fractionated Vacuum Autoclave' },
      { key: 'Remineralization', val: 'Casein Phosphopeptide-Amorphous Calcium (CPP-ACP)' },
      { key: 'Comfort Protocol', val: 'Pre-Warmed Topical Anesthesia & Inhalation Sedation' },
      { key: 'Imaging Dose', val: 'Ultra-Low Dose Pediatric Radiography Filters' }
    ]
  }
];

export default function Disciplines({ onSelectProcedure }) {
  const [activeDiscipline, setActiveDiscipline] = useState(0);

  return (
    <section id="disciplines" className="journal-section" aria-label="Clinical Disciplines">
      <div className="journal-container">
        {/* Section Marker */}
        <div className="section-marker-row">
          <div className="section-num-tag">
            <span>02</span>
            <span>CLINICAL DISCIPLINES</span>
          </div>
          <div className="section-category">
            TABLE OF CONTENTS — SPECIALIST DIVISIONS
          </div>
        </div>

        {/* Section Headline */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 className="serif-heading" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
            Disciplines of Practice
          </h2>
          <p style={{ maxWidth: '720px', marginTop: '0.75rem', fontSize: '1.05rem' }}>
            We do not operate as a generalized polyclinic. Each division is led by credentialed specialists adhering to published clinical monographs and high-magnification standards.
          </p>
        </div>

        {/* Table of Contents Indexed List */}
        <div className="disciplines-toc">
          {DISCIPLINES_DATA.map((item, idx) => {
            const isOpen = activeDiscipline === idx;

            return (
              <div
                key={item.index}
                className="discipline-row-item"
                onClick={() => setActiveDiscipline(isOpen ? -1 : idx)}
              >
                <div className="discipline-grid">
                  <div className="discipline-index">{item.index}</div>

                  <div className="discipline-title-group">
                    <h3>{item.title}</h3>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--clinical-red)', marginTop: '0.35rem' }}>
                      {item.leadDoctor} — {item.degrees}
                    </div>
                  </div>

                  <div className="discipline-narrative">
                    {item.narrative}
                  </div>

                  <div className="discipline-meta">
                    <div className="discipline-meta-item">
                      <span>Protocol:</span> <strong>Monograph §0{idx + 1}</strong>
                    </div>
                    <div className="discipline-meta-item">
                      <span>Status:</span> <strong>Active Operatory</strong>
                    </div>
                    <div style={{ color: 'var(--surgical-blue)', marginTop: '0.25rem', fontWeight: 600 }}>
                      {isOpen ? 'Close Specification ↗' : 'Inspect Specification ↘'}
                    </div>
                  </div>
                </div>

                {/* Expanded Documentary Plate Drawer */}
                {isOpen && (
                  <div className="discipline-plate-drawer" onClick={(e) => e.stopPropagation()}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="discipline-plate-img"
                    />

                    <div className="discipline-plate-specs">
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--clinical-red)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        TECHNICAL SPECIFICATIONS &amp; PROTOCOL OVERVIEW
                      </div>

                      <table className="discipline-specs-table">
                        <tbody>
                          {item.specs.map((spec) => (
                            <tr key={spec.key}>
                              <td>{spec.key}</td>
                              <td>{spec.val}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="inspector-cta-button"
                          style={{ margin: 0 }}
                          onClick={() => onSelectProcedure(item.title, item.leadDoctor)}
                        >
                          <span>Schedule {item.title} Consultation</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
