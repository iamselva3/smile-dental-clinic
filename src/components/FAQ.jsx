import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { CLINIC_CONFIG } from '../config';

const FAQS = [
  {
    q: 'Is root canal or dental treatment really pain-free?',
    a: 'Yes, 100%. We use pre-numbed topical strawberry gels before any injection, combined with computer-controlled gentle anesthetic delivery. Most patients feel nothing more than mild vibration, and many even doze off during treatment.'
  },
  {
    q: 'How much will my treatment cost? Are there any hidden fees?',
    a: 'We believe in 100% upfront transparency. After your initial consultation and digital scan, our doctor gives you a written cost estimate with all options. You never pay unexpected fees or unneeded procedures.'
  },
  {
    q: 'How long does a dental implant take? Can I get teeth in one day?',
    a: 'Keyhole implant placement takes just 45 minutes in our sterile operatory. For eligible patients with good bone support, we provide immediate temporary teeth on the same day, followed by permanent zirconia crowns once osseointegration matures.'
  },
  {
    q: 'My child is terrified of dentists. How do you handle kids?',
    a: 'Dr. Ananya Ramesh specializes in pediatric psychology. We never rush a child. The first session is often a fun "get-to-know" visit where children see how the equipment works, receive a brave smile badge, and experience zero discomfort.'
  },
  {
    q: 'Do you accept health insurance or 0% EMI payment?',
    a: 'Yes! We provide official hospital GST receipts, itemized clinical reports, and doctor certificates for reimbursement across all major health insurances. Additionally, we provide 0% interest EMI options on HDFC, ICICI, SBI, Axis, and Bajaj Finserv cards.'
  },
  {
    q: 'What should I do in a dental emergency outside clinic hours?',
    a: `For sudden acute pain, tooth avulsion, or swelling, please call our 24/7 emergency line directly: ${CLINIC_CONFIG.emergencyPhone}. We provide immediate triage advice and schedule same-day emergency operatory access.`
  }
];

export default function FAQ() {
  const { t } = useI18n();

  return (
    <section id="faq" className="section section-tinted" aria-label="Frequently Asked Questions">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">{t('faq.sectionTag')}</span>
          <h2 className="section-heading">{t('faq.heading')}</h2>
          <p className="section-subheading">{t('faq.subheading')}</p>
        </div>

        {/* FAQ Accordion List */}
        <div className="faq-list">
          {FAQS.map((item, idx) => (
            <details key={idx} className="faq-item" open={idx === 0}>
              <summary className="faq-summary">
                <span>{item.q}</span>
              </summary>
              <div className="faq-content">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
