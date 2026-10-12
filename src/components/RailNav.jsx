import React, { useEffect, useState } from 'react';

/**
 * RailNav: Slim vertical rail fixed to the left edge.
 * Holds the wordmark rotated 90 degrees, section numbers as links with active-state tracking,
 * and a "Book" tab at the bottom. Collapses to bottom tab strip on mobile.
 */
export default function RailNav({ onOpenBooking, currentSection = '01' }) {
  const [activeSection, setActiveSection] = useState(currentSection);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['frontispiece', 'disciplines', 'credentials', 'case-study', 'colophon'];
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          const map = {
            'frontispiece': '01',
            'disciplines': '02',
            'credentials': '03',
            'case-study': '04',
            'colophon': '07'
          };
          setActiveSection(map[sections[i]] || '01');
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="rail-nav" aria-label="Clinical Rail Navigation">
      {/* Top Clinical Crosshair Glyph */}
      <div className="rail-top-glyph" title="Smile Dental Clinic — Specialist Registry">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="9" stroke="#94A3B8" strokeDasharray="2 2" />
          <line x1="12" y1="3" x2="12" y2="21" stroke="#0F4C81" />
          <line x1="3" y1="12" x2="21" y2="12" stroke="#0F4C81" />
          <circle cx="12" cy="12" r="2" fill="#B4332E" />
        </svg>
      </div>

      {/* Vertical Wordmark (Rotated 90 degrees) */}
      <div className="rail-wordmark-container">
        <a
          href="#frontispiece"
          className="rail-wordmark"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('frontispiece');
          }}
        >
          Smile Dental Clinic
        </a>
      </div>

      {/* Section Numbers with Active-State Tracking */}
      <ul className="rail-sections-list">
        <li>
          <button
            type="button"
            className={`rail-section-link ${activeSection === '01' ? 'active' : ''}`}
            onClick={() => scrollToSection('frontispiece')}
            title="01 Frontispiece"
          >
            <span>01</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`rail-section-link ${activeSection === '02' ? 'active' : ''}`}
            onClick={() => scrollToSection('disciplines')}
            title="02 Disciplines"
          >
            <span>02</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`rail-section-link ${activeSection === '03' ? 'active' : ''}`}
            onClick={() => scrollToSection('credentials')}
            title="03 Pride & Credentials"
          >
            <span>03</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`rail-section-link ${activeSection === '04' ? 'active' : ''}`}
            onClick={() => scrollToSection('case-study')}
            title="04 Case Documentation"
          >
            <span>04</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`rail-section-link ${activeSection === '07' ? 'active' : ''}`}
            onClick={() => scrollToSection('colophon')}
            title="07 Colophon"
          >
            <span>07</span>
          </button>
        </li>
      </ul>

      {/* Bottom Booking Tab */}
      <button
        type="button"
        className="rail-book-tab"
        onClick={onOpenBooking}
        title="Schedule Clinical Appointment"
      >
        <span>Book</span>
      </button>
    </nav>
  );
}
