import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { CLINIC_CONFIG } from '../config';
import { getSlots, createBooking, getLocalDateString, isSlotInPast } from '../services/api';
import AppointmentSlip from './AppointmentSlip';

export default function BookingSheet({
  isOpen,
  onClose,
  initialTreatment = '',
  initialDoctor = '',
  initialDate = '',
  initialPhone = ''
}) {
  const { lang, t } = useI18n();

  const [currentStep, setCurrentStep] = useState(1);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [treatment, setTreatment] = useState(initialTreatment || CLINIC_CONFIG.treatments[0].name);
  const [doctor, setDoctor] = useState(initialDoctor || CLINIC_CONFIG.doctors[0].name);

  // Horizontal Day Picker: generate next 7 days in user's local timezone
  const generateDaysList = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoStr = getLocalDateString(d);
      const weekdayStr = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
      days.push({ iso: isoStr, label: weekdayStr, dateNum: dayNum, month: monthStr });
    }
    return days;
  };

  const daysList = generateDaysList();

  // If after clinic hours (8:00 PM), default to tomorrow; otherwise default to today
  const getInitialDefaultDate = () => {
    if (initialDate) return initialDate;
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    return currentHour >= 20 ? (daysList[1]?.iso || daysList[0]?.iso) : daysList[0]?.iso;
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDefaultDate);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotsState, setSlotsState] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState(initialPhone || '');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);

  // Errors
  const [errors, setErrors] = useState({});

  // Sync initial props
  useEffect(() => {
    if (initialTreatment) setTreatment(initialTreatment);
    if (initialDoctor) setDoctor(initialDoctor);
    if (initialDate) setSelectedDate(initialDate);
    if (initialPhone) setPhone(initialPhone);
  }, [initialTreatment, initialDoctor, initialDate, initialPhone]);

  // Fetch slots whenever selectedDate or doctor changes
  useEffect(() => {
    let active = true;
    if (selectedDate && isOpen) {
      setIsLoadingSlots(true);
      getSlots(selectedDate, doctor)
        .then(res => {
          if (active) {
            setSlotsState(res.slots || []);
            // If current slot is taken or passed, reset
            setSelectedSlot(prev => {
              if (!prev) return '';
              const found = (res.slots || []).find(s => s.slot === prev);
              return (found && found.available) ? prev : '';
            });
          }
        })
        .catch(err => {
          console.error('Error fetching slots', err);
        })
        .finally(() => {
          if (active) setIsLoadingSlots(false);
        });
    }
    return () => { active = false; };
  }, [selectedDate, doctor, isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Validation
  const validateStep1 = () => {
    if (!treatment) {
      setFormError('Please select a dental service.');
      return false;
    }
    setFormError('');
    return true;
  };

  const validateStep2 = () => {
    if (!selectedDate) {
      setFormError('Please select an appointment day.');
      return false;
    }
    if (!selectedSlot) {
      setFormError('Please choose an available time slot.');
      return false;
    }
    if (isSlotInPast(selectedDate, selectedSlot)) {
      setFormError('The selected time slot has passed for today. Please select an upcoming slot or choose tomorrow.');
      return false;
    }
    setFormError('');
    return true;
  };

  const validateStep3 = () => {
    const errs = {};
    if (!patientName.trim() || patientName.trim().length < 2) {
      errs.patientName = 'Please enter patient full legal name.';
    }
    // Clean phone number (strip spaces/dashes)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!consentGiven) {
      errs.consent = 'Please confirm clinic booking agreement.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setFormError('Please complete the required details.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        patient_name: patientName.trim(),
        phone: phone.trim().startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        email: email.trim() || null,
        treatment,
        doctor: doctor || 'Senior Dental Consultant',
        date: selectedDate,
        time_slot: selectedSlot,
        notes: notes.trim()
      };

      const res = await createBooking(payload);
      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        setCurrentStep(4); // Slip view
      } else {
        throw new Error(res.error || 'Booking could not be confirmed.');
      }
    } catch (err) {
      console.error('Booking failed', err);
      setFormError(err.message || 'That slot was just booked by another patient. Please choose another time.');
      if (err.status === 409 || err.message.includes('409') || err.message.includes('collision')) {
        setCurrentStep(2);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    setCurrentStep(1);
    setSelectedSlot('');
    setPatientName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setErrors({});
  };

  return (
    <div
      className="booking-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
    >
      <div className="booking-sheet-container">
        {/* Header */}
        <div className="sheet-header">
          <div>
            <h3 id="sheet-title">{t('booking.sheetTitle')}</h3>
            <p>{t('booking.sheetSub')}</p>
          </div>
          <button
            type="button"
            className="sheet-close-btn"
            onClick={onClose}
            aria-label="Close booking sheet"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Bar (Steps 1 to 3) */}
        {currentStep <= 3 && (
          <div className="sheet-progress-bar">
            <div className={`sheet-step-tab ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'done' : ''}`}>
              {t('booking.step1')}
            </div>
            <div className={`sheet-step-tab ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'done' : ''}`}>
              {t('booking.step2')}
            </div>
            <div className={`sheet-step-tab ${currentStep === 3 ? 'active' : ''}`}>
              {t('booking.step3')}
            </div>
          </div>
        )}

        {/* Form Body Scroll */}
        <div className="sheet-body-scroll">
          {formError && (
            <div style={{ backgroundColor: 'var(--status-cancelled-bg)', border: '1px solid var(--status-cancelled)', color: 'var(--status-cancelled)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600 }}>
              {formError}
            </div>
          )}

          {/* STEP 1: Treatment & Doctor */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="qb-label" style={{ marginBottom: '8px', display: 'block' }}>
                  1. Choose Treatment Required
                </label>
                <div className="treatments-selection-grid">
                  {CLINIC_CONFIG.treatments.map((tr) => (
                    <div
                      key={tr.id}
                      className={`treatment-select-tile ${treatment === tr.name ? 'selected' : ''}`}
                      onClick={() => {
                        setTreatment(tr.name);
                        setDoctor(tr.defaultDoctor);
                      }}
                    >
                      <div className="tile-title">
                        {lang === 'ta' && tr.nameTamil ? tr.nameTamil : tr.name}
                      </div>
                      <div className="tile-price">{tr.priceLabel}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {tr.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="qb-label" style={{ marginBottom: '8px', display: 'block' }}>
                  2. {t('booking.chooseDoctor')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div
                    className={`treatment-select-tile ${doctor === 'Any Available Senior Doctor' ? 'selected' : ''}`}
                    onClick={() => setDoctor('Any Available Senior Doctor')}
                  >
                    <div className="tile-title">⚡ {t('booking.anyDoctor')}</div>
                  </div>

                  {CLINIC_CONFIG.doctors.map((d) => (
                    <div
                      key={d.id}
                      className={`treatment-select-tile ${doctor === d.name ? 'selected' : ''}`}
                      onClick={() => setDoctor(d.name)}
                    >
                      <div className="tile-title">{d.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-teal)', fontWeight: 600 }}>
                        {d.role}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Speaks: {d.languages.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Horizontal Day Picker & Morning/Afternoon/Evening Slots */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="qb-label" style={{ marginBottom: '8px', display: 'block' }}>
                  1. {t('booking.selectDate')}
                </label>
                <div className="days-horizontal-strip">
                  {daysList.map((d) => (
                    <div
                      key={d.iso}
                      className={`day-picker-item ${selectedDate === d.iso ? 'selected' : ''}`}
                      onClick={() => setSelectedDate(d.iso)}
                    >
                      <div className="day-item-weekday">{d.label}</div>
                      <div className="day-item-date">{d.dateNum}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>{d.month}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="qb-label" style={{ marginBottom: '8px', display: 'block' }}>
                  2. Pick an Available Time Slot ({doctor})
                </label>

                {isLoadingSlots ? (
                  <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading available operatory slots...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Notice if all slots for this day are passed */}
                    {slotsState.length > 0 && slotsState.every(s => s.isPassed) && (
                      <div className="all-slots-passed-banner">
                        <span className="banner-icon">🌙</span>
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            {t('booking.allSlotsPassedToday') || 'All appointment slots for today have concluded.'}
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Please choose tomorrow to view open clinical appointments.
                          </span>
                        </div>
                        {daysList[1] && (
                          <button
                            type="button"
                            className="btn-switch-tmrw"
                            onClick={() => setSelectedDate(daysList[1].iso)}
                          >
                            {daysList[1].label} ({daysList[1].dateNum} {daysList[1].month}) →
                          </button>
                        )}
                      </div>
                    )}

                    {/* Morning */}
                    <div className="slot-group-block">
                      <span className="slot-group-title">🌅 {t('booking.morning')}</span>
                      <div className="slot-pills-row">
                        {CLINIC_CONFIG.timeSlots.morning.map((slot) => {
                          const item = slotsState.find(s => s.slot === slot);
                          const isAvailable = Boolean(item && item.available);
                          const isPassed = Boolean(item && item.isPassed);
                          const isSelected = selectedSlot === slot;
                          const badge = isPassed ? (t('booking.timePassed') || 'Passed') : (!isAvailable && item ? (t('booking.reserved') || 'Booked') : '');

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={!isAvailable}
                              className={`slot-pill-btn ${isSelected ? 'selected' : ''} ${isPassed ? 'slot-passed' : !isAvailable ? 'slot-reserved' : ''}`}
                              onClick={() => setSelectedSlot(slot)}
                              title={isPassed ? 'Time has passed for today' : !isAvailable ? 'Slot already reserved' : `Select ${slot}`}
                            >
                              <span className="slot-pill-time">{slot}</span>
                              {badge && (
                                <span className={`slot-pill-badge ${isPassed ? 'badge-passed' : 'badge-reserved'}`}>
                                  ({badge})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Afternoon */}
                    <div className="slot-group-block">
                      <span className="slot-group-title">☀️ {t('booking.afternoon')}</span>
                      <div className="slot-pills-row">
                        {CLINIC_CONFIG.timeSlots.afternoon.map((slot) => {
                          const item = slotsState.find(s => s.slot === slot);
                          const isAvailable = Boolean(item && item.available);
                          const isPassed = Boolean(item && item.isPassed);
                          const isSelected = selectedSlot === slot;
                          const badge = isPassed ? (t('booking.timePassed') || 'Passed') : (!isAvailable && item ? (t('booking.reserved') || 'Booked') : '');

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={!isAvailable}
                              className={`slot-pill-btn ${isSelected ? 'selected' : ''} ${isPassed ? 'slot-passed' : !isAvailable ? 'slot-reserved' : ''}`}
                              onClick={() => setSelectedSlot(slot)}
                              title={isPassed ? 'Time has passed for today' : !isAvailable ? 'Slot already reserved' : `Select ${slot}`}
                            >
                              <span className="slot-pill-time">{slot}</span>
                              {badge && (
                                <span className={`slot-pill-badge ${isPassed ? 'badge-passed' : 'badge-reserved'}`}>
                                  ({badge})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Evening */}
                    <div className="slot-group-block">
                      <span className="slot-group-title">🌙 {t('booking.evening')}</span>
                      <div className="slot-pills-row">
                        {CLINIC_CONFIG.timeSlots.evening.map((slot) => {
                          const item = slotsState.find(s => s.slot === slot);
                          const isAvailable = Boolean(item && item.available);
                          const isPassed = Boolean(item && item.isPassed);
                          const isSelected = selectedSlot === slot;
                          const badge = isPassed ? (t('booking.timePassed') || 'Passed') : (!isAvailable && item ? (t('booking.reserved') || 'Booked') : '');

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={!isAvailable}
                              className={`slot-pill-btn ${isSelected ? 'selected' : ''} ${isPassed ? 'slot-passed' : !isAvailable ? 'slot-reserved' : ''}`}
                              onClick={() => setSelectedSlot(slot)}
                              title={isPassed ? 'Time has passed for today' : !isAvailable ? 'Slot already reserved' : `Select ${slot}`}
                            >
                              <span className="slot-pill-time">{slot}</span>
                              {badge && (
                                <span className={`slot-pill-badge ${isPassed ? 'badge-passed' : 'badge-reserved'}`}>
                                  ({badge})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Patient Information & Consent */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="qb-field">
                <label className="qb-label">{t('booking.fullName')} *</label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Kumar"
                  className="qb-input"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  autoFocus
                />
                {errors.patientName && <span style={{ color: 'var(--status-cancelled)', fontSize: '0.78rem' }}>{errors.patientName}</span>}
              </div>

              <div className="qb-field">
                <label className="qb-label">{t('booking.phone')} *</label>
                <input
                  type="tel"
                  placeholder="e.g. 98401 23456"
                  className="qb-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {t('booking.phoneHelper')}
                </span>
                {errors.phone && <span style={{ color: 'var(--status-cancelled)', fontSize: '0.78rem' }}>{errors.phone}</span>}
              </div>

              <div className="qb-field">
                <label className="qb-label">{t('booking.email')}</label>
                <input
                  type="email"
                  placeholder="e.g. suresh@example.com"
                  className="qb-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {t('booking.emailHelper')}
                </span>
                {errors.email && <span style={{ color: 'var(--status-cancelled)', fontSize: '0.78rem' }}>{errors.email}</span>}
              </div>

              <div className="qb-field">
                <label className="qb-label">{t('booking.notes')}</label>
                <textarea
                  rows="2"
                  placeholder={t('booking.notesPlaceholder')}
                  className="qb-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: 'var(--primary-teal)', width: '18px', height: '18px' }}
                />
                <span>{t('booking.consent')}</span>
              </label>
              {errors.consent && <span style={{ color: 'var(--status-cancelled)', fontSize: '0.78rem' }}>{errors.consent}</span>}
            </form>
          )}

          {/* STEP 4: Transformed Official Printable Slip */}
          {currentStep === 4 && confirmedBooking && (
            <AppointmentSlip
              booking={confirmedBooking}
              onNewBooking={handleReset}
            />
          )}
        </div>

        {/* Footer Actions (Steps 1 to 3) */}
        {currentStep <= 3 && (
          <div className="sheet-footer">
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn-call-icon"
                style={{ width: 'auto', padding: '10px 18px', borderRadius: 'var(--radius-pill)' }}
                onClick={handleBack}
                disabled={isSubmitting}
              >
                ← {t('booking.back')}
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                className="btn-pill-teal"
                onClick={handleNext}
              >
                {t('booking.proceed')}
              </button>
            ) : (
              <button
                type="button"
                className="btn-pill-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('booking.confirming') : t('booking.confirmBooking')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
