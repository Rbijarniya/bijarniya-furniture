/**
 * config.js
 * ---------------------------------------------------------------------
 * Single source of truth for environment & business settings.
 * Fetches dynamic settings from /api/settings with local fallbacks.
 * ---------------------------------------------------------------------
 */

export const CONFIG = {
  apiBaseUrl: '',

  business: {
    phone: '+919257849119',
    whatsapp: '919257849119',
    defaultWhatsappMessage:
      'Hello Bijarniya Furniture, I would like to know more about your furniture products.',
    email: 'bijarniyafurniture@gmail.com',
  },

  google: {
    writeReviewUrl: 'https://g.page/r/YOUR_REVIEW_LINK/review',
    readReviewsUrl:
      'https://www.google.com/maps/place/Bijarniya+Enterprises+%26furniture/@27.1585904,74.8517542,17z/data=!3m1!4b1!4m6!3m5!1s0x396b793e0e6dd6bd:0x220dde6879ff3cb!8m2!3d27.1585904!4d74.8517542!16s%2Fg%2F11dyzms7s3',
  },
};

export async function loadLiveSettings() {
  try {
    const res = await fetch(`${CONFIG.apiBaseUrl}/api/settings`);
    if (!res.ok) return;
    const settings = await res.json();
    if (settings.phone) CONFIG.business.phone = settings.phone;
    if (settings.whatsapp) CONFIG.business.whatsapp = settings.whatsapp;
    if (settings.email) CONFIG.business.email = settings.email;
    if (settings.writeReviewUrl) CONFIG.google.writeReviewUrl = settings.writeReviewUrl;
    if (settings.googleMapsUrl) CONFIG.google.readReviewsUrl = settings.googleMapsUrl;
    return settings;
  } catch (err) {
    console.warn('Using static config settings:', err.message);
    return null;
  }
}