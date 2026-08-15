/**
 * admin/js/products.js
 * Product CRUD management & image upload for Admin Panel
 */

const ProductsModule = {
  productsList: [],
  categoriesList: [],

  async init() {
    await this.loadCategories();
    await this.loadProducts();
    this.bindEvents();
  },

  async loadCategories() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        this.categoriesList = await res.json();
        this.renderCategorySelects();
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  },

  renderCategorySelects() {
    const filterSelect = document.getElementById('productCategoryFilter');
    const formSelect = document.getElementById('prodCategory');

    const options = this.categoriesList.map(
      (c) => `<option value="${c.id}">${c.name}</option>`
    ).join('');

    if (filterSelect) {
      filterSelect.innerHTML = `<option value="all">All Categories</option>` + options;
    }
    if (formSelect) {
      formSelect.innerHTML = `<option value="">Select Category</option>` + options;
    }
  },

  async loadProducts() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      this.productsList = await res.json();
      this.renderTable();
    } catch (e) {
      console.error(e);
    }
  },

  renderTable() {
    const tbody = document.getElementById('productsTbody');
    const filterCat = document.getElementById('productCategoryFilter')?.value || 'all';
    const searchVal = document.getElementById('productSearchInput')?.value.toLowerCase().trim() || '';

    if (!tbody) return;

    const filtered = this.productsList.filter((p) => {
      if (filterCat !== 'all' && p.category !== filterCat) return false;
      if (searchVal && !p.name.toLowerCase().includes(searchVal) && !p.material.toLowerCase().includes(searchVal)) {
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px;">No products found matching filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((p) => {
      const catName = this.categoriesList.find((c) => c.id === p.category)?.name || p.category;
      return `
        <tr>
          <td><img src="${p.img}" alt="${p.name}" class="table-thumb" onerror="this.src='https://via.placeholder.com/50'"></td>
          <td><b>${p.name}</b></td>
          <td><span class="badge badge-info">${catName}</span></td>
          <td>₹${Number(p.price).toLocaleString('en-IN')}</td>
          <td>${p.material || '-'}</td>
          <td><span class="badge ${p.stock === 'in-stock' ? 'badge-success' : 'badge-warning'}">${p.stock}</span></td>
          <td>
            <div class="action-btns">
              <button type="button" class="btn btn-secondary btn-icon" onclick="ProductsModule.editProduct('${p._id}')" title="Edit">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="btn btn-danger btn-icon" onclick="ProductsModule.deleteProduct('${p._id}', '${p.name.replace(/'/g, "\\'")}')" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  bindEvents() {
    const filterCat = document.getElementById('productCategoryFilter');
    const searchInput = document.getElementById('productSearchInput');
    const addBtn = document.getElementById('btnOpenAddProduct');
    const form = document.getElementById('productForm');
    const imgInput = document.getElementById('prodImgFile');

    if (filterCat) filterCat.addEventListener('change', () => this.renderTable());
    if (searchInput) searchInput.addEventListener('input', () => this.renderTable());
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
            document.getElementById('prodImgUrl').value = data.url;
            document.getElementById('prodImgPreview').src = data.url;
            document.getElementById('prodImgPreview').classList.remove('hidden');
          }
        } catch (err) {
          alert('Failed to upload image: ' + err.message);
        }
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveProduct();
      });
    }
  },

  openModal(product = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');

    form.reset();
    document.getElementById('productId').value = '';
    document.getElementById('prodImgPreview').classList.add('hidden');

    if (product) {
      modalTitle.textContent = 'Edit Product';
      document.getElementById('productId').value = product._id;
      document.getElementById('prodName').value = product.name;
      document.getElementById('prodCategory').value = product.category;
      document.getElementById('prodPrice').value = product.price;
      document.getElementById('prodMaterialType').value = product.materialType || 'wood';
      document.getElementById('prodMaterial').value = product.material || '';
      document.getElementById('prodWarranty').value = product.warranty || '';
      document.getElementById('prodStock').value = product.stock || 'in-stock';
      document.getElementById('prodBadge').value = product.badge || '';
      document.getElementById('prodImgUrl').value = product.img || '';
      document.getElementById('prodDesc').value = product.desc || '';

      if (product.img) {
        document.getElementById('prodImgPreview').src = product.img;
        document.getElementById('prodImgPreview').classList.remove('hidden');
      }
    } else {
      modalTitle.textContent = 'Add New Product';
    }

    modal.classList.add('open');
  },

  closeModal() {
    document.getElementById('productModal').classList.remove('open');
  },

  editProduct(id) {
    const product = this.productsList.find((p) => p._id === id);
    if (product) this.openModal(product);
  },

  async saveProduct() {
    const id = document.getElementById('productId').value;
    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodCategory').value;
    const price = Number(document.getElementById('prodPrice').value);
    const materialType = document.getElementById('prodMaterialType').value;
    const material = document.getElementById('prodMaterial').value.trim();
    const warranty = document.getElementById('prodWarranty').value.trim();
    const stock = document.getElementById('prodStock').value;
    const badge = document.getElementById('prodBadge').value.trim();
    const img = document.getElementById('prodImgUrl').value.trim();
    const desc = document.getElementById('prodDesc').value.trim();

    if (!name || !category || !img || isNaN(price)) {
      alert('Please fill out all required fields (Name, Category, Price, Image).');
      return;
    }

    const payload = {
      name,
      category,
      price,
      materialType,
      material,
      warranty,
      stock,
      badge,
      img,
      desc,
    };

    const url = id ? `/api/products/${id}` : '/api/products';
    const method = id ? 'PUT' : 'POST';

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
      await this.loadProducts();
      if (window.DashboardModule) DashboardModule.loadStats();
    } catch (e) {
      alert('Error saving product: ' + e.message);
    }
  },

  async deleteProduct(id, name) {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: AdminAuth.getAuthHeader(),
      });
      if (!res.ok) throw new Error('Delete failed');
      await this.loadProducts();
      if (window.DashboardModule) DashboardModule.loadStats();
    } catch (e) {
      alert('Error deleting product: ' + e.message);
    }
  },
};
