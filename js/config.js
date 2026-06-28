/**
 * config.js
 * ---------------------------------------------------------------------
 * Single source of truth for anything environment- or business-specific.
 * Nothing secret lives here — this file is shipped to the browser.
 * The Google Places API key stays server-side only (see /server/.env).
 * ---------------------------------------------------------------------
 */

export const CONFIG = {
  // Same-origin by default — this works when the Express server in
  // /server serves the frontend AND the API (recommended, see README).
  // If you run the frontend on a different host/port during development
  // (e.g. VS Code "Live Server" on :5500 while the API runs on :4000),
  // set this to the API's full origin, e.g. 'http://localhost:4000'.
  apiBaseUrl: '',

  business: {
    phone: '+919257849119', // TODO: replace with the real number
    whatsapp: '919257849119', // TODO: replace — digits only, country code, no '+' or spaces
    defaultWhatsappMessage:
      'Hello Bijarniya Furniture, I would like to know more about your furniture products.',
    email: 'bijarniyafurniture@gmail.com',
  },

  google: {
    // TODO: replace with your real "Write a review" short link
    // (Google Business Profile → "Get more reviews" → copy link)
    writeReviewUrl: 'https://g.page/r/YOUR_REVIEW_LINK/review',

    // TODO: replace with your Google Maps listing URL.
    // Reused for both "Read All Reviews" and "Get Directions".
    readReviewsUrl:
      'https://www.google.com/maps/place/Bijarniya+Enterprises+%26furniture/@27.1585904,74.8517542,17z/data=!3m1!4b1!4m6!3m5!1s0x396b793e0e6dd6bd:0x220dde6879ff3cb!8m2!3d27.1585904!4d74.8517542!16s%2Fg%2F11dyzms7s3',
  },
};