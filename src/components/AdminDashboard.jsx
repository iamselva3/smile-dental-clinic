import React, { useState, useEffect } from 'react';
import {
  getAdminAppointments,
  updateAppointmentStatus,
  getWhatsAppBookingLink,
  sendSlipEmail,
  ALL_TIME_SLOTS
} from '../services/api';
import { generateSlipPdf } from '../utils/generateSlipPdf';
import { CLINIC_CONFIG } from '../config';

const DEFAULT_PIN = '4892';

export default function AdminDashboard() {
  const [token, setToken] = useState(() => sessionStorage.getItem('sdc_admin_token') || '');
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Data
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Slot Management state
  const [blockDoctor, setBlockDoctor] = useState(CLINIC_CONFIG.doctors[0].name);
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockSlot, setBlockSlot] = useState(ALL_TIME_SLOTS[0]);
  const [blockNotice, setBlockNotice] = useState('');

  // Action status message
  const [actionNotice, setActionNotice] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === DEFAULT_PIN || pinInput.trim() === 'SDC-ADMIN-2026') {
      const generated = 'sdc_token_' + Date.now();
      sessionStorage.setItem('sdc_admin_token', generated);
      setToken(generated);
      setAuthError('');
    } else {
      setAuthError('Invalid Staff PIN. Use standard pass: 4892');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sdc_admin_token');
    setToken('');
  };

  const fetchAppointments = () => {
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
        console.error('Failed to fetch admin appointments', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token, search, statusFilter, doctorFilter, dateFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAppointmentStatus(token, id, newStatus);
      setActionNotice(`Updated record to ${newStatus}`);
      fetchAppointments();
      setTimeout(() => setActionNotice(''), 3000);
    } catch (e) {
      alert(e.message || 'Could not update status');
    }
  };

  const handleDownloadPdf = async (apt) => {
    try {
      setActionNotice(`Compiling PDF for ${apt.ref_code}...`);
      const pdf = await generateSlipPdf(apt);
      pdf.download(`SmileDental_${apt.ref_code}.pdf`);
      setActionNotice(`Downloaded ${apt.ref_code} voucher.`);
      setTimeout(() => setActionNotice(''), 3000);
    } catch (e) {
      alert('Could not compile PDF');
    }
  };

  const handleEmailSlip = async (apt) => {
    if (!apt.email) {
      alert(`No email recorded for ${apt.patient_name}`);
      return;
    }
    try {
      setActionNotice(`Dispatching to ${apt.email}...`);
      const pdf = await generateSlipPdf(apt);
      const res = await sendSlipEmail({
        email: apt.email,
        pdfBase64: pdf.base64,
        refCode: apt.ref_code,
        patientName: apt.patient_name,
        doctor: apt.doctor,
        treatment: apt.treatment,
        date: apt.date,
        timeSlot: apt.time_slot
      });
      setActionNotice(res.message || 'Dispatched');
      setTimeout(() => setActionNotice(''), 4000);
    } catch {
      alert('Could not dispatch email.');
    }
  };

  const handleBlockSlot = () => {
    try {
      const blockedStore = JSON.parse(localStorage.getItem('sdc_blocked_slots_warm') || '[]');
      const already = blockedStore.some(
        b => b.doctor === blockDoctor && b.date === blockDate && b.time_slot === blockSlot
      );
      if (already) {
        setBlockNotice(`Slot ${blockSlot} on ${blockDate} is already blocked.`);
        return;
      }
      blockedStore.push({
        id: Date.now(),
        doctor: blockDoctor,
        date: blockDate,
        time_slot: blockSlot,
        reason: 'Staff Leave / Operatory Maintenance'
      });
      localStorage.setItem('sdc_blocked_slots_warm', JSON.stringify(blockedStore));
      setBlockNotice(`Blocked ${blockSlot} on ${blockDate} for ${blockDoctor}`);
      fetchAppointments();
      setTimeout(() => setBlockNotice(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Stat metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysCount = appointments.filter(a => a.date === todayStr).length;
  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const inChairCount = appointments.filter(a => a.status === 'In-Chair').length;

  if (!token) {
    return (
      <div className="admin-page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '420px', width: '100%', backgroundColor: 'var(--bg-white)', border: '1px solid var(--border-warm)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏥</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--primary-teal)' }}>
              Reception Desk Login
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Smile Dental Clinic Staff &amp; Day-Sheet Ledger
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {authError && (
              <div style={{ color: 'var(--status-cancelled)', fontSize: '0.85rem', fontWeight: 600 }}>
                {authError}
              </div>
            )}
            <div className="qb-field">
              <label className="qb-label">Enter Front Desk PIN</label>
              <input
                type="password"
                placeholder="Use default: 4892"
                className="qb-input"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn-pill-teal" style={{ width: '100%' }}>
              Unlock Reception Desk →
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <a href="/" style={{ fontSize: '0.82rem', color: 'var(--primary-teal)', textDecoration: 'underline' }}>
                ← Return to Patient Website
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Header Bar */}
      <div className="admin-header-bar">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--primary-teal)' }}>
            Reception Day-Sheet
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Smile Dental Clinic — Anna Nagar, Chennai
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {actionNotice && (
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-marigold-hover)' }}>
              {actionNotice}
            </span>
          )}
          <a href="/" className="btn-call-icon" style={{ width: 'auto', padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 700 }}>
            ← Patient Site
          </a>
          <button type="button" onClick={handleLogout} className="btn-call-icon" style={{ width: 'auto', padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', color: 'var(--status-cancelled)' }}>
            Lock Desk 🔒
          </button>
        </div>
      </div>

      {/* 4 Stat Tiles */}
      <div className="admin-stat-tiles">
        <div className="admin-stat-card">
          <span className="num">{todaysCount}</span>
          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Today's Patients</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Date: {todayStr}</span>
        </div>

        <div className="admin-stat-card">
          <span className="num" style={{ color: 'var(--status-pending)' }}>{pendingCount}</span>
          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Pending Confirmation</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Requires triage call</span>
        </div>

        <div className="admin-stat-card">
          <span className="num" style={{ color: 'var(--primary-teal)' }}>{inChairCount}</span>
          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Currently In-Chair</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active in operatory</span>
        </div>

        <div className="admin-stat-card">
          <span className="num" style={{ color: '#3730A3' }}>{completedCount}</span>
          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Completed Today</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Successful visits</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search patient, mobile, or ref code..."
          className="qb-input"
          style={{ maxWidth: '300px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          className="qb-input"
          style={{ maxWidth: '170px' }}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        <select
          className="qb-select"
          style={{ maxWidth: '160px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="In-Chair">In-Chair</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          className="qb-select"
          style={{ maxWidth: '180px' }}
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
        >
          <option value="All">All Doctors</option>
          {CLINIC_CONFIG.doctors.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        {dateFilter && (
          <button
            type="button"
            onClick={() => setDateFilter('')}
            style={{ fontSize: '0.82rem', color: 'var(--status-cancelled)', fontWeight: 700 }}
          >
            Clear Date ✕
          </button>
        )}
      </div>

      {/* Appointment Day-Sheet Table */}
      <div className="admin-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="pricing-table">
            <thead>
              <tr>
                <th>REF CODE</th>
                <th>SCHEDULE</th>
                <th>PATIENT DETAILS</th>
                <th>TREATMENT</th>
                <th>DOCTOR</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading appointment records...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No appointments found matching current filters.
                  </td>
                </tr>
              ) : (
                appointments.map(apt => (
                  <tr key={apt.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--accent-marigold-hover)' }}>
                        {apt.ref_code}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700 }}>{apt.time_slot}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{apt.date}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700 }}>{apt.patient_name}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--primary-teal)', fontWeight: 600 }}>
                        {apt.phone}
                      </div>
                      {apt.notes && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                          Note: {apt.notes}
                        </div>
                      )}
                    </td>

                    <td style={{ fontSize: '0.88rem' }}>
                      {apt.treatment}
                    </td>

                    <td style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {apt.doctor}
                    </td>

                    <td>
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                        className={`status-chip status-chip-${apt.status.toLowerCase().replace(/\s+/g, '-')}`}
                        style={{ border: '1px solid var(--border-warm)', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="In-Chair">In-Chair</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        {/* Call */}
                        <a
                          href={`tel:${apt.phone}`}
                          className="btn-call-icon"
                          style={{ width: '32px', height: '32px' }}
                          title="Call Patient"
                        >
                          📞
                        </a>

                        {/* WhatsApp */}
                        <a
                          href={getWhatsAppBookingLink(apt)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-call-icon"
                          style={{ width: '32px', height: '32px', backgroundColor: '#E8F7EE', color: '#128C7E' }}
                          title="Message on WhatsApp"
                        >
                          💬
                        </a>

                        {/* PDF */}
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(apt)}
                          className="btn-call-icon"
                          style={{ width: '32px', height: '32px' }}
                          title="Download PDF Slip"
                        >
                          📄
                        </button>

                        {/* Email */}
                        {apt.email && (
                          <button
                            type="button"
                            onClick={() => handleEmailSlip(apt)}
                            className="btn-call-icon"
                            style={{ width: '32px', height: '32px' }}
                            title="Email Slip"
                          >
                            ✉️
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
      </div>

      {/* Operatory Slot Management Panel */}
      <div style={{ backgroundColor: 'var(--bg-white)', border: '1px solid var(--border-warm)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--primary-teal)', marginBottom: '4px' }}>
          Slot Availability &amp; Doctor Leave Blocker
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Reserve time slots for surgical preparation, doctor holidays, or equipment maintenance.
        </p>

        {blockNotice && (
          <div style={{ backgroundColor: 'var(--bg-jasmine)', color: 'var(--primary-teal)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
            {blockNotice}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="qb-field" style={{ minWidth: '200px' }}>
            <label className="qb-label">Doctor</label>
            <select
              className="qb-select"
              value={blockDoctor}
              onChange={(e) => setBlockDoctor(e.target.value)}
            >
              {CLINIC_CONFIG.doctors.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="qb-field" style={{ minWidth: '160px' }}>
            <label className="qb-label">Date</label>
            <input
              type="date"
              className="qb-input"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
            />
          </div>

          <div className="qb-field" style={{ minWidth: '150px' }}>
            <label className="qb-label">Time Slot</label>
            <select
              className="qb-select"
              value={blockSlot}
              onChange={(e) => setBlockSlot(e.target.value)}
            >
              {ALL_TIME_SLOTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn-pill-teal"
            onClick={handleBlockSlot}
            style={{ height: '48px' }}
          >
            Block Slot 🔒
          </button>
        </div>
      </div>
    </div>
  );
}
