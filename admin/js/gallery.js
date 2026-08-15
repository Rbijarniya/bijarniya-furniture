/**
 * admin/js/gallery.js
 * Showroom Gallery photo uploader & manager for Admin Panel
 */

const GalleryModule = {
  galleryItems: [],

  async init() {
    await this.loadGallery();
    this.bindEvents();
  },

  async loadGallery() {
    try {
      const res = await fetch('/api/gallery');
      if (!res.ok) throw new Error('Failed to fetch gallery items');
      this.galleryItems = await res.json();
      this.renderGrid();
    } catch (e) {
      console.error(e);
    }
  },

  renderGrid() {
    const container = document.getElementById('adminGalleryGrid');
    if (!container) return;

    if (this.galleryItems.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px;">No gallery photos uploaded yet.</div>`;
      return;
    }

    container.innerHTML = this.galleryItems.map((item) => `
      <div class="gallery-admin-card" style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden; position:relative;">
        <img src="${item.img}" alt="${item.caption || 'Showroom Photo'}" style="width:100%; height:160px; object-fit:cover;">
        <div style="padding:12px;">
          <span class="badge badge-info" style="text-transform:capitalize;">${item.tab}</span>
          <p style="font-size:12px; font-weight:500; margin-top:6px; color:var(--text-dark);">${item.caption || 'No caption'}</p>
          <button type="button" class="btn btn-danger btn-block" style="margin-top:10px; padding:6px 10px; font-size:12px;" onclick="GalleryModule.deleteItem('${item._id}')">
            <i class="fa-solid fa-trash"></i> Delete Image
          </button>
        </div>
      </div>
    `).join('');
  },

  bindEvents() {
    const addBtn = document.getElementById('btnOpenAddGallery');
    const form = document.getElementById('galleryForm');
    const imgInput = document.getElementById('galImgFile');

    if (addBtn) addBtn.addEventListener('click', () => this.openModal());

    if (imgInput) {
      imgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('images', file);

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: AdminAuth.getAuthHeader(true),
            body: formData,
          });
          const data = await res.json();
          if (data.url) {
            document.getElementById('galImgUrl').value = data.url;
            document.getElementById('galImgPreview').src = data.url;
            document.getElementById('galImgPreview').classList.remove('hidden');
          }
        } catch (err) {
          alert('Failed to upload image: ' + err.message);
        }
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveItem();
      });
    }
  },

  openModal() {
    const modal = document.getElementById('galleryModal');
    const form = document.getElementById('galleryForm');
    form.reset();
    document.getElementById('galImgPreview').classList.add('hidden');
    modal.classList.add('open');
  },

  closeModal() {
    document.getElementById('galleryModal').classList.remove('open');
  },

  async saveItem() {
    const img = document.getElementById('galImgUrl').value.trim();
    const tab = document.getElementById('galTab').value;
    const caption = document.getElementById('galCaption').value.trim();

    if (!img) {
      alert('Please upload or enter an Image URL.');
      return;
    }

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: AdminAuth.getAuthHeader(),
        body: JSON.stringify({ img, tab, caption }),
      });

      if (!res.ok) throw new Error('Failed to save gallery item');

      this.closeModal();
      await this.loadGallery();
      if (window.DashboardModule) DashboardModule.loadStats();
    } catch (e) {
      alert('Error saving gallery item: ' + e.message);
    }
  },

  async deleteItem(id) {
    if (!confirm('Are you sure you want to delete this showroom gallery photo?')) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: AdminAuth.getAuthHeader(),
      });
      if (!res.ok) throw new Error('Delete failed');
      await this.loadGallery();
      if (window.DashboardModule) DashboardModule.loadStats();
    } catch (e) {
      alert('Error deleting image: ' + e.message);
    }
  },
};
