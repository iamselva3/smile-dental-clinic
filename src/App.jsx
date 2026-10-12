import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from './i18n/I18nContext';

import TopBar from './components/TopBar';
import MobileActionBar from './components/MobileActionBar';
import Hero from './components/Hero';
import TrustStrip from './components/TrustStrip';
import Treatments from './components/Treatments';
import ClinicPride from './components/ClinicPride';
import SmileStories from './components/SmileStories';
import Reviews from './components/Reviews';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import ClinicInfo from './components/ClinicInfo';
import BookingSheet from './components/BookingSheet';
import AdminDashboard from './components/AdminDashboard';

function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingParams, setBookingParams] = useState({
    treatment: '',
    doctor: '',
    date: '',
    phone: ''
  });

  const handleOpenBooking = (params = {}) => {
    setBookingParams({
      treatment: params.treatment || '',
      doctor: params.doctor || '',
      date: params.date || '',
      phone: params.phone || ''
    });
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  const handleSelectTreatment = (treatmentName, doctorName) => {
    handleOpenBooking({ treatment: treatmentName, doctor: doctorName });
  };

  const handleSelectDoctor = (doctorName) => {
    handleOpenBooking({ doctor: doctorName });
  };

  return (
    <div className="site-wrap">
      {/* Top Navigation Bar with Language Toggle & Call */}
      <TopBar onOpenBooking={() => handleOpenBooking()} />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero with QuickBook Card & Arch Frame */}
        <Hero onOpenBooking={(params) => handleOpenBooking(params)} />

        {/* 2. Trust Strip (Scrolling Badges) */}
        <TrustStrip />

        {/* 3. Treatments (Scroll-Snap Carousel / Grid) */}
        <Treatments onSelectTreatment={handleSelectTreatment} />

        {/* 4. Pride of the Clinic (Counters, Doctors, Why Choose Us) */}
        <ClinicPride onSelectDoctor={handleSelectDoctor} />

        {/* 5. Smile Stories (Before/After Comparative Slider) */}
        <SmileStories onSelectTreatment={handleSelectTreatment} />

        {/* 6. Patient Love (Google Reviews) */}
        <Reviews />

        {/* 7. How It Works (3 Steps) */}
        <HowItWorks onOpenBooking={() => handleOpenBooking()} />

        {/* 8. Pricing & EMI */}
        <Pricing onSelectTreatment={handleSelectTreatment} />

        {/* 9. FAQ Accordion */}
        <FAQ />

        {/* 10. Final CTA, Map & Clinic Info */}
        <ClinicInfo onOpenBooking={() => handleOpenBooking()} />
      </main>

      {/* Mobile Sticky Bottom Action Bar (Call | WhatsApp | Book) */}
      <MobileActionBar onOpenBooking={() => handleOpenBooking()} />

      {/* Booking Sheet (Bottom sheet on mobile / side panel on desktop) */}
      <BookingSheet
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        initialTreatment={bookingParams.treatment}
        initialDoctor={bookingParams.doctor}
        initialDate={bookingParams.date}
        initialPhone={bookingParams.phone}
      />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
