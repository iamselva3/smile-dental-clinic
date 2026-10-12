import React, { useState, useEffect } from 'react';
import {
  getAdminAppointments,
  updateAppointmentStatus,
  CLINIC_DOCTORS,
  AVAILABLE_SLOTS,
  sendSlipEmail,
  getWhatsAppBookingLink
} from '../services/api';
import { generateSlipPdf } from '../utils/generateSlipPdf';

const DEFAULT_PIN = '4892'; // Clinic Staff Access PIN

export default function AdminLedger() {
  const [token, setToken] = useState(() => sessionStorage.getItem('sdc_admin_token') || '');
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Data & Filters
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Slot Management modal / toggle state
  const [blockDoctor, setBlockDoctor] = useState(CLINIC_DOCTORS[0].name);
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockSlot, setBlockSlot] = useState(AVAILABLE_SLOTS[0]);
  const [blockMessage, setBlockMessage] = useState('');

  // Notification / Action status
  const [actionNotice, setActionNotice] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === DEFAULT_PIN || pinInput.trim() === 'SDC-ADMIN-2026') {
      const generatedToken = 'sdc_token_' + Date.now();
      sessionStorage.setItem('sdc_admin_token', generatedToken);
      setToken(generatedToken);
      setAuthError('');
    } else {
      setAuthError('Invalid clinic access PIN. Use standard pass 4892.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sdc_admin_token');
    setToken('');
  };

  const fetchLedger = () => {
    if (!token) return;
    setIsLoading(true);
    getAdminAppointments(token, {
      search,
      status: statusFilter,
      doctor: doctorFilter === 'All' ? '' : doctorFilter,
      date: dateFilter
    })
      .then(res => {
        setAppointments(res.appointments || []);
      })
      .catch(err => {
        console.error('Failed to load appointments', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (token) {
      fetchLedger();
    }
  }, [token, search, statusFilter, doctorFilter, dateFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAppointmentStatus(token, id, newStatus);
      setActionNotice(`Updated record #${id} to ${newStatus}`);
      fetchLedger();
      setTimeout(() => setActionNotice(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update record');
    }
  };

  const handleDownloadPdf = async (booking) => {
    try {
      setActionNotice(`Generating PDF for ${booking.ref_code}...`);
      const pdf = await generateSlipPdf(booking);
      pdf.download(`SDC_Slip_${booking.ref_code}.pdf`);
      setActionNotice(`Downloaded ${booking.ref_code} slip.`);
      setTimeout(() => setActionNotice(''), 3000);
    } catch (err) {
      console.error('PDF error', err);
      alert('Could not compile PDF slip.');
    }
  };

  const handleEmailSlip = async (booking) => {
    if (!booking.email) {
      alert(`No email recorded for ${booking.patient_name}`);
      return;
    }
    try {
      setActionNotice(`Dispatching slip to ${booking.email}...`);
      const pdf = await generateSlipPdf(booking);
      const res = await sendSlipEmail({
        email: booking.email,
        pdfBase64: pdf.base64,
        refCode: booking.ref_code,
        patientName: booking.patient_name,
        doctor: booking.doctor,
        treatment: booking.treatment,
        date: booking.date,
        timeSlot: booking.time_slot
      });
      setActionNotice(res.message || `Dispatched to ${booking.email}`);
      setTimeout(() => setActionNotice(''), 4000);
    } catch (err) {
      console.error('Email error', err);
      alert('Email dispatch could not be confirmed.');
    }
  };

  const handleBlockSlot = () => {
    // Add dummy booked slot to simulate blocking
    try {
      const blockedStore = JSON.parse(localStorage.getItem('sdc_blocked_slots') || '[]');
      const alreadyBlocked = blockedStore.some(
        b => b.doctor === blockDoctor && b.date === blockDate && b.time_slot === blockSlot
      );
      if (alreadyBlocked) {
        setBlockMessage(`Slot ${blockSlot} on ${blockDate} for ${blockDoctor} is already reserved/blocked.`);
        return;
      }
      blockedStore.push({
        id: Date.now(),
        doctor: blockDoctor,
        date: blockDate,
        time_slot: blockSlot,
        reason: 'Surgical Block / Leave'
      });
      localStorage.setItem('sdc_blocked_slots', JSON.stringify(blockedStore));
      setBlockMessage(`Successfully blocked slot ${blockSlot} for ${blockDoctor}.`);
      fetchLedger();
      setTimeout(() => setBlockMessage(''), 4000);
    } catch (e) {
      console.error('Block slot error', e);
    }
  };

  // Compute stat metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysCount = appointments.filter(a => a.date === todayStr).length;
  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const inChairCount = appointments.filter(a => a.status === 'In-Chair').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;

  // PIN Gate Screen
  if (!token) {
    return (
      <div className="admin-viewport">
        <div className="admin-auth-panel">
          <div style={{ borderBottom: 'var(--hairline-rule)', paddingBottom: '1rem' }}>
            <h1 className="serif-heading" style={{ fontSize: '1.75rem' }}>
              Clinical Day-Sheet
            </h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-400)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              Authorized Desk &amp; Operatory Ledger
            </div>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {authError && (
              <div style={{ color: 'var(--clinical-red)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                {authError}
              </div>
            )}
            <div className="form-field-group">
              <label className="form-field-label">
                <span>Enter Staff Access PIN</span>
              </label>
              <input
                type="password"
                maxLength={16}
                placeholder="Staff PIN (Use 4892)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="form-field-input"
                autoFocus
              />
            </div>
            <button type="submit" className="drawer-btn-primary">
              Unlock Ledger Day-Sheet →
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <a href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-600)' }}>
                ← Return to Public Journal
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-viewport" aria-label="Admin Clinical Ledger">
      {/* Header Strip */}
      <header className="admin-header-strip">
        <div className="admin-brand">
          <h1 className="serif-heading">Operatory Day-Sheet</h1>
          <span>CLINICAL SURGERY LEDGER — SDC REGISTRY</span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {actionNotice && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--clinical-red)', fontWeight: 600 }}>
              {actionNotice}
            </span>
          )}
          <a href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--surgical-blue)', textDecoration: 'underline' }}>
            ← Public Journal
          </a>
          <button
            type="button"
            onClick={handleLogout}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-400)' }}
          >
            [Lock Desk]
          </button>
        </div>
      </header>

      {/* Stat Strip: Large monospaced numerals separated by hairlines */}
      <div className="admin-stat-strip">
        <div className="admin-stat-cell">
          <span className="admin-stat-num">{todaysCount}</span>
          <span className="admin-stat-label">Today's Appointments</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted-400)' }}>
            Scheduled for {todayStr}
          </span>
        </div>

        <div className="admin-stat-cell">
          <span className="admin-stat-num" style={{ color: '#D97706' }}>{pendingCount}</span>
          <span className="admin-stat-label">Pending Confirmation</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted-400)' }}>
            Requires reception triage
          </span>
        </div>

        <div className="admin-stat-cell">
          <span className="admin-stat-num" style={{ color: 'var(--surgical-blue)' }}>{inChairCount}</span>
          <span className="admin-stat-label">In-Chair Active</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted-400)' }}>
            Currently in operatory
          </span>
        </div>

        <div className="admin-stat-cell">
          <span className="admin-stat-num">{completedCount}</span>
          <span className="admin-stat-label">Completed Sessions</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted-400)' }}>
            Archived records
          </span>
        </div>
      </div>

      {/* Filterable Ledger Toolbar */}
      <div className="admin-filters-bar">
        <input
          type="text"
          placeholder="Search patient, phone, or ref code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-filter-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-filter-input"
          style={{ minWidth: '150px' }}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="In-Chair">In-Chair</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          className="admin-filter-input"
          style={{ minWidth: '170px' }}
        >
          <option value="All">All Clinicians</option>
          {CLINIC_DOCTORS.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="admin-filter-input"
          style={{ minWidth: '150px' }}
        />

        {dateFilter && (
          <button
            type="button"
            onClick={() => setDateFilter('')}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--clinical-red)' }}
          >
            Clear Date Filter ✕
          </button>
        )}
      </div>

      {/* Clinical Ledger Table */}
      <div className="ledger-table-wrap" style={{ border: 'var(--hairline-rule)', marginBottom: '3rem' }}>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>REF CODE</th>
              <th>SCHEDULED DATE &amp; SLOT</th>
              <th>PATIENT IDENTIFICATION</th>
              <th>PROCEDURE / DISCIPLINE</th>
              <th>SPECIALIST</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', fontFamily: 'var(--font-mono)' }}>
                  Loading day-sheet records...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', fontFamily: 'var(--font-mono)', color: 'var(--muted-400)' }}>
                  No clinical appointments matching current filter parameters.
                </td>
              </tr>
            ) : (
              appointments.map(apt => (
                <tr key={apt.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--clinical-red)' }}>
                      {apt.ref_code}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{apt.time_slot}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-400)' }}>{apt.date}</div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600 }}>{apt.patient_name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-600)' }}>
                      {apt.phone} {apt.email ? `• ${apt.email}` : ''}
                    </div>
                    {apt.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-400)', fontStyle: 'italic', marginTop: '2px' }}>
                        Note: {apt.notes}
                      </div>
                    )}
                  </td>

                  <td style={{ fontSize: '0.85rem' }}>
                    {apt.treatment}
                  </td>

                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--slate-800)' }}>
                    {apt.doctor}
                  </td>

                  <td>
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                      className={`status-tag status-tag-${apt.status.toLowerCase().replace(/\s+/g, '-')}`}
                      style={{ border: '1px solid var(--hairline)', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In-Chair">In-Chair</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                      {/* WhatsApp trigger */}
                      <a
                        href={getWhatsAppBookingLink(apt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="slot-button"
                        style={{ padding: '4px 8px', fontSize: '0.7rem', color: '#1B4332', backgroundColor: '#E2ECE9' }}
                        title="Dispatch WhatsApp Confirmation"
                      >
                        WhatsApp
                      </a>

                      {/* Download PDF */}
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(apt)}
                        className="slot-button"
                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        title="Download A4 PDF Slip"
                      >
                        PDF
                      </button>

                      {/* Email Slip */}
                      {apt.email && (
                        <button
                          type="button"
                          onClick={() => handleEmailSlip(apt)}
                          className="slot-button"
                          style={{ padding: '4px 8px', fontSize: '0.7rem', color: 'var(--surgical-blue)' }}
                          title="Dispatch Slip to Patient Email"
                        >
                          Email
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Operatory Slot Management Panel */}
      <div style={{ border: 'var(--hairline-rule)', backgroundColor: 'var(--paper-white)', padding: '2rem' }}>
        <h3 className="serif-heading" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
          Operatory Slot Availability &amp; Doctor Leave Management
        </h3>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-400)', marginBottom: '1.5rem' }}>
          BLOCK OR RESERVE TIME SLOTS FOR SURGICAL PREPARATION, LEAVE OR STERILIZATION MAINTENANCE
        </p>

        {blockMessage && (
          <div style={{ backgroundColor: 'var(--sage-bg)', color: 'var(--sage-text)', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: '1rem' }}>
            {blockMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-field-group">
            <label className="form-field-label">Specialist Doctor</label>
            <select
              value={blockDoctor}
              onChange={(e) => setBlockDoctor(e.target.value)}
              className="form-field-input"
              style={{ width: '220px' }}
            >
              {CLINIC_DOCTORS.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field-group">
            <label className="form-field-label">Date</label>
            <input
              type="date"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              className="form-field-input"
              style={{ width: '180px' }}
            />
          </div>

          <div className="form-field-group">
            <label className="form-field-label">Time Slot</label>
            <select
              value={blockSlot}
              onChange={(e) => setBlockSlot(e.target.value)}
              className="form-field-input"
              style={{ width: '160px' }}
            >
              {AVAILABLE_SLOTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleBlockSlot}
            className="drawer-btn-secondary"
            style={{ padding: '0.75rem 1.25rem', height: '42px' }}
          >
            Block / Lock Slot ⚿
          </button>
        </div>
      </div>
    </div>
  );
}
