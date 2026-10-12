import React, { useState, useEffect } from 'react';
import {
  CLINIC_DOCTORS,
  CLINIC_TREATMENTS,
  AVAILABLE_SLOTS,
  getSlots,
  createBooking
} from '../services/api';
import AppointmentSlip from './AppointmentSlip';

/**
 * BookingDrawer: Full-height sliding prescription pad drawer from the right.
 * Step 1: Procedure & Doctor
 * Step 2: Date & Slot Selector (disabled & struck-through booked slots)
 * Step 3: Patient Information, WhatsApp, Email, Notes, Consent
 * Step 4: Transformed into printable AppointmentSlip with QR and PDF download.
 */
export default function BookingDrawer({
  isOpen,
  onClose,
  initialTreatment = '',
  initialDoctor = '',
  initialNotes = ''
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [treatment, setTreatment] = useState(initialTreatment || CLINIC_TREATMENTS[0].name);
  const [doctor, setDoctor] = useState(initialDoctor || CLINIC_DOCTORS[0].name);

  // Tomorrow as default date or today
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 1);
  const defaultDateStr = defaultDate.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Patient info
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState(initialNotes || '');
  const [consentGiven, setConsentGiven] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState({});

  // Sync initial props if drawer opened with pre-selected procedure from Odontogram/Disciplines
  useEffect(() => {
    if (initialTreatment) setTreatment(initialTreatment);
    if (initialDoctor) setDoctor(initialDoctor);
    if (initialNotes) setNotes(initialNotes);
  }, [initialTreatment, initialDoctor, initialNotes]);

  // Fetch slots whenever date or doctor changes
  useEffect(() => {
    let active = true;
    if (date && doctor && isOpen) {
      setIsLoadingSlots(true);
      getSlots(date, doctor)
        .then(res => {
          if (active) {
            setAvailableSlots(res.slots || []);
            // If currently selected slot is now unavailable, reset it
            const currentSelected = (res.slots || []).find(s => s.slot === timeSlot);
            if (currentSelected && !currentSelected.available) {
              setTimeSlot('');
            }
          }
        })
        .catch(err => {
          console.error('Error fetching slots', err);
          if (active) {
            setAvailableSlots(
              AVAILABLE_SLOTS.map(slot => ({ slot, available: true }))
            );
          }
        })
        .finally(() => {
          if (active) setIsLoadingSlots(false);
        });
    }
    return () => {
      active = false;
    };
  }, [date, doctor, isOpen, timeSlot]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Validation routines
  const validateStep1 = () => {
    if (!treatment) {
      setFormError('Please select a clinical procedure.');
      return false;
    }
    if (!doctor) {
      setFormError('Please select an attending specialist.');
      return false;
    }
    setFormError('');
    return true;
  };

  const validateStep2 = () => {
    if (!date) {
      setFormError('Please select an appointment date.');
      return false;
    }
    if (!timeSlot) {
      setFormError('Please select an operative time slot.');
      return false;
    }
    setFormError('');
    return true;
  };

  const validateStep3 = () => {
    const errs = {};
    if (!patientName.trim()) {
      errs.patientName = 'Patient full name is required.';
    }
    if (!phone.trim() || phone.trim().length < 8) {
      errs.phone = 'Valid phone number with country code is required.';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Valid email address format required.';
    }
    if (!consentGiven) {
      errs.consent = 'You must confirm the clinical sterilization & booking policy.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setFormError('Please correct the indicated fields before confirming.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setFormError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        patient_name: patientName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        treatment,
        doctor,
        date,
        time_slot: timeSlot,
        notes: notes.trim()
      };

      const result = await createBooking(payload);
      if (result.success && result.booking) {
        setConfirmedBooking(result.booking);
        setCurrentStep(4); // Slip view
      } else {
        throw new Error(result.error || 'Booking reservation could not be verified.');
      }
    } catch (err) {
      console.error('Booking failed', err);
      setFormError(err.message || 'Slot collision: that specific slot has just been reserved. Please select another time.');
      if (err.status === 409 || err.message.includes('409') || err.message.includes('collision')) {
        setCurrentStep(2); // Send back to slot selection
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setConfirmedBooking(null);
    setCurrentStep(1);
    setTimeSlot('');
    setPatientName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setConsentGiven(false);
    setErrors({});
  };

  const minDateStr = new Date().toISOString().split('T')[0];

  return (
    <div
      className="drawer-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="booking-drawer">
        {/* Prescription Pad Header */}
        <div className="drawer-header">
          <div className="drawer-prescription-header">
            <h2 id="drawer-title" className="drawer-header-brand">
              Smile Dental Clinic
            </h2>
            <div className="drawer-header-sub">
              Clinical Prescription &amp; Operatory Requisition Pad
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close booking drawer"
          >
            [ESC] ✕
          </button>
        </div>

        {/* Progress Ruler (Steps 1 to 3) */}
        {currentStep <= 3 && (
          <div className="drawer-progress-ruler">
            <div className={`ruler-step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <span className="ruler-step-num">01</span>
              <span>PROCEDURE</span>
            </div>
            <div className={`ruler-step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <span className="ruler-step-num">02</span>
              <span>SLOT</span>
            </div>
            <div className={`ruler-step ${currentStep === 3 ? 'active' : ''}`}>
              <span className="ruler-step-num">03</span>
              <span>PATIENT</span>
            </div>
          </div>
        )}

        {/* Form Body Scroll */}
        <div className="drawer-body-scroll">
          {formError && (
            <div
              style={{
                backgroundColor: 'var(--clinical-red-light)',
                border: '1px solid var(--clinical-red)',
                color: 'var(--clinical-red)',
                padding: '0.75rem 1rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem'
              }}
            >
              <strong>ERROR:</strong> {formError}
            </div>
          )}

          {/* STEP 1: Procedure & Doctor */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>1. Clinical Discipline / Procedure</span>
                  <span className="form-field-required">*</span>
                </label>
                <div className="selection-card-grid">
                  {CLINIC_TREATMENTS.map(t => (
                    <div
                      key={t.id}
                      className={`selection-card-item ${treatment === t.name ? 'selected' : ''}`}
                      onClick={() => {
                        setTreatment(t.name);
                        setDoctor(t.defaultDoctor);
                      }}
                    >
                      <div>
                        <div className="selection-card-title">{t.name}</div>
                        <div className="selection-card-sub">Specialist: {t.defaultDoctor}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: treatment === t.name ? 'var(--surgical-blue)' : 'var(--hairline-dark)' }}>
                        {treatment === t.name ? '[●]' : '[○]'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-field-group">
                <label className="form-field-label">
                  <span>2. Attending Specialist Clinician</span>
                  <span className="form-field-required">*</span>
                </label>
                <div className="selection-card-grid">
                  {CLINIC_DOCTORS.map(d => (
                    <div
                      key={d.id}
                      className={`selection-card-item ${doctor === d.name ? 'selected' : ''}`}
                      onClick={() => setDoctor(d.name)}
                    >
                      <div>
                        <div className="selection-card-title">{d.name}</div>
                        <div className="selection-card-sub">{d.specialty}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: doctor === d.name ? 'var(--surgical-blue)' : 'var(--hairline-dark)' }}>
                        {doctor === d.name ? '[●]' : '[○]'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="marginal-note">
                <strong>Operatory Protocol:</strong> Every session includes full intraoral digital mapping, radiographic assessment, and 1-on-1 surgical consultation.
              </div>
            </div>
          )}

          {/* STEP 2: Date + Slot Selector */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>1. Appointment Date</span>
                  <span className="form-field-required">*</span>
                </label>
                <input
                  type="date"
                  min={minDateStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-field-input"
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-400)' }}>
                  Operatory open Monday to Saturday, 08:30 – 19:30
                </span>
              </div>

              <div className="form-field-group">
                <div className="form-field-label">
                  <span>2. Select Operative Slot for {doctor}</span>
                  <span className="form-field-required">*</span>
                </div>

                {isLoadingSlots ? (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted-400)', padding: '1rem 0' }}>
                    Querying Cloudflare D1 Ledger for doctor availability...
                  </div>
                ) : (
                  <div className="slots-grid">
                    {availableSlots.map(({ slot, available, reason }) => (
                      <button
                        key={slot}
                        type="button"
                        disabled={!available}
                        className={`slot-button ${timeSlot === slot ? 'selected' : ''}`}
                        onClick={() => setTimeSlot(slot)}
                        title={available ? `Select ${slot}` : `${slot}: ${reason}`}
                      >
                        {slot}
                        {!available && <span style={{ display: 'block', fontSize: '0.65rem' }}>Reserved</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="marginal-note">
                <strong>Schedule Policy:</strong> Slots with strikethrough are committed in the live ledger. Reserved slots guarantee no double-booking or waiting room delay.
              </div>
            </div>
          )}

          {/* STEP 3: Patient Information & Consent */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Patient Full Legal Name</span>
                  <span className="form-field-required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Katherine Sterling"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className={`form-field-input ${errors.patientName ? 'has-error' : ''}`}
                />
                {errors.patientName && <span className="form-error-text">{errors.patientName}</span>}
              </div>

              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Contact Phone / WhatsApp</span>
                  <span className="form-field-required">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+1 415 555 0192"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`form-field-input ${errors.phone ? 'has-error' : ''}`}
                />
                {errors.phone && <span className="form-error-text">{errors.phone}</span>}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-400)' }}>
                  Used for pre-operative SMS / WhatsApp reminder slip
                </span>
              </div>

              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Email Address (For PDF Slip &amp; Records)</span>
                  <span style={{ color: 'var(--muted-400)', fontSize: '0.7rem' }}>OPTIONAL</span>
                </label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`form-field-input ${errors.email ? 'has-error' : ''}`}
                />
                {errors.email && <span className="form-error-text">{errors.email}</span>}
              </div>

              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Symptoms, Allergies or Clinical Notes</span>
                  <span style={{ color: 'var(--muted-400)', fontSize: '0.7rem' }}>OPTIONAL</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Tooth sensitivity on cold, pre-existing medication, previous dental surgeries..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-field-textarea"
                />
              </div>

              <label className="consent-agreement">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="consent-checkbox"
                />
                <span>
                  I confirm the appointment slot and acknowledge the clinic hospital-grade sterilization protocol. I understand that cancellations require 24 hours prior notice.
                </span>
              </label>
              {errors.consent && <span className="form-error-text">{errors.consent}</span>}

              <div className="marginal-note">
                <strong>Data Protection §14:</strong> Personal medical information is encrypted and transmitted solely to our Cloudflare D1 secure hospital database.
              </div>
            </form>
          )}

          {/* STEP 4: Transformed Printable Slip */}
          {currentStep === 4 && confirmedBooking && (
            <AppointmentSlip
              booking={confirmedBooking}
              onNewBooking={resetForm}
            />
          )}
        </div>

        {/* Drawer Footer Actions (Steps 1 to 3) */}
        {currentStep <= 3 && (
          <div className="drawer-footer-actions">
            {currentStep > 1 ? (
              <button
                type="button"
                className="drawer-btn-secondary"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                ← Back
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                className="drawer-btn-primary"
                onClick={handleNext}
              >
                Proceed to Step {currentStep + 1} →
              </button>
            ) : (
              <button
                type="button"
                className="drawer-btn-primary"
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Confirming with D1...' : 'Confirm Appointment →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
