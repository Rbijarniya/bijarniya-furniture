/**
 * admin/js/dashboard.js
 * Renders overview metrics & recently added products
 */

const DashboardModule = {
  async init() {
    await this.loadStats();
  },

  async loadStats() {
    try {
      const [
        productsRes, categoriesRes, 
        galleryRes, bannersRes, 
        offersRes, priceListRes
      ] = await Promise.all([
        fetch('/api/products', { headers: AdminAuth.getAuthHeader() }),
        fetch('/api/categories', { headers: AdminAuth.getAuthHeader() }),
        fetch('/api/gallery', { headers: AdminAuth.getAuthHeader() }),
        fetch('/api/banners/all', { headers: AdminAuth.getAuthHeader() }),
        fetch('/api/offers/all', { headers: AdminAuth.getAuthHeader() }),
        fetch('/api/pricelist/all', { headers: AdminAuth.getAuthHeader() })
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        document.getElementById('statTotalProducts').textContent = data.length;
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        document.getElementById('statTotalCategories').textContent = data.length;
      }
      if (galleryRes.ok) {
        const data = await galleryRes.json();
        document.getElementById('statTotalGallery').textContent = data.length;
      }
      if (bannersRes.ok) {
        const data = await bannersRes.json();
        document.getElementById('statTotalBanners').textContent = data.filter(b => b.isActive).length;
      }
      if (offersRes.ok) {
        const data = await offersRes.json();
        document.getElementById('statTotalOffers').textContent = data.filter(o => o.isActive).length;
      }
      if (priceListRes.ok) {
        const data = await priceListRes.json();
        document.getElementById('statTotalPriceList').textContent = data.filter(p => p.isActive).length;
      }

      // Fetch recent products separately if needed or handle logic differently
      const response = await fetch('/api/dashboard/stats', { headers: AdminAuth.getAuthHeader() });
      if (response.ok) {
        const data = await response.json();
        this.renderRecentProducts(data.recentProducts || []);
      }
    } catch (error) {
      console.error('Dashboard Error:', error);
    }
  },

  renderRecentProducts(products) {
    const tbody = document.getElementById('recentProductsTbody');
    if (!tbody) return;

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No products added yet. Click "Add Product" to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map((p) => `
      <tr>
        <td>
          <img src="${p.img}" alt="${p.name}" class="table-thumb" onerror="this.src='https://via.placeholder.com/50'">
        </td>
        <td><b>${p.name}</b></td>
        <td><span class="badge badge-info">${p.category}</span></td>
        <td>₹${Number(p.price).toLocaleString('en-IN')}</td>
        <td>
          <span class="badge ${p.stock === 'in-stock' ? 'badge-success' : 'badge-warning'}">${p.stock}</span>
        </td>
      </tr>
    `).join('');
  },
};
