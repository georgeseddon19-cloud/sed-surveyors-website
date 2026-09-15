# Sed Surveyors website

**Live at:** https://georgeseddon19-cloud.github.io/sed-surveyors-website/
(GitHub Pages, deployed from `master` — repo must stay public for Pages to
serve on the free plan). Point the real `sedsurveyors.co.uk` domain here
with a CNAME once it's bought, or move to Netlify — either works from this
same repo.

Static site — plain HTML/CSS/JS, no build step. Rebuilt 2026-09-15 after the
original folder was lost in a Desktop reorg (see note at the bottom).

## Structure
- `index.html` — homepage: hero, services, instant quote calculator, enquiry
  form, booking section (hidden until revealed), reviews, footer.
- `what-to-expect.html` — post-booking preparation guide (`noindex`).
- `styles.css` — all styling.
- `script.js` — all config and behaviour. **All pricing/business settings
  live in the `CONFIG` block at the top of this file.**
- `assets/` — icons and accreditation badge placeholders (SVG).

## Setup checklist (open placeholders)
1. **Formspree** — create a form at formspree.io, paste the endpoint into
   `CONFIG.formspreeEndpoint` in `script.js`. Until this is real, the enquiry
   form falls back to opening the visitor's email client (mailto).
2. ~~**Booking calendar**~~ — done. Live "Sed Surveyors Site Visits" Google
   Calendar Appointment Schedule wired into `CONFIG.bookingEmbedUrl`.
3. **Contact details** — replace every `[YOUR ...]` placeholder in
   `index.html` (phone, email, address) and in `CONFIG` in `script.js`
   (`phone`, `email`, `basePostcode`).
4. **Domain** — `sedsurveyors.co.uk` is a placeholder throughout
   `index.html` (JSON-LD), `sitemap.xml`, and `robots.txt`. Replace once a
   real domain is bought.
5. **Reviews** — the three review cards in `index.html` are fake examples.
   Replace with real testimonials or remove the section before publishing.
6. **Accreditation badges** — `assets/accreditations/` currently only has a
   generic placeholder SVG. Replace with real ECMK / PAS 2035 / TrustMark
   artwork (or whichever bodies apply).
7. **Structured data** — `index.html` `<script type="application/ld+json">`
   has bracketed placeholders (address, Google Business/Facebook/Instagram
   URLs, qualifications) — fill these in for local SEO.
8. ~~**Deploy**~~ — done, see "Live at" above.
9. **Google Business Profile / reviews QR** — profile created but needs a
   live website to finish verification (now available, see above). Once
   verified/published, get the "get more reviews" short link from Business
   Profile Manager and a QR code can be generated for business cards.

## Local preview
No build step needed — just serve the folder statically, e.g.:
```
npx serve
```

## Note on the 2026-09-15 rebuild
The original site (built 2026-09-04 to 2026-09-09) was lost when this
machine's Desktop got reorganised and the folder — along with its source
images (`Desktop\website\EPC Image.png`, `epc info before site.png`) — went
missing. It was never pushed to a git remote, so it couldn't be recovered.
This version reproduces the same structure, copy, and calculator/booking
logic from project notes, but:
- the real EPC icon and branded prep-guide infographic were lost and are
  currently SVG placeholders in `assets/`
- all the config placeholders above are unset again and need refilling
- git history starts fresh from this rebuild

**If you keep working on this site, push it to a GitHub remote** so a future
Desktop reorg can't wipe it again.
