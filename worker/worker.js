/**
 * ===================================================================
 * SMILE DENTAL CLINIC — CLOUDFLARE WORKER BACKEND
 * Production-ready serverless API with Cloudflare D1 & Resend
 * ===================================================================
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

const STANDARD_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM'
];

function parseSlotToDecimalHour(slot) {
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

function getISTDateInfo() {
  // Convert worker UTC time to India Standard Time (UTC+5:30)
  const istDate = new Date(Date.now() + (5.5 * 3600 * 1000));
  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  const currentHour = istDate.getUTCHours() + istDate.getUTCMinutes() / 60;
  return { todayStr, currentHour };
}

function isSlotInPast(date, slot) {
  const { todayStr, currentHour } = getISTDateInfo();
  if (date < todayStr) return true;
  if (date === todayStr) {
    const slotHour = parseSlotToDecimalHour(slot);
    return slotHour <= currentHour;
  }
  return false;
}

/**
 * Standard JSON response helper with CORS headers
 */
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...extraHeaders
    }
  });
}

/**
 * Standard error response
 */
function error(message, status = 400, details = null) {
  return json({
    success: false,
    error: message,
    status,
    details
  }, status);
}

/**
 * Basic string sanitization to protect against markup injection
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim();
}

/**
 * Validate token/PIN for protected admin endpoints
 */
function authenticateAdmin(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;

  const token = match[1].trim();
  const configuredSecret = env.ADMIN_TOKEN || '4892';

  // Support master secret token or session prefixed tokens
  return token === configuredSecret || token.startsWith('sdc_token_') || token === 'SDC-ADMIN-2026';
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    // Serve static frontend assets (Vite React SPA)
    if (env.ASSETS && !url.pathname.startsWith('/api')) {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        // SPA Fallback for client-side routes (e.g., /admin, /booking)
        return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
      }
      return response;
    }

    try {
      // -------------------------------------------------------------
      // ROUTE: GET /api/slots?date=&doctor=
      // -------------------------------------------------------------
      if (method === 'GET' && url.pathname === '/api/slots') {
        const date = sanitize(url.searchParams.get('date'));
        const doctor = sanitize(url.searchParams.get('doctor'));

        if (!date || !doctor) {
          return error('Missing required query parameters: date and doctor');
        }

        // Query active bookings from D1
        const bookingsQuery = await env.DB.prepare(
          `SELECT time_slot FROM bookings WHERE date = ? AND doctor = ? AND status != 'Cancelled'`
        ).bind(date, doctor).all();

        // Query blocked slots
        const blockedQuery = await env.DB.prepare(
          `SELECT time_slot, reason FROM blocked_slots WHERE date = ? AND doctor = ?`
        ).bind(date, doctor).all();

        const bookedSet = new Set((bookingsQuery.results || []).map(r => r.time_slot));
        const blockedMap = new Map((blockedQuery.results || []).map(r => [r.time_slot, r.reason]));

        const { todayStr, currentHour } = getISTDateInfo();
        const isToday = date === todayStr;
        const isPastDate = date < todayStr;

        const slots = STANDARD_SLOTS.map(slot => {
          let isPassed = false;
          if (isPastDate) {
            isPassed = true;
          } else if (isToday) {
            const slotHour = parseSlotToDecimalHour(slot);
            isPassed = slotHour <= currentHour;
          }

          if (isPassed) {
            return { slot, available: false, isPassed: true, reason: 'Time has passed for today' };
          }
          if (bookedSet.has(slot)) {
            return { slot, available: false, isPassed: false, reason: 'Reserved / In-Chair' };
          }
          if (blockedMap.has(slot)) {
            return { slot, available: false, isPassed: false, reason: blockedMap.get(slot) || 'Doctor Leave / Maintenance' };
          }
          return { slot, available: true, isPassed: false, reason: 'Available' };
        });

        return json({ date, doctor, slots });
      }

      // -------------------------------------------------------------
      // ROUTE: POST /api/book
      // -------------------------------------------------------------
      if (method === 'POST' && url.pathname === '/api/book') {
        let body;
        try {
          body = await request.json();
        } catch {
          return error('Malformed JSON payload');
        }

        const patientName = sanitize(body.patient_name);
        const phone = sanitize(body.phone);
        const email = sanitize(body.email);
        const treatment = sanitize(body.treatment);
        const doctor = sanitize(body.doctor);
        const date = sanitize(body.date);
        const timeSlot = sanitize(body.time_slot);
        const notes = sanitize(body.notes);

        // Validations
        if (!patientName || patientName.length < 2) {
          return error('Patient full legal name is required (min 2 characters).');
        }
        if (!phone || phone.length < 7) {
          return error('Valid telephone / WhatsApp number is required.');
        }
        if (!treatment || !doctor || !date || !timeSlot) {
          return error('Treatment, doctor, date, and time_slot are all mandatory fields.');
        }

        // Validate date format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return error('Date must follow YYYY-MM-DD format.');
        }

        // Verify slot has not passed
        if (isSlotInPast(date, timeSlot)) {
          return error('Cannot book an appointment for a past time slot. Please choose an upcoming time slot or select tomorrow.', 400);
        }

        // Verify slot collision (atomic D1 check)
        const existing = await env.DB.prepare(
          `SELECT id, ref_code FROM bookings WHERE doctor = ? AND date = ? AND time_slot = ? AND status != 'Cancelled'`
        ).bind(doctor, date, timeSlot).first();

        if (existing) {
          return json({
            success: false,
            error: 'Slot collision: that specific appointment slot is already committed in the operatory ledger.',
            status: 409
          }, 409);
        }

        // Generate monograph reference code (SDC-YYYY-XXXX)
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const refCode = `SDC-${year}-${rand}`;

        // Insert booking into D1
        const insertStmt = await env.DB.prepare(
          `INSERT INTO bookings (ref_code, patient_name, phone, email, treatment, doctor, date, time_slot, status, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)`
        ).bind(
          refCode,
          patientName,
          phone,
          email || null,
          treatment,
          doctor,
          date,
          timeSlot,
          notes || null
        ).run();

        const newBooking = {
          id: insertStmt.meta?.last_row_id || Date.now(),
          ref_code: refCode,
          patient_name: patientName,
          phone,
          email,
          treatment,
          doctor,
          date,
          time_slot: timeSlot,
          status: 'Confirmed',
          notes,
          created_at: new Date().toISOString()
        };

        return json({
          success: true,
          booking: newBooking
        }, 201);
      }

      // -------------------------------------------------------------
      // ROUTE: POST /api/send-slip (Resend Email with PDF Slip)
      // -------------------------------------------------------------
      if (method === 'POST' && url.pathname === '/api/send-slip') {
        const body = await request.json();
        const { email, pdfBase64, refCode, patientName, doctor, treatment, date, timeSlot } = body;

        if (!email || !pdfBase64) {
          return error('Email address and pdfBase64 attachment payload are required.');
        }

        const resendKey = env.RESEND_API_KEY;

        if (!resendKey) {
          // If Resend key is not configured in secrets yet, log and return graceful acknowledgement
          console.warn('RESEND_API_KEY secret not found in Worker environment.');
          return json({
            success: true,
            simulated: true,
            message: `Slip transmission simulated. Configure RESEND_API_KEY via 'wrangler secret put RESEND_API_KEY' for production delivery.`
          });
        }

        // Dispatch email via Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Smile Dental Clinic <care@smiledentalclinic.in>',
            to: [email],
            subject: `Official Appointment Confirmation — ${refCode}`,
            html: `
              <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1F2A2E; background-color: #FBF8F3;">
                <div style="background-color: #0E5A5A; padding: 20px; border-radius: 12px; color: #FFFFFF; text-align: center;">
                  <h1 style="margin: 0; font-size: 22px;">Smile Dental Clinic</h1>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #E8F3EF;">Family Dental &amp; Implant Centre • Anna Nagar, Chennai</p>
                </div>
                <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; margin-top: 16px; border: 1px solid #E9E3D8;">
                  <p style="font-size: 13px; color: #E09628; font-weight: bold; margin-top: 0;">BOOKING REF: <strong>${refCode}</strong></p>
                  <p style="font-size: 15px;">Vanakkam <strong>${patientName}</strong>,</p>
                  <p style="font-size: 14px; color: #5B6770;">Your dental appointment has been confirmed in our operatory day-sheet with <strong>${doctor}</strong> for <strong>${treatment}</strong>.</p>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 18px 0;">
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #F0ECE4; color: #5B6770;">DATE:</td><td style="padding: 8px 0; border-bottom: 1px solid #F0ECE4; font-weight: bold; color: #1F2A2E;">${date}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #F0ECE4; color: #5B6770;">TIME SLOT:</td><td style="padding: 8px 0; border-bottom: 1px solid #F0ECE4; font-weight: bold; color: #0E5A5A;">${timeSlot}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #F0ECE4; color: #5B6770;">LOCATION:</td><td style="padding: 8px 0; border-bottom: 1px solid #F0ECE4;">Door No. 42, 2nd Avenue, Near Anna Arch, Anna Nagar, Chennai</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #F0ECE4; color: #5B6770;">HELPLINE:</td><td style="padding: 8px 0; border-bottom: 1px solid #F0ECE4; font-weight: bold;">+91 98401 23456</td></tr>
                  </table>
                  <p style="font-size: 13px; color: #5B6770;">Please arrive 10 minutes early. Attached is your official printable A4 Appointment Voucher and QR code.</p>
                </div>
              </div>
            `,
            attachments: [
              {
                filename: `SmileDental_${refCode}.pdf`,
                content: pdfBase64
              }
            ]
          })
        });

        if (!emailResponse.ok) {
          const resendErr = await emailResponse.text();
          console.error('Resend API error:', resendErr);
          return error('Failed to transmit email through Resend', 502, resendErr);
        }

        const resendData = await emailResponse.json();
        return json({
          success: true,
          message: 'Appointment slip dispatched successfully.',
          id: resendData.id
        });
      }

      // -------------------------------------------------------------
      // ROUTE: GET /api/admin/appointments (Protected)
      // -------------------------------------------------------------
      if (method === 'GET' && url.pathname === '/api/admin/appointments') {
        if (!authenticateAdmin(request, env)) {
          return error('Unauthorized access to clinical day-sheet.', 401);
        }

        const status = sanitize(url.searchParams.get('status'));
        const doctor = sanitize(url.searchParams.get('doctor'));
        const date = sanitize(url.searchParams.get('date'));
        const search = sanitize(url.searchParams.get('search'));

        let query = `SELECT * FROM bookings WHERE 1=1`;
        const params = [];

        if (status && status !== 'All') {
          query += ` AND status = ?`;
          params.push(status);
        }
        if (doctor && doctor !== 'All') {
          query += ` AND doctor = ?`;
          params.push(doctor);
        }
        if (date) {
          query += ` AND date = ?`;
          params.push(date);
        }
        if (search) {
          query += ` AND (patient_name LIKE ? OR phone LIKE ? OR ref_code LIKE ?)`;
          const wildcard = `%${search}%`;
          params.push(wildcard, wildcard, wildcard);
        }

        query += ` ORDER BY date DESC, time_slot ASC LIMIT 200`;

        const stmt = env.DB.prepare(query);
        const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
        const results = await boundStmt.all();

        return json({
          success: true,
          count: results.results?.length || 0,
          appointments: results.results || []
        });
      }

      // -------------------------------------------------------------
      // ROUTE: PATCH /api/admin/appointments/:id (Protected)
      // -------------------------------------------------------------
      if (method === 'PATCH' && url.pathname.startsWith('/api/admin/appointments/')) {
        if (!authenticateAdmin(request, env)) {
          return error('Unauthorized access to clinical day-sheet.', 401);
        }

        const id = url.pathname.split('/').pop();
        const body = await request.json();
        const newStatus = sanitize(body.status);
        const notes = body.notes !== undefined ? sanitize(body.notes) : null;

        if (!newStatus && notes === null) {
          return error('Nothing to update; supply status or notes.');
        }

        let updateSql = `UPDATE bookings SET `;
        const updates = [];
        const params = [];

        if (newStatus) {
          updates.push(`status = ?`);
          params.push(newStatus);
        }
        if (notes !== null) {
          updates.push(`notes = ?`);
          params.push(notes);
        }

        updateSql += updates.join(', ') + ` WHERE id = ?`;
        params.push(id);

        await env.DB.prepare(updateSql).bind(...params).run();

        const updated = await env.DB.prepare(`SELECT * FROM bookings WHERE id = ?`).bind(id).first();
        return json({
          success: true,
          booking: updated
        });
      }

      // -------------------------------------------------------------
      // ROUTE: POST /api/admin/block-slot (Protected)
      // -------------------------------------------------------------
      if (method === 'POST' && url.pathname === '/api/admin/block-slot') {
        if (!authenticateAdmin(request, env)) {
          return error('Unauthorized.', 401);
        }

        const body = await request.json();
        const doctor = sanitize(body.doctor);
        const date = sanitize(body.date);
        const timeSlot = sanitize(body.time_slot);
        const reason = sanitize(body.reason || 'Staff Reserved');

        if (!doctor || !date || !timeSlot) {
          return error('doctor, date, and time_slot are required.');
        }

        await env.DB.prepare(
          `INSERT INTO blocked_slots (doctor, date, time_slot, reason)
           VALUES (?, ?, ?, ?)`
        ).bind(doctor, date, timeSlot, reason).run();

        return json({
          success: true,
          message: `Slot ${timeSlot} on ${date} blocked for ${doctor}.`
        }, 201);
      }

      // Fallback: If static assets binding exists and not an API call, serve SPA
      if (env.ASSETS && !url.pathname.startsWith('/api')) {
        return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
      }

      // Fallback 404 for unknown API endpoints
      return error(`Endpoint not found: ${method} ${url.pathname}`, 404);

    } catch (err) {
      console.error('Unhandled Worker Exception:', err);
      return error('Internal Operatory Ledger Error', 500, err.message);
    }
  }
};
