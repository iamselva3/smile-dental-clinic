import React from 'react';
import { useI18n } from '../i18n/I18nContext';

const REVIEWS = [
  {
    id: 1,
    name: 'Sridhar Krishnamurthy',
    initials: 'SK',
    rating: 5,
    treatment: 'Painless Root Canal',
    location: 'Anna Nagar, Chennai',
    quote: 'Dr. Priya completed my molar root canal in just a single 40-minute sitting with zero pain. In previous clinics I was given 3 painful visits. Truly gentle and honest doctors!'
  },
  {
    id: 2,
    name: 'Deepa Natarajan',
    initials: 'DN',
    rating: 5,
    treatment: 'Kids Dentistry',
    location: 'Kilpauk, Chennai',
    quote: 'My 5-year-old daughter was crying and terrified of dentists. Dr. Ananya was so affectionate and patient. She explained everything like a story, and the tooth filling was done without a single tear!'
  },
  {
    id: 3,
    name: 'Vigneshwaran R.',
    initials: 'VR',
    rating: 5,
    treatment: 'Full Mouth Dental Implants',
    location: 'T. Nagar, Chennai',
    quote: 'Got implants done for my 68-year-old father by Dr. Rajesh. He can now chew favorite South Indian snacks and meals comfortably. Transparent estimate with 0% EMI was very helpful.'
  },
  {
    id: 4,
    name: 'Preethi Sundar',
    initials: 'PS',
    rating: 5,
    treatment: 'Invisible Aligners',
    location: 'Nungambakkam, Chennai',
    quote: 'No wire pain or food getting stuck! The 3D scan was done in 10 minutes, and my smile was corrected in 7 months. Best aesthetic dental team in Chennai.'
  },
  {
    id: 5,
    name: 'Dr. Balaji Mohan',
    initials: 'BM',
    rating: 5,
    treatment: 'Teeth Cleaning & Whitening',
    location: 'Anna Nagar West',
    quote: 'As a physician myself, I was impressed by their infection control. Sterile instrument pouches opened right in front of the patient. Five stars for clinical hygiene and ethics.'
  }
];

export default function Reviews() {
  const { t } = useI18n();

  return (
    <section id="reviews" className="section section-white" aria-label="Patient Testimonials">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">{t('reviews.sectionTag')}</span>
          <h2 className="section-heading">{t('reviews.heading')}</h2>
          <p className="section-subheading">{t('reviews.subheading')}</p>
        </div>

        {/* Swipeable / Scroll-Snap Carousel */}
        <div className="reviews-scroll">
          {REVIEWS.map((r) => (
            <div key={r.id} className="review-card">
              <div>
                <div className="review-stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <p className="review-quote" style={{ marginTop: '0.85rem' }}>
                  "{r.quote}"
                </p>
              </div>

              <div className="review-author">
                <div className="author-avatar">{r.initials}</div>
                <div>
                  <div className="author-name">{r.name}</div>
                  <div className="author-tag">{r.treatment} • {r.location}</div>
                  <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600, marginTop: '2px' }}>
                    ✓ {t('reviews.googleVerified')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
