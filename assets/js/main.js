/**
 * Catchme Cabs & Tours - Main JavaScript
 * Handles Navigation, Fare Estimator, WhatsApp Booking Generator,
 * Modal controls, FAQs, and Interactive Components.
 */

// Contact Numbers & Social Links
const COMPANY_CONFIG = {
  name: "Catchme Cabs & Tours",
  phone1: "+94768171844",
  phone1Display: "+94 76 817 1844",
  phone2: "+94770379002",
  phone2Display: "+94 77 037 9002",
  facebookUrl: "https://www.facebook.com/search/top?q=Catchme%20Cabs%20%26%20Tours",
  email: "contact@catchmecabs.com",
  baseRates: {
    // Approx rate per km in LKR
    sedan: { ratePerKm: 140, baseFare: 1500, label: "Standard Sedan (1-3 Pax)" },
    kdh_flat: { ratePerKm: 190, baseFare: 2500, label: "KDH Flat Roof Van (4-8 Pax)" },
    kdh_high: { ratePerKm: 230, baseFare: 3500, label: "KDH High Roof Luxury (8-14 Pax)" },
    suv: { ratePerKm: 250, baseFare: 4000, label: "Luxury SUV / 4x4 (1-4 Pax)" },
    coach: { ratePerKm: 420, baseFare: 8000, label: "Mini Coach Bus (15-28 Pax)" }
  },
  popularRoutes: {
    "airport-colombo": { from: "Bandaranaike Int. Airport (BIA)", to: "Colombo City Center", km: 35 },
    "airport-kandy": { from: "Bandaranaike Int. Airport (BIA)", to: "Kandy Cultural Capital", km: 105 },
    "airport-galle": { from: "Bandaranaike Int. Airport (BIA)", to: "Galle Fort / Unawatuna", km: 155 },
    "airport-bentota": { from: "Bandaranaike Int. Airport (BIA)", to: "Bentota / Beruwala", km: 110 },
    "airport-sigiriya": { from: "Bandaranaike Int. Airport (BIA)", to: "Sigiriya / Dambulla", km: 145 },
    "airport-ella": { from: "Bandaranaike Int. Airport (BIA)", to: "Ella Highlands", km: 210 },
    "colombo-galle": { from: "Colombo", to: "Galle Fort (Via Highway)", km: 125 },
    "colombo-kandy": { from: "Colombo", to: "Kandy", km: 115 },
    "kandy-nuwaraeliya": { from: "Kandy", to: "Nuwara Eliya (Little England)", km: 78 }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();
  initFareCalculator();
  initCallModal();
  initBookingModal();
  initFaqAccordion();
  initStatsCounter();
  initTourTabs();
  initDatePickers();
});

/* 1. Mobile Menu Toggle */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const closeBtn = document.getElementById('mobileMenuClose');
  const mobileMenu = document.getElementById('mobileMenu');
  const backdrop = document.getElementById('mobileMenuBackdrop');

  if (!toggleBtn || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.remove('translate-x-full');
    backdrop.classList.remove('hidden');
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.add('translate-x-full');
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');
    setTimeout(() => {
      backdrop.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }

  toggleBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);
}

/* 2. Header Sticky & Background Blur */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('shadow-md', 'py-2');
      header.classList.remove('py-4');
    } else {
      header.classList.remove('shadow-md', 'py-2');
      header.classList.add('py-4');
    }
  });
}

/* 3. Dynamic Fare Calculator */
function initFareCalculator() {
  const form = document.getElementById('fareEstimatorForm');
  if (!form) return;

  const routeSelect = document.getElementById('calcPopularRoute');
  const pickupInput = document.getElementById('calcPickup');
  const dropInput = document.getElementById('calcDropoff');
  const vehicleSelect = document.getElementById('calcVehicle');
  const resultCard = document.getElementById('calcResult');
  const estDistanceEl = document.getElementById('calcDistance');
  const estLkrEl = document.getElementById('calcFareLKR');
  const estUsdEl = document.getElementById('calcFareUSD');
  const bookViaWaBtn = document.getElementById('calcWhatsAppBtn');

  // Handle route dropdown autofill
  if (routeSelect) {
    routeSelect.addEventListener('change', (e) => {
      const selected = COMPANY_CONFIG.popularRoutes[e.target.value];
      if (selected) {
        pickupInput.value = selected.from;
        dropInput.value = selected.to;
        calculateFare(selected.km);
      } else {
        calculateFare(null);
      }
    });
  }

  form.addEventListener('input', () => {
    calculateFare();
  });

  function calculateFare(explicitKm = null) {
    const pickup = pickupInput.value.trim();
    const drop = dropInput.value.trim();
    const vehicleKey = vehicleSelect.value;
    const vehicle = COMPANY_CONFIG.baseRates[vehicleKey] || COMPANY_CONFIG.baseRates.sedan;

    if (!pickup || !drop) {
      if (resultCard) resultCard.classList.add('opacity-50');
      return;
    }

    if (resultCard) resultCard.classList.remove('opacity-50');

    // Approximate distance
    let estimatedKm = explicitKm;
    if (!estimatedKm) {
      // Estimate based on route string length heuristic or default 60km
      estimatedKm = Math.floor(Math.random() * (120 - 45 + 1) + 45);
      // Check popular route matches
      for (const key in COMPANY_CONFIG.popularRoutes) {
        const r = COMPANY_CONFIG.popularRoutes[key];
        if (pickup.toLowerCase().includes(r.from.toLowerCase().split(' ')[0]) && 
            drop.toLowerCase().includes(r.to.toLowerCase().split(' ')[0])) {
          estimatedKm = r.km;
          break;
        }
      }
    }

    const minFare = Math.round(vehicle.baseFare + (estimatedKm * vehicle.ratePerKm * 0.95));
    const maxFare = Math.round(vehicle.baseFare + (estimatedKm * vehicle.ratePerKm * 1.15));
    const approxLkr = `${minFare.toLocaleString()} - ${maxFare.toLocaleString()} LKR`;
    
    // Approx USD (1 USD ~ 305 LKR)
    const minUsd = Math.round(minFare / 305);
    const maxUsd = Math.round(maxFare / 305);
    const approxUsd = `$${minUsd} - $${maxUsd} USD`;

    if (estDistanceEl) estDistanceEl.textContent = `~${estimatedKm} KM`;
    if (estLkrEl) estLkrEl.textContent = approxLkr;
    if (estUsdEl) estUsdEl.textContent = approxUsd;

    // Setup WhatsApp direct booking link
    if (bookViaWaBtn) {
      const msg = `*Catchme Cabs & Tours - Ride Inquiry*%0A%0A` +
        `🚖 *Pickup:* ${encodeURIComponent(pickup)}%0A` +
        `📍 *Dropoff:* ${encodeURIComponent(drop)}%0A` +
        `🚗 *Vehicle:* ${encodeURIComponent(vehicle.label)}%0A` +
        `📏 *Est. Distance:* ~${estimatedKm} KM%0A` +
        `💰 *Est. Fare Range:* ${encodeURIComponent(approxLkr)} (${approxUsd})%0A%0A` +
        `Hello Catchme Cabs, I would like to check availability and book this ride. Please confirm the exact fare!`;

      // Set href to primary WhatsApp phone
      bookViaWaBtn.href = `https://wa.me/${COMPANY_CONFIG.phone1}?text=${msg}`;
    }
  }
}

/* 4. Hotline Dial Modal */
function initCallModal() {
  const callBtns = document.querySelectorAll('.trigger-call-modal');
  const modal = document.getElementById('callChooserModal');
  if (!modal) return;

  const closeBtns = modal.querySelectorAll('.close-call-modal');

  function openCallModal(e) {
    if (e) e.preventDefault();
    modal.classList.remove('modal-hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeCallModal() {
    modal.classList.add('modal-hidden');
    document.body.style.overflow = '';
  }

  callBtns.forEach(btn => btn.addEventListener('click', openCallModal));
  closeBtns.forEach(btn => btn.addEventListener('click', closeCallModal));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeCallModal();
  });
}

/* 5. Universal Booking Modal & WhatsApp Inquiry Form */
function initBookingModal() {
  const modal = document.getElementById('quickBookingModal');
  const openBtns = document.querySelectorAll('.trigger-booking-modal');
  if (!modal) return;

  const closeBtns = modal.querySelectorAll('.close-booking-modal');
  const form = document.getElementById('quickBookingForm');
  const vehicleField = document.getElementById('bookingVehicleField');
  const serviceField = document.getElementById('bookingServiceField');

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const presetVehicle = btn.getAttribute('data-vehicle');
      const presetService = btn.getAttribute('data-service');

      if (presetVehicle && vehicleField) {
        vehicleField.value = presetVehicle;
      }
      if (presetService && serviceField) {
        serviceField.value = presetService;
      }

      modal.classList.remove('modal-hidden');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeBookingModal() {
    modal.classList.add('modal-hidden');
    document.body.style.overflow = '';
  }

  closeBtns.forEach(btn => btn.addEventListener('click', closeBookingModal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeBookingModal();
  });

  // Handle Form Submission -> WhatsApp
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('bmName')?.value || 'Valued Guest';
      const contact = document.getElementById('bmPhone')?.value || '';
      const service = document.getElementById('bookingServiceField')?.value || 'Cab Service';
      const pickup = document.getElementById('bmPickup')?.value || 'Not specified';
      const drop = document.getElementById('bmDrop')?.value || 'Not specified';
      const date = document.getElementById('bmDate')?.value || 'Flexible';
      const time = document.getElementById('bmTime')?.value || 'Anytime';
      const passengers = document.getElementById('bmPax')?.value || '1';
      const vehicle = document.getElementById('bookingVehicleField')?.value || 'Standard Sedan';
      const notes = document.getElementById('bmNotes')?.value || 'None';
      const targetPhone = document.querySelector('input[name="bmTargetPhone"]:checked')?.value || COMPANY_CONFIG.phone1;

      const formattedMsg = `*New Booking / Inquiry - Catchme Cabs & Tours*%0A` +
        `-----------------------------------------%0A` +
        `👤 *Name:* ${encodeURIComponent(name)}%0A` +
        `📞 *Contact Number:* ${encodeURIComponent(contact)}%0A` +
        `🏷️ *Service Type:* ${encodeURIComponent(service)}%0A` +
        `🚗 *Vehicle Preference:* ${encodeURIComponent(vehicle)}%0A` +
        `🛫 *Pickup:* ${encodeURIComponent(pickup)}%0A` +
        `📍 *Destination:* ${encodeURIComponent(drop)}%0A` +
        `📅 *Date:* ${encodeURIComponent(date)}%0A` +
        `⏰ *Time:* ${encodeURIComponent(time)}%0A` +
        `👥 *Passengers:* ${encodeURIComponent(passengers)} Pax%0A` +
        `📝 *Special Requests / Notes:* ${encodeURIComponent(notes)}%0A` +
        `-----------------------------------------%0A` +
        `Please provide availability and confirm price. Thank you!`;

      // Open WhatsApp
      const waUrl = `https://wa.me/${targetPhone}?text=${formattedMsg}`;
      window.open(waUrl, '_blank');

      // Reset & close
      closeBookingModal();
    });
  }
}

/* 6. FAQ Accordion */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (!questionBtn || !answer) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = !answer.classList.contains('hidden');

      // Close all other faqs in the same group
      faqItems.forEach(otherItem => {
        const otherAnswer = otherItem.querySelector('.faq-answer');
        const otherIcon = otherItem.querySelector('.faq-icon');
        if (otherAnswer && otherAnswer !== answer) {
          otherAnswer.classList.add('hidden');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      if (isOpen) {
        answer.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
      } else {
        answer.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}

/* 7. Animated Counter */
function initStatsCounter() {
  const counters = document.querySelectorAll('.counter-val');
  if (!counters.length) return;

  let started = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 2000;
          const stepTime = 20;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target.toLocaleString();
              clearInterval(timer);
            } else {
              counter.textContent = Math.ceil(current).toLocaleString();
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

/* 8. Tour Tab Filters */
function initTourTabs() {
  const tabs = document.querySelectorAll('.tour-filter-tab');
  const cards = document.querySelectorAll('.tour-package-card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('bg-blue-900', 'text-white', 'shadow-md');
        t.classList.add('bg-gray-100', 'text-slate-700');
      });

      tab.classList.add('bg-blue-900', 'text-white', 'shadow-md');
      tab.classList.remove('bg-gray-100', 'text-slate-700');

      const filter = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.classList.add('hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
        }
      });
    });
  });
}

/* 9. Minimum date picker setting */
function initDatePickers() {
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => {
    input.setAttribute('min', today);
    if (!input.value) {
      input.value = today;
    }
  });
}
