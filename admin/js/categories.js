/**
 * admin/js/categories.js
 * Category management for Admin Panel
 */

const CategoriesModule = {
  categoriesList: [],

  async init() {
    await this.loadCategories();
    this.bindEvents();
  },

  async loadCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      this.categoriesList = await res.json();
      this.renderTable();
    } catch (e) {
      console.error(e);
    }
  },

  renderTable() {
    const tbody = document.getElementById('categoriesTbody');
    if (!tbody) return;

    if (this.categoriesList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px;">No categories found.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.categoriesList.map((c) => `
      <tr>
        <td><img src="${c.img}" alt="${c.name}" class="table-thumb" onerror="this.src='https://via.placeholder.com/50'"></td>
        <td><b>${c.name}</b></td>
        <td><code>${c.id}</code></td>
        <td><i class="fa-solid ${c.icon}"></i> ${c.icon}</td>
        <td>
          <div class="action-btns">
            <button type="button" class="btn btn-secondary btn-icon" onclick="CategoriesModule.editCategory('${c._id}')" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="btn btn-danger btn-icon" onclick="CategoriesModule.deleteCategory('${c._id}', '${c.name.replace(/'/g, "\\'")}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  bindEvents() {
    const addBtn = document.getElementById('btnOpenAddCategory');
    const form = document.getElementById('categoryForm');
    const imgInput = document.getElementById('catImgFile');

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
            document.getElementById('catImgUrl').value = data.url;
            document.getElementById('catImgPreview').src = data.url;
            document.getElementById('catImgPreview').classList.remove('hidden');
          }
        } catch (err) {
          alert('Failed to upload image: ' + err.message);
        }
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveCategory();
      });
    }
  },

  openModal(category = null) {
    const modal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('categoryModalTitle');
    const form = document.getElementById('categoryForm');

    form.reset();
    document.getElementById('categoryIdDb').value = '';
    document.getElementById('catImgPreview').classList.add('hidden');

    if (category) {
      modalTitle.textContent = 'Edit Category';
      document.getElementById('categoryIdDb').value = category._id;
      document.getElementById('catSlug').value = category.id;
      document.getElementById('catSlug').readOnly = true;
      document.getElementById('catName').value = category.name;
      document.getElementById('catIcon').value = category.icon || 'fa-couch';
      document.getElementById('catImgUrl').value = category.img || '';

      if (category.img) {
        document.getElementById('catImgPreview').src = category.img;
        document.getElementById('catImgPreview').classList.remove('hidden');
      }
    } else {
      modalTitle.textContent = 'Add New Category';
      document.getElementById('catSlug').readOnly = false;
    }

    modal.classList.add('open');
  },

  closeModal() {
    document.getElementById('categoryModal').classList.remove('open');
  },

  editCategory(id) {
    const cat = this.categoriesList.find((c) => c._id === id);
    if (cat) this.openModal(cat);
  },

  async saveCategory() {
    const dbId = document.getElementById('categoryIdDb').value;
    const slug = document.getElementById('catSlug').value.trim().toLowerCase();
    const name = document.getElementById('catName').value.trim();
    const icon = document.getElementById('catIcon').value.trim();
    const img = document.getElementById('catImgUrl').value.trim();

    if (!slug || !name || !img) {
      alert('Please fill out Category ID, Name, and Image URL.');
      return;
    }

    const payload = { id: slug, name, icon: icon || 'fa-couch', img };
    const url = dbId ? `/api/categories/${dbId}` : '/api/categories';
    const method = dbId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: AdminAuth.getAuthHeader(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Save failed');
      }

      this.closeModal();
      await this.loadCategories();
      if (window.ProductsModule) ProductsModule.loadCategories();
      if (window.DashboardModule) DashboardModule.loadStats();
    } catch (e) {
      alert('Error saving category: ' + e.message);
    }
  },

  async deleteCategory(id, name) {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: AdminAuth.getAuthHeader(),
      });
      if (!res.ok) throw new Error('Delete failed');
      await this.loadCategories();
      if (window.ProductsModule) ProductsModule.loadCategories();
      if (window.DashboardModule) DashboardModule.loadStats();
    } catch (e) {
      alert('Error deleting category: ' + e.message);
    }
  },
};
