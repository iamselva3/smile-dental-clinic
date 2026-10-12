/**
 * ===================================================================
 * SMILE DENTAL CLINIC — CENTRAL CONFIGURATION
 * All clinic details, phone numbers, doctors, pricing, and schedules.
 * Edit this file to update details across the entire website.
 * ===================================================================
 */

export const CLINIC_CONFIG = {
  name: 'Smile Dental Clinic',
  nameTamil: 'ஸ்மைல் பல் மருத்துவமனை',
  tagline: 'Family Dental & Implant Centre',
  taglineTamil: 'குடும்ப பல் & இம்ப்ளான்ட் சிறப்பு மையம்',
  
  // Contact details (South India / Chennai - Dummy Numbers)
  phone: '+91 99999 99999',
  phoneDisplay: '+91 99999 99999',
  phoneTel: '+919999999999',
  whatsappNumber: '919999999999',
  emergencyPhone: '+91 99999 99999',
  email: 'care@smiledentalclinic.in',
  
  // Location
  locationName: 'Anna Nagar, Chennai',
  address: {
    line1: 'Door No. 42, 2nd Avenue, Near Anna Arch',
    line2: 'Opposite Roundtana, Anna Nagar West',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600040',
    landmark: '5 mins walk from Anna Nagar Tower Metro Station'
  },
  googleMapsUrl: 'https://maps.google.com/?q=Anna+Nagar+Chennai+Dental',

  // Working Hours
  timings: {
    weekdays: 'Mon – Sat: 9:00 AM – 8:30 PM',
    sunday: 'Sun: 9:30 AM – 1:30 PM (Prior Appointment)',
    emergency: '24/7 On-Call Emergency Toothache & Trauma Support'
  },

  // Key Statistics & Trust Badges
  stats: {
    patientsTreated: '35,000+',
    implantsPlaced: '3,400+',
    yearsExperience: '20+',
    googleRating: '4.9',
    reviewCount: '1,480+'
  },

  // Doctors / Specialists
  doctors: [
    {
      id: 'dr-rajesh',
      name: 'Dr. K. Rajesh',
      degrees: 'BDS, MDS (Implantology)',
      role: 'Chief Dental Surgeon & Implantologist',
      experience: '20+ Years',
      languages: ['Tamil', 'English', 'Telugu'],
      photo: '/images/clinician_thorne.jpg',
      bio: 'Pioneer in computer-guided keyhole dental implants and immediate teeth replacement in South India.'
    },
    {
      id: 'dr-priya',
      name: 'Dr. Priya Sundaram',
      degrees: 'BDS, MDS (Endodontics)',
      role: 'Senior Endodontist & Smile Specialist',
      experience: '16+ Years',
      languages: ['Tamil', 'English', 'Malayalam'],
      photo: '/images/clinician_vance.jpg',
      bio: 'Specialist in single-visit painless root canal therapy under surgical magnification and biomimetic veneers.'
    },
    {
      id: 'dr-ananya',
      name: 'Dr. Ananya Ramesh',
      degrees: 'BDS, MDS (Pediatric Dentistry)',
      role: 'Consultant Pedodontist & Orthodontics',
      experience: '9+ Years',
      languages: ['Tamil', 'English'],
      photo: '/images/clinician_vance.jpg',
      bio: 'Dedicated to gentle, tear-free dental visits for children and modern invisible aligners for teenagers & adults.'
    }
  ],

  // Treatments with Transparent Pricing in INR (₹)
  treatments: [
    {
      id: 'implants',
      name: 'Dental Implants',
      nameTamil: 'பல் இம்ப்ளான்ட் சிகிச்சை',
      benefit: 'Permanent tooth replacement that feels and looks 100% natural',
      startingPrice: 18000,
      priceLabel: 'From ₹18,000',
      duration: '45 mins session',
      category: 'Surgical & Restorative',
      image: '/images/ceramic_crown_macro.jpg',
      defaultDoctor: 'Dr. K. Rajesh'
    },
    {
      id: 'root-canal',
      name: 'Painless Root Canal',
      nameTamil: 'வலியில்லா ரூட் கெனால்',
      benefit: 'Save your natural tooth in a single painless sitting with computer-controlled anesthesia',
      startingPrice: 3500,
      priceLabel: 'From ₹3,500',
      duration: 'Single 40-min visit',
      category: 'Painless Care',
      image: '/images/operatory_microscope.jpg',
      defaultDoctor: 'Dr. Priya Sundaram'
    },
    {
      id: 'veneers',
      name: 'Smile Makeover & Veneers',
      nameTamil: 'சிரிப்பு வடிவமைப்பு & வெனீயர்ஸ்',
      benefit: 'Ultra-thin handcrafted ceramic laminates to close gaps and brighten stained teeth',
      startingPrice: 6000,
      priceLabel: 'From ₹6,000 per tooth',
      duration: '2 visits',
      category: 'Aesthetics',
      image: '/images/case_after.jpg',
      defaultDoctor: 'Dr. Priya Sundaram'
    },
    {
      id: 'aligners',
      name: 'Braces & Invisible Aligners',
      nameTamil: 'கிளியர் அலைனர்ஸ் (கண்ணுக்குத் தெரியாத கிளிப்)',
      benefit: 'Straighten crooked teeth discreetly with 3D digital clear aligners without wire discomfort',
      startingPrice: 25000,
      priceLabel: 'From ₹25,000',
      duration: 'Monthly reviews',
      category: 'Orthodontics',
      image: '/images/case_after.jpg',
      defaultDoctor: 'Dr. Ananya Ramesh'
    },
    {
      id: 'kids',
      name: 'Kids Dentistry',
      nameTamil: 'குழந்தைகளுக்கான பல் மருத்துவம்',
      benefit: 'Gentle, fear-free dental visits with pre-numbed topical gels and kid-friendly storytelling',
      startingPrice: 800,
      priceLabel: 'From ₹800',
      duration: '30 mins session',
      category: 'Family & Pedodontics',
      image: '/images/autoclave_station.jpg',
      defaultDoctor: 'Dr. Ananya Ramesh'
    },
    {
      id: 'whitening',
      name: 'Teeth Cleaning & Whitening',
      nameTamil: 'பல் சுத்தம் & வெண்மையாக்குதல்',
      benefit: 'Gentle airflow stain removal and laser whitening for sparkling, fresh-smelling teeth',
      startingPrice: 1200,
      priceLabel: 'From ₹1,200',
      duration: '35 mins session',
      category: 'Preventive',
      image: '/images/case_before.jpg',
      defaultDoctor: 'Dr. Priya Sundaram'
    },
    {
      id: 'dentures',
      name: 'Precision Custom Dentures',
      nameTamil: 'முழு மற்றும் பகுதி செயற்கை பற்கள்',
      benefit: 'Comfortable, unbreakable flexible dentures for clear speech and joyful eating',
      startingPrice: 12000,
      priceLabel: 'From ₹12,000',
      duration: '3 visits',
      category: 'Restorative',
      image: '/images/ceramic_crown_macro.jpg',
      defaultDoctor: 'Dr. K. Rajesh'
    },
    {
      id: 'emergency',
      name: 'Emergency Dental Relief',
      nameTamil: 'அவசர பல் வலி சிகிச்சை',
      benefit: 'Same-day immediate appointment for severe pain, tooth breakage, or swollen gums',
      startingPrice: 500,
      priceLabel: 'From ₹500',
      duration: 'Immediate triage',
      category: 'Emergency',
      image: '/images/operatory_microscope.jpg',
      defaultDoctor: 'Dr. K. Rajesh'
    }
  ],

  // Operating Time Slots (Grouped by Morning / Afternoon / Evening)
  timeSlots: {
    morning: ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'],
    afternoon: ['02:00 PM', '03:00 PM', '04:00 PM'],
    evening: ['05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM']
  }
};
