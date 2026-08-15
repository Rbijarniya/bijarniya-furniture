/**
 * admin/js/pricelist.js
 * Admin Price List Manager
 */

const PriceListModule = {
  priceList: [],

  async init() {
    await this.loadPriceList();
    this.bindEvents();
  },

  async loadPriceList() {
    try {
      const res = await fetch('/api/pricelist/all', {
        headers: AdminAuth.getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to fetch price list');
      this.priceList = await res.json();
      this.renderTable();
    } catch (e) {
      console.error(e);
    }
  },

  renderTable() {
    const tbody = document.getElementById('priceListTbody');
    if (!tbody) return;

    if (this.priceList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px;">No price list items found.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.priceList.map((p) => `
      <tr>
        <td><b>${p.item}</b></td>
        <td>${p.price}</td>
        <td><span class="badge ${p.isActive ? 'badge-success' : 'badge-danger'}">${p.isActive ? 'Active' : 'Hidden'}</span></td>
        <td>${p.sortOrder || 0}</td>
        <td>
          <div class="action-btns">
            <button type="button" class="btn btn-secondary btn-icon" onclick="PriceListModule.editItem('${p._id}')" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="btn btn-danger btn-icon" onclick="PriceListModule.deleteItem('${p._id}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  bindEvents() {
    const addBtn = document.getElementById('btnOpenAddPriceList');
    const form = document.getElementById('priceListForm');

    if (addBtn) addBtn.addEventListener('click', () => this.openModal());

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveItem();
      });
    }
  },

  openModal(item = null) {
    const modal = document.getElementById('priceListModal');
    const form = document.getElementById('priceListForm');
    form.reset();
    document.getElementById('priceListIdDb').value = '';

    if (item) {
      document.getElementById('priceListModalTitle').textContent = 'Edit Price List Item';
      document.getElementById('priceListIdDb').value = item._id;
      document.getElementById('priceListItemName').value = item.item;
      document.getElementById('priceListItemPrice').value = item.price;
      document.getElementById('priceListSortOrder').value = item.sortOrder || 0;
      document.getElementById('priceListIsActive').checked = Boolean(item.isActive);
    } else {
      document.getElementById('priceListModalTitle').textContent = 'Add Price List Item';
      document.getElementById('priceListIsActive').checked = true;
      document.getElementById('priceListSortOrder').value = this.priceList.length + 1;
    }

    modal.classList.add('open');
  },

  closeModal() {
    document.getElementById('priceListModal').classList.remove('open');
  },

  editItem(id) {
    const item = this.priceList.find((p) => p._id === id);
    if (item) this.openModal(item);
  },

  async saveItem() {
    const dbId = document.getElementById('priceListIdDb').value;
    const payload = {
      item: document.getElementById('priceListItemName').value.trim(),
      price: document.getElementById('priceListItemPrice').value.trim(),
      sortOrder: Number(document.getElementById('priceListSortOrder').value) || 0,
      isActive: document.getElementById('priceListIsActive').checked,
    };

    if (!payload.item || !payload.price) {
      alert('Item Name and Price are required.');
      return;
    }

    const url = dbId ? `/api/pricelist/${dbId}` : '/api/pricelist';
    const method = dbId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: AdminAuth.getAuthHeader(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Save failed');

      this.closeModal();
      await this.loadPriceList();
      if (window.DashboardModule) DashboardModule.loadStats();
    } catch (e) {
      alert('Error saving price list item: ' + e.message);
    }
  },

  async deleteItem(id) {
    if (!confirm('Are you sure you want to delete this price list item?')) return;
    try {
      const res = await fetch(`/api/pricelist/${id}`, {
        method: 'DELETE',
        headers: AdminAuth.getAuthHeader(),
      });
      if (!res.ok) throw new Error('Delete failed');
      await this.loadPriceList();
      if (window.DashboardModule) DashboardModule.loadStats();
    } catch (e) {
      alert('Error deleting item: ' + e.message);
    }
  }
};
