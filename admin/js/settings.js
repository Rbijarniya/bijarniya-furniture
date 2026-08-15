/**
 * admin/js/settings.js
 * Website Business Settings & Account Settings for Admin Panel
 */

const SettingsModule = {
  settingsData: null,

  async init() {
    await this.loadSettings();
    this.bindEvents();
    this.populateAdminProfile();
  },

  async loadSettings() {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      this.settingsData = await res.json();
      this.populateForm();
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  },

  setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  },

  getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  },

  populateForm() {
    if (!this.settingsData) return;
    const s = this.settingsData;

    this.setVal('setBusinessName', s.businessName);
    this.setVal('setTagline', s.tagline);
    this.setVal('setPhone', s.phone);
    this.setVal('setWhatsapp', s.whatsapp);
    this.setVal('setEmail', s.email);
    this.setVal('setAddress', s.address);
    this.setVal('setGoogleMapsUrl', s.googleMapsUrl);
    this.setVal('setWriteReviewUrl', s.writeReviewUrl);
    this.setVal('setOpeningHours', s.openingHours);
    this.setVal('setInstagram', s.instagram);
    this.setVal('setFacebook', s.facebook);
    this.setVal('setYoutube', s.youtube);
  },

  populateAdminProfile() {
    const user = AdminAuth.getUser();
    if (user) {
      this.setVal('profileUsername', user.username);
      this.setVal('profileEmail', user.email);
      this.setVal('profilePhone', user.phone);
    }
  },

  bindEvents() {
    const settingsForm = document.getElementById('settingsForm');
    const profileForm = document.getElementById('profileForm');

    if (settingsForm) {
      settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveSettings();
      });
    }

    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveProfile();
      });
    }
  },

  showAlert(msg, isSuccess = true) {
    const box = document.getElementById('settingsAlertBox');
    if (!box) {
      alert(msg);
      return;
    }
    box.textContent = msg;
    box.className = `alert-banner ${isSuccess ? 'success-banner' : 'error-banner'}`;
    box.classList.remove('hidden');
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(() => {
      box.classList.add('hidden');
    }, 6000);
  },

  async saveSettings() {
    const saveBtn = document.getElementById('btnSaveSettings');
    const btnText = saveBtn?.querySelector('.btn-text');
    const btnSpinner = saveBtn?.querySelector('.btn-spinner');

    const payload = {
      businessName: this.getVal('setBusinessName'),
      tagline: this.getVal('setTagline'),
      phone: this.getVal('setPhone'),
      whatsapp: this.getVal('setWhatsapp'),
      email: this.getVal('setEmail'),
      address: this.getVal('setAddress'),
      googleMapsUrl: this.getVal('setGoogleMapsUrl'),
      writeReviewUrl: this.getVal('setWriteReviewUrl'),
      openingHours: this.getVal('setOpeningHours'),
      instagram: this.getVal('setInstagram'),
      facebook: this.getVal('setFacebook'),
      youtube: this.getVal('setYoutube'),
    };

    if (saveBtn) saveBtn.disabled = true;
    if (btnText) btnText.classList.add('hidden');
    if (btnSpinner) btnSpinner.classList.remove('hidden');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: AdminAuth.getAuthHeader(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update website settings.');
      }

      this.showAlert('Business settings saved successfully! Saved to MongoDB Atlas.');
      this.settingsData = data.settings;
      this.populateForm();
    } catch (e) {
      this.showAlert('Unable to save business settings: ' + e.message, false);
    } finally {
      if (saveBtn) saveBtn.disabled = false;
      if (btnText) btnText.classList.remove('hidden');
      if (btnSpinner) btnSpinner.classList.add('hidden');
    }
  },

  async saveProfile() {
    const username = this.getVal('profileUsername');
    const email = this.getVal('profileEmail');
    const phone = this.getVal('profilePhone');
    const currentPassword = this.getVal('profileCurrentPassword');
    const newPassword = this.getVal('profileNewPassword');

    const payload = { username, email, phone };
    if (newPassword) {
      if (!currentPassword) {
        alert('Please enter your current password to change password.');
        return;
      }
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: AdminAuth.getAuthHeader(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      alert('Admin profile updated successfully!');
      AdminAuth.setUser(data.admin);
      this.setVal('profileCurrentPassword', '');
      this.setVal('profileNewPassword', '');
    } catch (e) {
      alert('Error updating profile: ' + e.message);
    }
  },
};
