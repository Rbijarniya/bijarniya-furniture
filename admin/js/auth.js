/**
 * admin/js/auth.js
 * Session management & token helper for Bijarniya Furniture Admin Panel
 *
 * STORAGE: sessionStorage (NOT localStorage)
 * ─────────────────────────────────────────
 * sessionStorage is scoped to a single browser tab and is automatically
 * cleared when that tab or the browser window is closed.
 * This means:
 *   ✅ Page refresh within the same tab  → stays logged in
 *   ✅ In-session navigation             → stays logged in
 *   ✅ Browser close / tab close         → session cleared, login required again
 *   ✅ Explicit logout                   → session cleared, login required again
 *   ⚠️  New tab / new window            → NOT logged in (each tab has its own
 *                                          isolated sessionStorage — they do NOT share)
 */

const AdminAuth = {
  TOKEN_KEY: 'bf_admin_token',
  USER_KEY: 'bf_admin_user',

  getToken() {
    return sessionStorage.getItem(this.TOKEN_KEY);
  },

  setToken(token) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  },

  getUser() {
    const raw = sessionStorage.getItem(this.USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  logout() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    window.location.href = 'login.html';
  },

  getAuthHeader(isFormData = false) {
    const token = this.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  },

  async verifySession() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch('/api/auth/me', {
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      const data = await response.json();
      this.setUser(data.admin);
      return true;
    } catch (error) {
      console.error('Session verification error:', error);
      return false;
    }
  },

  async initPageGuard() {
    const isValid = await this.verifySession();
    if (!isValid) {
      this.logout();
    }
    return isValid;
  },
};
