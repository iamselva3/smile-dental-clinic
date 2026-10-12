import React, { useState, useEffect } from 'react';
import { getSlots, getLocalDateString } from '../services/api';

/**
 * StatusTicker: Thin status ticker fixed above the page.
 * Shows:
 * - Open now / Closed (computed dynamically based on Mon-Sat 08:30 - 19:30)
 * - Today's date formatted in monograph journal notation
 * - Live next free slot (opens the booking drawer)
 * - Subtle link to Clinical Day-Sheet (/admin)
 */
export default function StatusTicker({ onOpenBooking }) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [nextSlot, setNextSlot] = useState('Today, 04:00 PM');

  useEffect(() => {
    // Determine clinic open/closed status
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday
    const hour = now.getHours();
    const min = now.getMinutes();
    const decimalTime = hour + min / 60;

    // Clinic hours: Mon-Sat 08:30 - 19:30
    const clinicOpen = day !== 0 && decimalTime >= 8.5 && decimalTime < 19.5;
    setIsOpen(clinicOpen);

    // Format current date
    const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
    setCurrentDateStr(now.toLocaleDateString('en-GB', options));

    // Fetch next available slot
    const dateStr = getLocalDateString(now);
    getSlots(dateStr, 'Dr. K. Rajesh')
      .then(res => {
        const available = res.slots.find(s => s.available);
        if (available) {
          setNextSlot(`Today, ${available.slot}`);
        } else {
          setNextSlot('Tomorrow, 09:00 AM');
        }
      })
      .catch(() => {
        setNextSlot('Next slot: 04:00 PM');
      });
  }, []);

  return (
    <aside className="status-ticker" aria-label="Clinic Status Ticker">
      <div className="ticker-left">
        <div className={`clinic-status-badge ${isOpen ? 'status-open' : 'status-closed'}`}>
          <span className="status-dot"></span>
          <span>{isOpen ? 'Operatory Open' : 'Operatory Closed (On-Call Active)'}</span>
        </div>
        <span className="ticker-divider">/</span>
        <span className="tabular">{currentDateStr}</span>
      </div>

      <div className="ticker-right">
        <button
          type="button"
          className="ticker-slot-ticket"
          onClick={() => onOpenBooking()}
          title="Click to claim next available appointment"
        >
          <span>Next Free Slot:</span>
          <strong>{nextSlot}</strong>
          <span>→</span>
        </button>
        <span className="ticker-divider">/</span>
        <a href="/admin" className="ticker-admin-link" title="Authorized Clinical Staff Access">
          Ledger / Day-Sheet
        </a>
      </div>
    </aside>
  );
}
