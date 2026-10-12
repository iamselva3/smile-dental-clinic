# Smile Dental Clinic — Deployment & Architecture Guide
### Family Dental & Implant Centre | South India

This platform is engineered as a serverless, mobile-first web application:
- **Frontend**: React (Vite) Single-Page Application with English + Tamil (`i18n`), pure custom CSS, and centralized `src/config.js`.
- **Backend API**: Cloudflare Worker (`worker/worker.js`) with **Cloudflare D1** SQLite database and **Resend** transactional email.

---

## 1. Centralized Configuration (`src/config.js`)
All clinic parameters are isolated in a single configuration file:
- **Clinic Name & Tamil translation**: "Smile Dental Clinic" / "ஸ்மைல் பல் மருத்துவமனை"
- **Contact & WhatsApp**: `+91 98401 23456` (`wa.me/919840123456`)
- **Address & Landmarks**: Door No. 42, 2nd Avenue, Near Anna Arch, Anna Nagar, Chennai - 600040
- **Doctors**: Name, qualifications, spoken languages (Tamil, English, Telugu, Malayalam), photos, and biographies.
- **Treatments**: Starting fees in ₹ INR, categories, and duration.
- **Operating Timings**: Weekday & Sunday schedule.

---

## 2. Cloudflare D1 Database Provisioning

### Step 2.1: Create D1 Database
```bash
npx wrangler d1 create sdc-db
```
Copy the resulting `database_id` into [wrangler.toml](file:///g:/Projects/Project/Clinic/wrangler.toml).

### Step 2.2: Execute Database Migrations
```bash
# Execute schema on Cloudflare D1
npx wrangler d1 execute sdc-db --remote --file=worker/schema.sql

# Or execute locally for offline testing:
npx wrangler d1 execute sdc-db --local --file=worker/schema.sql
```

---

## 3. Worker Secrets & Production Deployment

### Step 3.1: Configure Worker Secrets
```bash
# Set Resend API key for appointment voucher email dispatch
npx wrangler secret put RESEND_API_KEY

# Set front desk admin access PIN (defaults to 4892)
npx wrangler secret put ADMIN_TOKEN
```

### Step 3.2: Deploy Worker
```bash
npx wrangler deploy
```
The Worker will output your URL (e.g. `https://sdc-api.your-account.workers.dev`).

---

## 4. Frontend Build & Cloudflare Pages Deployment

### Step 4.1: Environment Variable
In `.env` or in Cloudflare Pages dashboard:
```env
VITE_WORKER_URL=https://sdc-api.your-account.workers.dev
```
*(If omitted, the app automatically runs in zero-config mode using local storage persistence).*

### Step 4.2: Build and Deploy
```bash
npm run build
npx wrangler pages deploy dist --project-name=smile-dental-clinic
```

---

## 5. Key Features Verified
1. **Language Switcher**: Toggle between English and Tamil (`EN | தமிழ்`) in the top bar. All typography adapts seamlessly with `Noto Sans Tamil`.
2. **Mobile Sticky Action Bar**: Bottom bar (`Call` | `WhatsApp` | `Book Now`) with large touch targets on mobile.
3. **Quick-Book in Hero**: 60-second booking form in the hero with direct slot selection.
4. **Phone-First Booking Sheet**: Bottom sheet on mobile / side panel on desktop with 3 visual steps.
5. **Branded Printable Slip**: A4 PDF download with QR code, email voucher, WhatsApp deep link, and Add to Calendar (`.ics`).
6. **Reception Staff Desk (`/admin`)**: Staff PIN gate (`4892`), stat tiles, date filters, WhatsApp confirmations, and slot blocker.
