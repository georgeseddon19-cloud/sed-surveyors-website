// ---------------------------------------------------------------------------
// CONFIG — all business/pricing settings live here. Edit this block only.
// ---------------------------------------------------------------------------
const CONFIG = {
  businessName: "Sed Surveyors",

  // TODO: your real base postcode (surveyor's home base) — used for the
  // simple travel-surcharge banding in the quote calculator below.
  basePostcode: "NG1 1AA",

  // TODO: real contact details — also update them in index.html directly
  // (hero card, contact list, footer, JSON-LD) since those are static text.
  phone: "[YOUR PHONE NUMBER]",
  email: "[YOUR EMAIL]",

  // TODO: create a form at https://formspree.io, then paste its endpoint here.
  // Until this is a real endpoint, the enquiry form falls back to opening
  // the visitor's email client with a pre-filled message instead.
  formspreeEndpoint: "https://formspree.io/f/YOUR_FORM_ID",

  // Google Calendar Appointment Schedule — "Sed Surveyors Site Visits",
  // Mon–Fri, 45-min slots. Verified live 2026-09-15.
  bookingEmbedUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0q84TiXcWmV4MXsiWwzv892DfbFGqV_SSRMhGs9C5LvD2lIF56eVlnRWbT0MTWzJtfmWjqwh60",

  factSheetUrl: "what-to-expect.html",

  services: {
    // Real prices, confirmed by the business owner 2026-09-15. Tiered by property type +
    // bedroom count rather than a formula — each array is checked in order, first tier whose
    // maxBeds is >= the entered bedroom count wins (Infinity = "this bed count and above").
    epc: {
      label: "EPC",
      pricingTiers: {
        flat: [{ maxBeds: Infinity, price: 55 }],
        terraced: [{ maxBeds: 3, price: 60 }, { maxBeds: Infinity, price: 75 }],
        semi: [{ maxBeds: 3, price: 65 }, { maxBeds: 4, price: 80 }, { maxBeds: Infinity, price: 85 }],
        detached: [{ maxBeds: 3, price: 65 }, { maxBeds: 4, price: 80 }, { maxBeds: Infinity, price: 85 }]
      }
    },
    // TODO: replace these three with your real prices — still the invented placeholders from
    // the rebuild, using the generic basePrice+perBedroom formula below (not real tiers yet).
    stockCondition: { label: "Stock Condition Survey", basePrice: 95, perBedroom: 12 },
    retrofit: { label: "Retrofit Assessment & Co-ordination", basePrice: 150, perBedroom: 18 },
    floorPlans: { label: "Floor Plans", basePrice: 55, perBedroom: 6 }
  },
  // Only used by services still on the placeholder basePrice+perBedroom formula above (EPC has
  // its own real per-type tiers and ignores this).
  propertyTypeMultiplier: { flat: 1, terraced: 1.05, semi: 1.12, detached: 1.25 },

  // Flat surcharge applied when the entered postcode's area letters don't
  // match the base postcode's area letters. Approximation only — swap for a
  // real geocoding/distance API if you need accurate travel pricing.
  travelSurchargeOutsideArea: 25
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  initCalculator();
  initEnquiryForm();
});

// ---------------------------------------------------------------------------
// Instant quote calculator
// ---------------------------------------------------------------------------
function postcodeArea(postcode) {
  const match = String(postcode || "").trim().toUpperCase().match(/^[A-Z]{1,2}/);
  return match ? match[0] : "";
}

function computeQuote({ service, propertyType, bedrooms, postcode }) {
  const svc = CONFIG.services[service] || CONFIG.services.epc;
  const bedroomCount = Number(bedrooms);

  let total;
  if (svc.pricingTiers) {
    const tiers = svc.pricingTiers[propertyType] || svc.pricingTiers.detached;
    const tier = tiers.find((t) => bedroomCount <= t.maxBeds) || tiers[tiers.length - 1];
    total = tier.price;
  } else {
    const multiplier = CONFIG.propertyTypeMultiplier[propertyType] || 1;
    const extraBedrooms = Math.max(0, bedroomCount - 1);
    total = (svc.basePrice + svc.perBedroom * extraBedrooms) * multiplier;
  }

  const baseArea = postcodeArea(CONFIG.basePostcode);
  const enteredArea = postcodeArea(postcode);
  const travelApplied = enteredArea !== "" && enteredArea !== baseArea;
  if (travelApplied) total += CONFIG.travelSurchargeOutsideArea;

  return { total: Math.round(total), travelApplied };
}

function initCalculator() {
  const serviceEl = document.getElementById("calc-service");
  const typeEl = document.getElementById("calc-type");
  const bedroomsEl = document.getElementById("calc-bedrooms");
  const postcodeEl = document.getElementById("calc-postcode");
  const amountEl = document.getElementById("calc-amount");

  function update() {
    const { total, travelApplied } = computeQuote({
      service: serviceEl.value,
      propertyType: typeEl.value,
      bedrooms: bedroomsEl.value,
      postcode: postcodeEl.value
    });
    amountEl.innerHTML = `£${total} <small>estimated total${travelApplied ? " · incl. travel" : ""}</small>`;
  }

  [serviceEl, typeEl, bedroomsEl].forEach((el) => el.addEventListener("change", update));
  postcodeEl.addEventListener("input", update);
  update();
}

// ---------------------------------------------------------------------------
// Enquiry form — Formspree with a mailto fallback, then reveal the booking
// calendar either way so the visitor can pick a time immediately.
// ---------------------------------------------------------------------------
function initEnquiryForm() {
  const form = document.getElementById("enquiry-form");
  const statusEl = document.getElementById("form-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const endpointConfigured = CONFIG.formspreeEndpoint && !CONFIG.formspreeEndpoint.includes("YOUR_FORM_ID");

    if (endpointConfigured) {
      try {
        const res = await fetch(CONFIG.formspreeEndpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form)
        });
        if (res.ok) {
          showStatus("Thanks — we've got your enquiry and will be in touch shortly.", "ok");
          form.reset();
          revealBookingCalendar();
          return;
        }
        throw new Error("Formspree responded with an error");
      } catch (err) {
        // fall through to mailto fallback below
      }
    }

    mailtoFallback(data);
    showStatus("Opening your email client to send this enquiry — or pick a time below and we'll confirm details then.", "ok");
    revealBookingCalendar();
  });

  function showStatus(message, kind) {
    statusEl.textContent = message;
    statusEl.className = `form-status show ${kind}`;
  }

  function mailtoFallback(data) {
    const to = CONFIG.email.startsWith("[") ? "" : CONFIG.email;
    const subject = encodeURIComponent(`Survey enquiry — ${data.service || "general"}`);
    const bodyLines = [
      `Name: ${data.name || ""}`,
      `Email: ${data.email || ""}`,
      `Phone: ${data.phone || ""}`,
      `Postcode: ${data.postcode || ""}`,
      `Service: ${data.service || ""}`,
      "",
      data.message || ""
    ];
    const body = encodeURIComponent(bodyLines.join("\n"));
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }
}

// ---------------------------------------------------------------------------
// Booking calendar — revealed after the enquiry form is submitted (either
// path). Accepts a bare URL or a full <iframe> snippet in bookingEmbedUrl.
// ---------------------------------------------------------------------------
function extractIframeSrc(value) {
  const iframeMatch = String(value).match(/src=["']([^"']+)["']/i);
  return iframeMatch ? iframeMatch[1] : String(value).trim();
}

function revealBookingCalendar() {
  const section = document.getElementById("booking");
  const wrap = document.getElementById("booking-frame-wrap");
  const guideLink = document.getElementById("booking-guide-link");
  if (guideLink) guideLink.href = CONFIG.factSheetUrl;

  const raw = (CONFIG.bookingEmbedUrl || "").trim();

  if (!raw) {
    wrap.innerHTML = `
      <div class="booking-fallback">
        <h3>We'll be in touch</h3>
        <p style="color:var(--ink-light);">Online booking isn't switched on yet — we'll confirm a visit time by phone or email shortly.</p>
      </div>`;
  } else {
    let src = extractIframeSrc(raw);
    if (/appointments\/schedules\//.test(src) && !/[?&]gv=true/.test(src)) {
      src += (src.includes("?") ? "&" : "?") + "gv=true";
    }
    wrap.innerHTML = `<iframe src="${src}" title="Book a site visit"></iframe>`;
  }

  section.classList.add("revealed");
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}
