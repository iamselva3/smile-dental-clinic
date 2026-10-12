import React, { useState } from 'react';

// FDI Tooth Chart Data Model
const TEETH_DATA = [
  // Upper Right (Quadrant 1: 18 to 11)
  { num: 18, name: 'Maxillary Right 3rd Molar', zone: 'Molar', treatment: 'Surgical Extraction / Assessment', doctor: 'Dr. Aris Thorne', note: 'Impacted or wisdom assessment with 3D CBCT tomogram.' },
  { num: 17, name: 'Maxillary Right 2nd Molar', zone: 'Molar', treatment: 'Dental Implants & Bone Grafting', doctor: 'Dr. Aris Thorne', note: 'Heavy masticatory load zone. Titanium grade V osteointegrated fixture.' },
  { num: 16, name: 'Maxillary Right 1st Molar', zone: 'Molar', treatment: 'Microscopic Root Canal Therapy', doctor: 'Dr. Elena Vance', note: 'Complex MB2 canal identification under 20x Zeiss magnification.' },
  { num: 15, name: 'Maxillary Right 2nd Premolar', zone: 'Premolar', treatment: 'Digital Smile Design & Ceramic Veneers', doctor: 'Dr. Elena Vance', note: 'Biomimetic ceramic onlay / conservative margin preservation.' },
  { num: 14, name: 'Maxillary Right 1st Premolar', zone: 'Premolar', treatment: 'Microscopic Root Canal Therapy', doctor: 'Dr. Elena Vance', note: 'Dual canal disinfection with ultrasonic irrigation.' },
  { num: 13, name: 'Maxillary Right Canine', zone: 'Canine', treatment: 'Digital Smile Design & Ceramic Veneers', doctor: 'Dr. Elena Vance', note: 'Canine guidance preservation and aesthetic contouring.' },
  { num: 12, name: 'Maxillary Right Lateral Incisor', zone: 'Incisor', treatment: 'Digital Smile Design & Ceramic Veneers', doctor: 'Dr. Elena Vance', note: 'Micro-layered feldspathic porcelain veneer for natural optical depth.' },
  { num: 11, name: 'Maxillary Right Central Incisor', zone: 'Incisor', treatment: 'Digital Smile Design & Ceramic Veneers', doctor: 'Dr. Elena Vance', note: 'Dominant aesthetic zone. Micro-texture replication and incisal translucency.' },

  // Upper Left (Quadrant 2: 21 to 28)
  { num: 21, name: 'Maxillary Left Central Incisor', zone: 'Incisor', treatment: 'Digital Smile Design & Ceramic Veneers', doctor: 'Dr. Elena Vance', note: 'Dominant aesthetic zone. High-resolution shade matching under 5500K lighting.' },
  { num: 22, name: 'Maxillary Left Lateral Incisor', zone: 'Incisor', treatment: 'Digital Smile Design & Ceramic Veneers', doctor: 'Dr. Elena Vance', note: 'Anterior ceramic veneer restoration, minimal preparation.' },
  { num: 23, name: 'Maxillary Left Canine', zone: 'Canine', treatment: 'Digital Smile Design & Ceramic Veneers', doctor: 'Dr. Elena Vance', note: 'Canine pillar reconstruction for neuromuscular balance.' },
  { num: 24, name: 'Maxillary Left 1st Premolar', zone: 'Premolar', treatment: 'Microscopic Root Canal Therapy', doctor: 'Dr. Elena Vance', note: 'Conservative endodontic access preserving pericervical dentin.' },
  { num: 25, name: 'Maxillary Left 2nd Premolar', zone: 'Premolar', treatment: 'Dental Implants & Bone Grafting', doctor: 'Dr. Aris Thorne', note: 'Computer-guided immediate implant placement.' },
  { num: 26, name: 'Maxillary Left 1st Molar', zone: 'Molar', treatment: 'Microscopic Root Canal Therapy', doctor: 'Dr. Elena Vance', note: 'Sub-millimeter apex locator and continuous wave warm vertical condensation.' },
  { num: 27, name: 'Maxillary Left 2nd Molar', zone: 'Molar', treatment: 'Dental Implants & Bone Grafting', doctor: 'Dr. Aris Thorne', note: 'Sinus floor elevation and immediate implant loading.' },
  { num: 28, name: 'Maxillary Left 3rd Molar', zone: 'Molar', treatment: 'Surgical Extraction / Assessment', doctor: 'Dr. Aris Thorne', note: 'Wisdom tooth diagnostic plate evaluation.' },

  // Lower Left (Quadrant 3: 38 to 31)
  { num: 38, name: 'Mandibular Left 3rd Molar', zone: 'Molar', treatment: 'Surgical Extraction / Assessment', doctor: 'Dr. Aris Thorne', note: 'Evaluation of inferior alveolar nerve proximity on CBCT.' },
  { num: 37, name: 'Mandibular Left 2nd Molar', zone: 'Molar', treatment: 'Dental Implants & Bone Grafting', doctor: 'Dr. Aris Thorne', note: 'High bone density cortical anchorage implant.' },
  { num: 36, name: 'Mandibular Left 1st Molar', zone: 'Molar', treatment: 'Microscopic Root Canal Therapy', doctor: 'Dr. Elena Vance', note: 'Complex isthmus debridement and bioceramic sealer obturation.' },
  { num: 35, name: 'Mandibular Left 2nd Premolar', zone: 'Premolar', treatment: 'Dental Implants & Bone Grafting', doctor: 'Dr. Aris Thorne', note: 'Immediate anatomical abutment design.' },
  { num: 34, name: 'Mandibular Left 1st Premolar', zone: 'Premolar', treatment: 'Digital Smile Design & Ceramic Veneers', doctor: 'Dr. Elena Vance', note: 'Sub-gingival margin refinement and optical impression.' },
  { num: 33, name: 'Mandibular Left Canine', zone: 'Canine', treatment: 'Digital Smile Design & Ceramic Veneers', doctor: 'Dr. Elena Vance', note: 'Gingival zeniths alignment and veneer cementation.' },
  { num: 32, name: 'Mandibular Left Lateral Incisor', zone: 'Incisor', treatment: 'Pediatric & Preventive Dentistry', doctor: 'Dr. Aris Thorne', note: 'Periodontal maintenance and minimal intervention sealing.' },
  { num: 31, name: 'Mandibular Left Central Incisor', zone: 'Incisor', treatment: 'Pediatric & Preventive Dentistry', doctor: 'Dr. Aris Thorne', note: 'Prophylaxis, airflow polishing, and sub-gingival scaling.' },

  // Lower Right (Quadrant 4: 41 to 48)
  { num: 41, name: 'Mandibular Right Central Incisor', zone: 'Incisor', treatment: 'Pediatric & Preventive Dentistry', doctor: 'Dr. Aris Thorne', note: 'Ultra-gentle airflow prophylaxis and mineral desensitization.' },
  { num: 42, name: 'Mandibular Right Lateral Incisor', zone: 'Incisor', treatment: 'Pediatric & Preventive Dentistry', doctor: 'Dr. Aris Thorne', note: 'Preventive remineralization and diagnostic transillumination.' },
  { num: 43, name: 'Mandibular Right Canine', zone: 'Canine', treatment: 'Digital Smile Design & Ceramic Veneers', doctor: 'Dr. Elena Vance', note: 'Canine guidance restoration.' },
  { num: 44, name: 'Mandibular Right 1st Premolar', zone: 'Premolar', treatment: 'Dental Implants & Bone Grafting', doctor: 'Dr. Aris Thorne', note: 'Titanium implant placement with PRF growth factors.' },
  { num: 45, name: 'Mandibular Right 2nd Premolar', zone: 'Premolar', treatment: 'Dental Implants & Bone Grafting', doctor: 'Dr. Aris Thorne', note: 'Bone density optimization and surgical guide fabrication.' },
  { num: 46, name: 'Mandibular Right 1st Molar', zone: 'Molar', treatment: 'Microscopic Root Canal Therapy', doctor: 'Dr. Elena Vance', note: 'Middle mesial canal discovery under operating microscope.' },
  { num: 47, name: 'Mandibular Right 2nd Molar', zone: 'Molar', treatment: 'Dental Implants & Bone Grafting', doctor: 'Dr. Aris Thorne', note: 'Heavy mastication implant with monolithic zirconia crown.' },
  { num: 48, name: 'Mandibular Right 3rd Molar', zone: 'Molar', treatment: 'Surgical Extraction / Assessment', doctor: 'Dr. Aris Thorne', note: 'Stereotactic nerve mapping prior to disimpaction.' }
];

export default function Odontogram({ onSelectProcedure }) {
  const [selectedTooth, setSelectedTooth] = useState(TEETH_DATA.find(t => t.num === 11));
  const [hoveredTooth, setHoveredTooth] = useState(null);

  const activeTooth = hoveredTooth || selectedTooth;

  const handleToothClick = (tooth) => {
    setSelectedTooth(tooth);
  };

  const handleBookSelected = () => {
    if (onSelectProcedure && activeTooth) {
      onSelectProcedure(activeTooth.treatment, activeTooth.doctor, `Inquiry for tooth FDI #${activeTooth.num}`);
    }
  };

  // Render tooth icon coordinates across an arch
  const renderArch = (quadrantTeeth, isMaxillary) => {
    return (
      <g>
        {quadrantTeeth.map((tooth, idx) => {
          // X-position evenly across 16 columns (width 640px)
          const totalInRow = quadrantTeeth.length;
          const xStep = 38;
          const startX = 20;
          const cx = startX + idx * xStep;
          const cy = isMaxillary ? 48 : 110;
          const isSelected = activeTooth && activeTooth.num === tooth.num;

          return (
            <g
              key={tooth.num}
              className={`tooth-unit ${isSelected ? 'active' : ''}`}
              onMouseEnter={() => setHoveredTooth(tooth)}
              onMouseLeave={() => setHoveredTooth(null)}
              onClick={() => handleToothClick(tooth)}
            >
              {/* Technical root depiction */}
              {isMaxillary ? (
                <path
                  d={`M ${cx - 5} ${cy} L ${cx} ${cy - 24} L ${cx + 5} ${cy} Z`}
                  className="tooth-root"
                />
              ) : (
                <path
                  d={`M ${cx - 5} ${cy} L ${cx} ${cy + 24} L ${cx + 5} ${cy} Z`}
                  className="tooth-root"
                />
              )}

              {/* Technical crown depiction */}
              <rect
                x={cx - 13}
                y={isMaxillary ? cy : cy - 14}
                width={26}
                height={16}
                rx={1}
                className="tooth-shape"
              />

              {/* Tooth anatomical midline notch */}
              <line
                x1={cx}
                y1={isMaxillary ? cy + 2 : cy - 12}
                x2={cx}
                y2={isMaxillary ? cy + 14 : cy - 2}
                stroke="#94A3B8"
                strokeWidth="0.8"
              />

              {/* FDI Tooth Number */}
              <text
                x={cx}
                y={isMaxillary ? cy + 28 : cy - 18}
                className="tooth-label"
              >
                {tooth.num}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  const upperTeeth = TEETH_DATA.slice(0, 16);
  const lowerTeeth = TEETH_DATA.slice(16, 32);

  return (
    <section className="journal-section odontogram-section" aria-label="Odontogram Interactive Tool">
      <div className="journal-container">
        {/* Section Header */}
        <div className="section-marker-row">
          <div className="section-num-tag">
            <span>01.B</span>
            <span>SIGNATURE MOTIF — FDI ODONTOGRAM</span>
          </div>
          <div className="section-category">
            ANATOMICAL CHART &amp; CLINICAL PROCEDURE CORRELATION
          </div>
        </div>

        <div className="odontogram-header-block">
          <h2 className="serif-heading" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}>
            Interactive FDI Odontogram Plate
          </h2>
          <p style={{ maxWidth: '780px', marginTop: '0.75rem', fontSize: '1.05rem' }}>
            Hover or select any tooth coordinate below to inspect specific tissue biology, restorative guidelines, and designated clinical specialist protocols.
          </p>
        </div>

        <div className="odontogram-interactive-grid">
          {/* Left: Technical SVG FDI Chart */}
          <div className="chart-svg-wrapper">
            <div className="chart-quadrant-crosshair"></div>
            <div className="chart-midline-crosshair"></div>

            <div className="chart-quadrant-labels">
              <span>QUADRANT 1 (MAXILLARY RIGHT)</span>
              <span>QUADRANT 2 (MAXILLARY LEFT)</span>
            </div>

            <svg
              viewBox="0 0 650 160"
              className="odontogram-svg"
              aria-label="FDI Odontogram Chart Graphic"
            >
              {/* Maxillary Upper Arch */}
              {renderArch(upperTeeth, true)}

              {/* Horizontal Separation Rule */}
              <line x1="10" y1="80" x2="640" y2="80" stroke="#CBD5E1" strokeWidth="0.8" strokeDasharray="3 3" />

              {/* Mandibular Lower Arch */}
              {renderArch(lowerTeeth, false)}
            </svg>

            <div className="chart-quadrant-labels" style={{ marginTop: '1.25rem' }}>
              <span>QUADRANT 4 (MANDIBULAR RIGHT)</span>
              <span>QUADRANT 3 (MANDIBULAR LEFT)</span>
            </div>
          </div>

          {/* Right: Technical Inspector Card */}
          <div className="odontogram-inspector-panel">
            <div className="inspector-tag">
              COORDINATE SPECIFICATION
            </div>

            <div className="inspector-tooth-code">
              FDI #{activeTooth.num}
            </div>

            <div className="inspector-tooth-name">
              {activeTooth.name}
            </div>

            <div className="marginal-note">
              <strong>Region Classification:</strong> {activeTooth.zone} Anatomy
            </div>

            <div className="inspector-treatment-box">
              <div className="inspector-treatment-title">Designated Procedure</div>
              <div style={{ fontWeight: 600, color: 'var(--slate-900)', fontSize: '0.95rem' }}>
                {activeTooth.treatment}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-600)', marginTop: '0.25rem' }}>
                Lead: {activeTooth.doctor}
              </div>
              <p className="inspector-treatment-desc" style={{ marginTop: '0.5rem' }}>
                {activeTooth.note}
              </p>
            </div>

            <button
              type="button"
              className="inspector-cta-button"
              onClick={handleBookSelected}
            >
              <span>Schedule For Tooth #{activeTooth.num}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
