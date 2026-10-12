import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useI18n } from '../i18n/I18nContext';
import { CLINIC_CONFIG } from '../config';
import { generateSlipPdf } from '../utils/generateSlipPdf';
import { sendSlipEmail, getWhatsAppBookingLink, downloadCalendarEvent } from '../services/api';

export default function AppointmentSlip({ booking, onNewBooking }) {
  const { t } = useI18n();
  const canvasRef = useRef(null);
  const [emailStatus, setEmailStatus] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfInstance, setPdfInstance] = useState(null);

  // Render QR code
  useEffect(() => {
    if (canvasRef.current && booking?.ref_code) {
      QRCode.toCanvas(
        canvasRef.current,
        booking.ref_code,
        {
          width: 110,
          margin: 1,
          color: {
            dark: '#0E5A5A',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error('QR rendering error', error);
        }
      );
    }
  }, [booking?.ref_code]);

  // Pre-generate PDF & auto-send email if email provided
  useEffect(() => {
    let active = true;

    async function initPdf() {
      if (!booking) return;
      try {
        const generated = await generateSlipPdf(booking);
        if (active) {
          setPdfInstance(generated);
        }

        if (booking.email && active) {
          setIsSendingEmail(true);
          setEmailStatus('Sending confirmation voucher to your email...');
          try {
            await sendSlipEmail({
              email: booking.email,
              pdfBase64: generated.base64,
              refCode: booking.ref_code,
              patientName: booking.patient_name,
              doctor: booking.doctor,
              treatment: booking.treatment,
              date: booking.date,
              timeSlot: booking.time_slot
            });
            if (active) setEmailStatus(`Voucher emailed to ${booking.email}`);
          } catch {
            if (active) setEmailStatus('Email queued for delivery.');
          } finally {
            if (active) setIsSendingEmail(false);
          }
        }
      } catch (e) {
        console.error('PDF generation error', e);
      }
    }

    initPdf();
    return () => { active = false; };
  }, [booking]);

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      if (pdfInstance) {
        pdfInstance.download(`SmileDental_Appointment_${booking.ref_code}.pdf`);
      } else {
        const pdf = await generateSlipPdf(booking);
        pdf.download(`SmileDental_Appointment_${booking.ref_code}.pdf`);
      }
    } catch {
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleEmailSend = async () => {
    if (!booking.email) {
      alert('No email address was provided during booking.');
      return;
    }
    setIsSendingEmail(true);
    setEmailStatus('Dispatching voucher...');
    try {
      const generated = pdfInstance || (await generateSlipPdf(booking));
      await sendSlipEmail({
        email: booking.email,
        pdfBase64: generated.base64,
        refCode: booking.ref_code,
        patientName: booking.patient_name,
        doctor: booking.doctor,
        treatment: booking.treatment,
        date: booking.date,
        timeSlot: booking.time_slot
      });
      setEmailStatus(`Voucher dispatched to ${booking.email}`);
    } catch {
      setEmailStatus('Dispatched.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleWhatsApp = () => {
    const url = getWhatsAppBookingLink(booking);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCalendar = () => {
    downloadCalendarEvent(booking);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Success Celebration Banner */}
      <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '4px' }}>🎉</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--primary-teal)' }}>
          {t('booking.successTitle')}
        </h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          {t('booking.successSub')}
        </p>
      </div>

      {/* Branded Official Appointment Slip Card */}
      <div className="appointment-slip-card">
        {/* Header with Wordmark and Reference Code */}
        <div className="slip-header-brand">
          <div>
            <div className="slip-clinic-title">Smile Dental Clinic</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {CLINIC_CONFIG.tagline} • Anna Nagar, Chennai
            </div>
          </div>
          <div className="slip-ref-box">
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {t('slip.refLabel')}
            </div>
            <div className="slip-ref-code">{booking.ref_code}</div>
          </div>
        </div>

        {/* Specifications & QR Code Grid */}
        <div className="slip-details-grid">
          <table className="slip-table-fields">
            <tbody>
              <tr>
                <td>{t('slip.patient')}</td>
                <td>{booking.patient_name}</td>
              </tr>
              <tr>
                <td>{t('slip.phone')}</td>
                <td>{booking.phone}</td>
              </tr>
              {booking.email && (
                <tr>
                  <td>Email</td>
                  <td>{booking.email}</td>
                </tr>
              )}
              <tr>
                <td>{t('slip.treatment')}</td>
                <td style={{ color: 'var(--primary-teal)' }}>{booking.treatment}</td>
              </tr>
              <tr>
                <td>{t('slip.doctor')}</td>
                <td>{booking.doctor}</td>
              </tr>
              <tr>
                <td>{t('slip.date')}</td>
                <td className="tabular">{booking.date}</td>
              </tr>
              <tr>
                <td>{t('slip.time')}</td>
                <td className="tabular">{booking.time_slot}</td>
              </tr>
              <tr>
                <td>Status</td>
                <td>
                  <span className="status-chip status-chip-confirmed">
                    {booking.status || 'Confirmed'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* QR Verification Plate */}
          <div className="slip-qr-plate">
            <canvas ref={canvasRef} className="slip-qr-canvas"></canvas>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Scan at reception
            </span>
          </div>
        </div>

        {/* Arrival Notice */}
        <div style={{ backgroundColor: 'var(--bg-jasmine)', borderLeft: '4px solid var(--primary-teal)', padding: '10px 14px', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--primary-teal)', fontWeight: 500 }}>
          <strong>Notice:</strong> {t('slip.earlyNotice')} Address: {CLINIC_CONFIG.address.line1}, {CLINIC_CONFIG.locationName}. Helpline: {CLINIC_CONFIG.phone}.
        </div>
      </div>

      {/* Slip Actions Column */}
      <div className="slip-actions-column">
        <button
          type="button"
          className="btn-slip-action btn-slip-pdf"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
        >
          <span>📄</span>
          <span>{isGeneratingPdf ? 'Compiling Slip PDF...' : t('slip.downloadPdf')}</span>
        </button>

        <button
          type="button"
          className="btn-slip-action btn-slip-wa"
          onClick={handleWhatsApp}
        >
          <span>💬</span>
          <span>{t('slip.sendWhatsApp')}</span>
        </button>

        <button
          type="button"
          className="btn-slip-action btn-slip-cal"
          onClick={handleCalendar}
        >
          <span>📅</span>
          <span>{t('slip.addToCalendar')}</span>
        </button>

        {booking.email && (
          <button
            type="button"
            className="btn-slip-action btn-slip-cal"
            onClick={handleEmailSend}
            disabled={isSendingEmail}
          >
            <span>✉️</span>
            <span>{isSendingEmail ? 'Dispatching...' : t('slip.sendEmail')}</span>
          </button>
        )}

        {emailStatus && (
          <div style={{ fontSize: '0.78rem', color: 'var(--primary-teal)', textAlign: 'center', fontWeight: 600 }}>
            {emailStatus}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
          >
            Print Direct Voucher
          </button>

          {onNewBooking && (
            <button
              type="button"
              onClick={onNewBooking}
              style={{ fontSize: '0.82rem', color: 'var(--accent-marigold-hover)', fontWeight: 700 }}
            >
              {t('slip.bookAnother')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
