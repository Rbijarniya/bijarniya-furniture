/**
 * admin/js/banners.js
 * Hero Banner Manager for Admin Panel
 * Manages all hero fields: eyebrow, title, subtitle, buttons, images, float card.
 */

const BannersModule = {
  bannersList: [],

  async init() {
    await this.loadBanners();
    this.bindEvents();
  },

  async loadBanners() {
    try {
      const res = await fetch('/api/banners/all', {
        headers: AdminAuth.getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to fetch banners');
      this.bannersList = await res.json();
      this.renderTable();
    } catch (e) {
      console.error(e);
    }
  },

  renderTable() {
    const tbody = document.getElementById('bannersTbody');
    if (!tbody) return;

    if (this.bannersList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px;">No banners configured. Click "Add Banner" to create the hero banner.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.bannersList.map((b) => `
      <tr>
        <td><img src="${b.img}" alt="${b.title}" class="table-thumb" style="width:70px;" onerror="this.src='https://via.placeholder.com/70'"></td>
        <td>
          <b>${b.title}</b><br>
          <small style="opacity:.7;">${b.eyebrow || ''}</small><br>
          <small>${b.subtitle || ''}</small>
        </td>
        <td><small>${b.buttonText || ''} → ${b.buttonLink || ''}</small><br><small>${b.btn2Text || ''} → ${b.btn2Link || ''}</small></td>
        <td><span class="badge ${b.isActive ? 'badge-success' : 'badge-danger'}">${b.isActive ? 'Active' : 'Disabled'}</span></td>
        <td>
          <div class="action-btns">
            <button type="button" class="btn btn-secondary btn-icon" onclick="BannersModule.editBanner('${b._id}')" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="btn btn-danger btn-icon" onclick="BannersModule.deleteBanner('${b._id}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  bindEvents() {
    const addBtn = document.getElementById('btnOpenAddBanner');
    const form = document.getElementById('bannerForm');
    const imgInput = document.getElementById('bannerImgFile');
    const frameImgInput = document.getElementById('bannerFrameImgFile');

    if (addBtn) addBtn.addEventListener('click', () => this.openModal());

    // Background image upload
    if (imgInput) {
      imgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = await this._uploadImage(file);
        if (url) {
          document.getElementById('bannerImgUrl').value = url;
          const preview = document.getElementById('bannerImgPreview');
          preview.src = url;
          preview.classList.remove('hidden');
        }
      });
    }

    // Frame image upload
    if (frameImgInput) {
      frameImgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = await this._uploadImage(file);
        if (url) {
          document.getElementById('bannerFrameImgUrl').value = url;
          const preview = document.getElementById('bannerFrameImgPreview');
          preview.src = url;
          preview.classList.remove('hidden');
        }
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveBanner();
      });
    }
  },

  async _uploadImage(file) {
    const formData = new FormData();
    formData.append('images', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: AdminAuth.getAuthHeader(true),
        body: formData,
      });
      const data = await res.json();
      return data.url || null;
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
      return null;
    }
  },

  openModal(banner = null) {
    const modal = document.getElementById('bannerModal');
    const modalTitle = document.getElementById('bannerModalTitle');
    const form = document.getElementById('bannerForm');

    form.reset();
    document.getElementById('bannerIdDb').value = '';
    document.getElementById('bannerImgPreview').classList.add('hidden');
    document.getElementById('bannerFrameImgPreview').classList.add('hidden');
    document.getElementById('bannerFrameImgUrl').value = '';

    if (banner) {
      modalTitle.textContent = 'Edit Hero Banner';
      document.getElementById('bannerIdDb').value = banner._id;
      document.getElementById('bannerEyebrow').value = banner.eyebrow || '';
      document.getElementById('bannerTitle').value = banner.title;
      document.getElementById('bannerSubtitle').value = banner.subtitle || '';
      document.getElementById('bannerButtonText').value = banner.buttonText || '';
      document.getElementById('bannerButtonLink').value = banner.buttonLink || '';
      document.getElementById('bannerBtn2Text').value = banner.btn2Text || '';
      document.getElementById('bannerBtn2Link').value = banner.btn2Link || '';
      document.getElementById('bannerFloatTitle').value = banner.floatCardTitle || '';
      document.getElementById('bannerFloatSub').value = banner.floatCardSub || '';
      document.getElementById('bannerIsActive').checked = Boolean(banner.isActive);

      // Background image
      document.getElementById('bannerImgUrl').value = banner.img || '';
      if (banner.img) {
        const prev = document.getElementById('bannerImgPreview');
        prev.src = banner.img;
        prev.classList.remove('hidden');
      }

      // Frame image
      document.getElementById('bannerFrameImgUrl').value = banner.frameImg || '';
      if (banner.frameImg) {
        const prev = document.getElementById('bannerFrameImgPreview');
        prev.src = banner.frameImg;
        prev.classList.remove('hidden');
      }
    } else {
      modalTitle.textContent = 'Add Hero Banner';
      document.getElementById('bannerIsActive').checked = true;
    }

    modal.classList.add('open');
  },

  closeModal() {
    document.getElementById('bannerModal').classList.remove('open');
  },

  editBanner(id) {
    const banner = this.bannersList.find((b) => b._id === id);
    if (banner) this.openModal(banner);
  },

  async saveBanner() {
    const dbId        = document.getElementById('bannerIdDb').value;
    const eyebrow     = document.getElementById('bannerEyebrow').value.trim();
    const title       = document.getElementById('bannerTitle').value.trim();
    const subtitle    = document.getElementById('bannerSubtitle').value.trim();
    const buttonText  = document.getElementById('bannerButtonText').value.trim();
    const buttonLink  = document.getElementById('bannerButtonLink').value.trim();
    const btn2Text    = document.getElementById('bannerBtn2Text').value.trim();
    const btn2Link    = document.getElementById('bannerBtn2Link').value.trim();
    const floatCardTitle = document.getElementById('bannerFloatTitle').value.trim();
    const floatCardSub   = document.getElementById('bannerFloatSub').value.trim();
    const isActive    = document.getElementById('bannerIsActive').checked;
    const img         = document.getElementById('bannerImgUrl').value.trim();
    const frameImg    = document.getElementById('bannerFrameImgUrl').value.trim();

    if (!title || !img) {
      alert('Please fill in the Main Heading and upload a Background Image.');
      return;
    }

    const payload = {
      eyebrow, title, subtitle,
      buttonText, buttonLink,
      btn2Text, btn2Link,
      floatCardTitle, floatCardSub,
      isActive, img,
    };
    if (frameImg) payload.frameImg = frameImg;

    const url    = dbId ? `/api/banners/${dbId}` : '/api/banners';
    const method = dbId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: AdminAuth.getAuthHeader(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Save failed');

      this.closeModal();
      await this.loadBanners();
      if (window.DashboardModule) DashboardModule.loadStats();
    } catch (e) {
      alert('Error saving banner: ' + e.message);
    }
  },

  async deleteBanner(id) {
    if (!confirm('Are you sure you want to delete this hero banner?')) return;

    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
        headers: AdminAuth.getAuthHeader(),
      });
      if (!res.ok) throw new Error('Delete failed');
      await this.loadBanners();
      if (window.DashboardModule) DashboardModule.loadStats();
    } catch (e) {
      alert('Error deleting banner: ' + e.message);
    }
  },
};
