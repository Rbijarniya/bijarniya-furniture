/**
 * admin/js/offers.js
 * Admin Offers Manager
 */

const OffersModule = {
  offersList: [],

  async init() {
    await this.loadOffers();
    this.bindEvents();
  },

  async loadOffers() {
    try {
      const res = await fetch('/api/offers/all', {
        headers: AdminAuth.getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to fetch offers');
      this.offersList = await res.json();
      this.renderTable();
    } catch (e) {
      console.error(e);
    }
  },

  renderTable() {
    const tbody = document.getElementById('offersTbody');
    if (!tbody) return;

    if (this.offersList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px;">No offers found. Click "Add Offer" to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.offersList.map((o) => `
      <tr>
        <td><img src="${o.img}" alt="${o.title}" class="table-thumb" style="width:70px;" onerror="this.src='https://via.placeholder.com/70'"></td>
        <td>
          <b>${o.title}</b><br>
          <small style="opacity:.7;">${o.description || ''}</small>
        </td>
        <td>
          <small>Tag: ${o.tag || '-'}</small><br>
          <small>Btn: ${o.buttonText || ''} → ${o.buttonLink || ''}</small>
        </td>
        <td><span class="badge ${o.isActive ? 'badge-success' : 'badge-danger'}">${o.isActive ? 'Active' : 'Hidden'}</span></td>
        <td>
          <div class="action-btns">
            <button type="button" class="btn btn-secondary btn-icon" onclick="OffersModule.editOffer('${o._id}')" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="btn btn-danger btn-icon" onclick="OffersModule.deleteOffer('${o._id}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  bindEvents() {
    const addBtn = document.getElementById('btnOpenAddOffer');
    const form = document.getElementById('offerForm');
    const imgInput = document.getElementById('offerImgFile');

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
            document.getElementById('offerImgUrl').value = data.url;
            const preview = document.getElementById('offerImgPreview');
            preview.src = data.url;
            preview.classList.remove('hidden');
          }
        } catch (err) {
          alert('Upload failed');
        }
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveOffer();
      });
    }
  },

  openModal(offer = null) {
    const modal = document.getElementById('offerModal');
    const form = document.getElementById('offerForm');
    form.reset();
    document.getElementById('offerIdDb').value = '';
    document.getElementById('offerImgPreview').classList.add('hidden');

    if (offer) {
      document.getElementById('offerModalTitle').textContent = 'Edit Offer';
      document.getElementById('offerIdDb').value = offer._id;
      document.getElementById('offerTag').value = offer.tag || '';
      document.getElementById('offerTitle').value = offer.title;
      document.getElementById('offerDescription').value = offer.description || '';
      document.getElementById('offerButtonText').value = offer.buttonText || '';
      document.getElementById('offerButtonLink').value = offer.buttonLink || '';
      document.getElementById('offerButtonStyle').value = offer.buttonStyle || 'gold';
      document.getElementById('offerSortOrder').value = offer.sortOrder || 0;
      document.getElementById('offerIsActive').checked = Boolean(offer.isActive);

      document.getElementById('offerImgUrl').value = offer.img || '';
      if (offer.img) {
        const prev = document.getElementById('offerImgPreview');
        prev.src = offer.img;
        prev.classList.remove('hidden');
      }
    } else {
      document.getElementById('offerModalTitle').textContent = 'Add Offer';
      document.getElementById('offerIsActive').checked = true;
      document.getElementById('offerSortOrder').value = this.offersList.length + 1;
    }

    modal.classList.add('open');
  },

  closeModal() {
    document.getElementById('offerModal').classList.remove('open');
  },

  editOffer(id) {
    const offer = this.offersList.find((o) => o._id === id);
    if (offer) this.openModal(offer);
  },

  async saveOffer() {
    const dbId = document.getElementById('offerIdDb').value;
    const payload = {
      tag: document.getElementById('offerTag').value.trim(),
      title: document.getElementById('offerTitle').value.trim(),
      description: document.getElementById('offerDescription').value.trim(),
      buttonText: document.getElementById('offerButtonText').value.trim(),
      buttonLink: document.getElementById('offerButtonLink').value.trim(),
      buttonStyle: document.getElementById('offerButtonStyle').value,
      sortOrder: Number(document.getElementById('offerSortOrder').value) || 0,
      isActive: document.getElementById('offerIsActive').checked,
      img: document.getElementById('offerImgUrl').value.trim(),
    };

    if (!payload.title || !payload.img) {
      alert('Title and Image are required.');
      return;
    }

    const url = dbId ? `/api/offers/${dbId}` : '/api/offers';
    const method = dbId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: AdminAuth.getAuthHeader(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Save failed');

      this.closeModal();
      await this.loadOffers();
      if (window.DashboardModule) DashboardModule.loadStats();
    } catch (e) {
      alert('Error saving offer: ' + e.message);
    }
  },

  async deleteOffer(id) {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: 'DELETE',
        headers: AdminAuth.getAuthHeader(),
      });
      if (!res.ok) throw new Error('Delete failed');
      await this.loadOffers();
      if (window.DashboardModule) DashboardModule.loadStats();
    } catch (e) {
      alert('Error deleting offer: ' + e.message);
    }
  }
};
