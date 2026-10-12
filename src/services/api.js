/**
 * API client service for Smile Dental Clinic.
 * Interfaces with Cloudflare Worker (/api/*) with seamless local fallback
 * for instant dev preview and offline resilience.
 */

import { CLINIC_CONFIG } from '../config';

const API_BASE = import.meta.env.VITE_WORKER_URL || '';

// LocalStorage Persistence Keys
const LS_BOOKINGS = 'sdc_bookings_store_warm';
const LS_BLOCKED = 'sdc_blocked_slots_warm';

export const ALL_TIME_SLOTS = [
  ...CLINIC_CONFIG.timeSlots.morning,
  ...CLINIC_CONFIG.timeSlots.afternoon,
  ...CLINIC_CONFIG.timeSlots.evening
];

export function getLocalDateString(d = new Date()) {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Seed initial realistic appointments if empty
function initializeMockStorage() {
  if (!localStorage.getItem(LS_BOOKINGS)) {
    const today = getLocalDateString(new Date());
    const initialBookings = [
      {
        id: 1,
        ref_code: 'SDC-2026-0412',
        patient_name: 'Suresh Ramanathan',
        phone: '+91 98401 55678',
        email: 'suresh.r@example.com',
        treatment: 'Dental Implants',
        doctor: 'Dr. K. Rajesh',
        date: today,
        time_slot: '10:00 AM',
        status: 'In-Chair',
        notes: 'Upper molar implant consultation and 3D CBCT review.',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 2,
        ref_code: 'SDC-2026-0413',
        patient_name: 'Meenakshi Sundaram',
        phone: '+91 98842 11990',
        email: 'meenakshi@example.com',
        treatment: 'Painless Root Canal',
        doctor: 'Dr. Priya Sundaram',
        date: today,
        time_slot: '03:00 PM',
        status: 'Confirmed',
        notes: 'Single sitting molar root canal therapy.',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 3,
        ref_code: 'SDC-2026-0399',
        patient_name: 'Karthik & Aarav (Child)',
        phone: '+91 97910 44321',
        email: 'karthik.v@example.com',
        treatment: 'Kids Dentistry',
        doctor: 'Dr. Ananya Ramesh',
        date: today,
        time_slot: '05:00 PM',
        status: 'Pending',
        notes: '6-year-old child routine checkup & fluoride protection.',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ];
    localStorage.setItem(LS_BOOKINGS, JSON.stringify(initialBookings));
  }

  if (!localStorage.getItem(LS_BLOCKED)) {
    localStorage.setItem(LS_BLOCKED, JSON.stringify([]));
  }
}

if (typeof window !== 'undefined') {
  initializeMockStorage();
}

export function parseSlotToDecimalHour(slot) {
  if (!slot || typeof slot !== 'string') return 0;
  const match = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h + m / 60;
}

export function isSlotInPast(date, slot) {
  const todayStr = getLocalDateString(new Date());

  if (date < todayStr) return true;
  if (date === todayStr) {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const slotHour = parseSlotToDecimalHour(slot);
    return slotHour <= currentHour;
  }
  return false;
}

/**
 * Fetch available time slots for a specific date and doctor.
 */
export async function getSlots(date, doctor) {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/slots?date=${encodeURIComponent(date)}&doctor=${encodeURIComponent(doctor || '')}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Worker API unreachable, utilizing local storage fallback', e);
    }
  }

  // Local storage fallback
  initializeMockStorage();
  const bookings = JSON.parse(localStorage.getItem(LS_BOOKINGS) || '[]');
  const blocked = JSON.parse(localStorage.getItem(LS_BLOCKED) || '[]');

  const bookedSlots = bookings
    .filter(b => b.date === date && (!doctor || doctor === 'Any Available Senior Doctor' || b.doctor === doctor) && b.status !== 'Cancelled')
    .map(b => b.time_slot);

  const blockedSlots = blocked
    .filter(b => b.date === date && (!doctor || doctor === 'Any Available Senior Doctor' || b.doctor === doctor))
    .map(b => b.time_slot);

  const occupied = new Set([...bookedSlots, ...blockedSlots]);

  const todayStr = getLocalDateString(new Date());
  const isToday = date === todayStr;
  const isPastDate = date < todayStr;
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  const slots = ALL_TIME_SLOTS.map(slot => {
    const isOccupied = occupied.has(slot);
    let isPassed = false;
    if (isPastDate) {
      isPassed = true;
    } else if (isToday) {
      const slotHour = parseSlotToDecimalHour(slot);
      isPassed = slotHour <= currentHour;
    }

    const available = !isOccupied && !isPassed;
    let reason = 'Available';
    if (isPassed) {
      reason = 'Time has passed for today';
    } else if (isOccupied) {
      reason = 'Reserved by Patient';
    }

    return {
      slot,
      available,
      isPassed,
      isOccupied,
      reason
    };
  });

  return {
    date,
    doctor,
    slots,
    allPassed: slots.every(s => s.isPassed),
    hasAvailableSlots: slots.some(s => s.available)
  };
}

/**
 * Create a new clinical appointment booking.
 */
export async function createBooking(bookingData) {
  // Reject past slots on today or earlier dates
  if (isSlotInPast(bookingData.date, bookingData.time_slot)) {
    const err = new Error('Cannot book an appointment for a past time slot. Please choose an upcoming time slot or select tomorrow.');
    err.status = 400;
    throw err;
  }

  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to confirm booking');
      }
      return data;
    } catch (e) {
      if (e.message && (e.message.includes('409') || e.message.includes('collision') || e.message.includes('already booked') || e.message.includes('past'))) {
        throw e;
      }
      console.warn('Worker API fallback', e);
    }
  }

  // Local storage simulation
  initializeMockStorage();
  const bookings = JSON.parse(localStorage.getItem(LS_BOOKINGS) || '[]');

  // Check collision
  const collision = bookings.find(
    b => b.doctor === bookingData.doctor &&
         b.date === bookingData.date &&
         b.time_slot === bookingData.time_slot &&
         b.status !== 'Cancelled'
  );

  if (collision) {
    const err = new Error('Slot collision: That specific slot has just been reserved. Please pick another time.');
    err.status = 409;
    throw err;
  }

  const year = new Date().getFullYear();
  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  const refCode = `SDC-${year}-${randSuffix}`;

  const newBooking = {
    id: Date.now(),
    ref_code: refCode,
    patient_name: bookingData.patient_name,
    phone: bookingData.phone,
    email: bookingData.email || '',
    treatment: bookingData.treatment,
    doctor: bookingData.doctor,
    date: bookingData.date,
    time_slot: bookingData.time_slot,
    status: 'Confirmed',
    notes: bookingData.notes || '',
    created_at: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  localStorage.setItem(LS_BOOKINGS, JSON.stringify(bookings));

  return {
    success: true,
    booking: newBooking
  };
}

/**
 * Dispatch confirmation email with PDF slip via Resend through Worker.
 */
export async function sendSlipEmail(emailPayload) {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/send-slip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to reach Worker email dispatch', e);
    }
  }

  return {
    success: true,
    message: `Appointment voucher dispatched to ${emailPayload.email} (Email delivery simulated in local preview).`
  };
}

/**
 * Fetch appointments for Admin Ledger.
 */
export async function getAdminAppointments(token, filters = {}) {
  if (API_BASE) {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.doctor) params.append('doctor', filters.doctor);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`${API_BASE}/api/admin/appointments?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Admin API unreachable, falling back to local storage', e);
    }
  }

  initializeMockStorage();
  let bookings = JSON.parse(localStorage.getItem(LS_BOOKINGS) || '[]');

  if (filters.doctor && filters.doctor !== 'All') {
    bookings = bookings.filter(b => b.doctor === filters.doctor);
  }
  if (filters.date) {
    bookings = bookings.filter(b => b.date === filters.date);
  }
  if (filters.status && filters.status !== 'All') {
    bookings = bookings.filter(b => b.status === filters.status);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    bookings = bookings.filter(b =>
      b.patient_name.toLowerCase().includes(s) ||
      b.phone.toLowerCase().includes(s) ||
      b.ref_code.toLowerCase().includes(s)
    );
  }

  return { appointments: bookings };
}

/**
 * Update appointment status in Admin Ledger.
 */
export async function updateAppointmentStatus(token, id, status, notes) {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Admin status update API fallback', e);
    }
  }

  initializeMockStorage();
  const bookings = JSON.parse(localStorage.getItem(LS_BOOKINGS) || '[]');
  const index = bookings.findIndex(b => String(b.id) === String(id));
  if (index !== -1) {
    if (status) bookings[index].status = status;
    if (notes !== undefined) bookings[index].notes = notes;
    localStorage.setItem(LS_BOOKINGS, JSON.stringify(bookings));
    return { success: true, booking: bookings[index] };
  }
  throw new Error('Appointment record not found');
}

/**
 * Generate a prefilled WhatsApp deep link URL.
 */
export function getWhatsAppBookingLink(booking) {
  const phone = CLINIC_CONFIG.whatsappNumber;
  const text = encodeURIComponent(
    `Vanakkam Smile Dental Clinic,\n\nI have booked an appointment on your website:\n- Ref No: ${booking.ref_code}\n- Patient Name: ${booking.patient_name}\n- Treatment: ${booking.treatment}\n- Doctor: ${booking.doctor}\n- Scheduled: ${booking.date} at ${booking.time_slot}\n\nPlease confirm my visit. Thank you!`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

/**
 * Generates an iCalendar (.ics) download for the patient to save on their iPhone/Android calendar.
 */
export function downloadCalendarEvent(booking) {
  const title = `Dental Appointment: ${booking.treatment} - Smile Dental Clinic`;
  const description = `Ref: ${booking.ref_code}\\nDoctor: ${booking.doctor}\\nLocation: ${CLINIC_CONFIG.address.line1}, ${CLINIC_CONFIG.locationName}\\nPhone: ${CLINIC_CONFIG.phone}`;
  const location = `${CLINIC_CONFIG.address.line1}, ${CLINIC_CONFIG.locationName}`;

  // Parse date and time into basic ISO format
  const dateParts = booking.date.split('-');
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  
  // Approximate start hour from slot, e.g., '10:00 AM'
  let hour = 10;
  if (booking.time_slot) {
    const match = booking.time_slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      hour = parseInt(match[1], 10);
      if (match[3].toUpperCase() === 'PM' && hour < 12) hour += 12;
      if (match[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
    }
  }

  const pad = (n) => String(n).padStart(2, '0');
  const dtStart = `${year}${month}${day}T${pad(hour)}0000`;
  const dtEnd = `${year}${month}${day}T${pad(hour + 1)}0000`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Smile Dental Clinic//Appointment Booking//EN',
    'BEGIN:VEVENT',
    `UID:${booking.ref_code}@smiledentalclinic.in`,
    `DTSTAMP:${year}${month}${day}T000000Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Appointment_${booking.ref_code}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
