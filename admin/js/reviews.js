/**
 * admin/js/reviews.js
 * Reviews management module for Bijarniya Furniture Admin Panel.
 * Handles pending/approved/rejected reviews, approve/reject, reply, delete.
 */

const ReviewsModule = {
  reviews: [],
  activeFilter: 'all',

  async init() {
    await this.loadReviews();
    this.bindEvents();
  },

  async loadReviews() {
    const container = document.getElementById('reviewsListContainer');
    if (container) container.innerHTML = '<p style="color:var(--text-soft);padding:20px 0;">Loading reviews...</p>';

    try {
      const url = this.activeFilter === 'all'
        ? '/api/customer-reviews/admin'
        : `/api/customer-reviews/admin?status=${this.activeFilter}`;

      const res = await fetch(url, { headers: AdminAuth.getAuthHeader() });
      if (!res.ok) throw new Error('Failed to load reviews.');
      this.reviews = await res.json();
      this.renderReviews();
      this.updateCounts();
    } catch (e) {
      if (container) container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>${e.message}</p></div>`;
    }
  },

  updateCounts() {
    const pending = this.reviews.filter(r => r.status === 'pending').length;
    const approved = this.reviews.filter(r => r.status === 'approved').length;
    const rejected = this.reviews.filter(r => r.status === 'rejected').length;

    const pendingBadge = document.getElementById('reviewPendingCount');
    if (pendingBadge) pendingBadge.textContent = pending;

    ['reviewsCountAll', 'reviewsCountPending', 'reviewsCountApproved', 'reviewsCountRejected'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === 'reviewsCountAll') el.textContent = this.reviews.length;
      if (id === 'reviewsCountPending') el.textContent = pending;
      if (id === 'reviewsCountApproved') el.textContent = approved;
      if (id === 'reviewsCountRejected') el.textContent = rejected;
    });
  },

  escapeHTML(v = '') {
    const d = document.createElement('div');
    d.textContent = v;
    return d.innerHTML;
  },

  starString(rating) {
    const r = Math.max(0, Math.min(5, Math.round(rating || 0)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  },

  formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  statusBadge(status) {
    const map = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
    };
    return `<span class="badge ${map[status] || ''}">${status}</span>`;
  },

  renderReviews() {
    const container = document.getElementById('reviewsListContainer');
    if (!container) return;

    const filtered = this.activeFilter === 'all'
      ? this.reviews
      : this.reviews.filter(r => r.status === this.activeFilter);

    if (!filtered.length) {
      container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-star-half-stroke"></i><p>No ${this.activeFilter === 'all' ? '' : this.activeFilter + ' '}reviews found.</p></div>`;
      return;
    }

    container.innerHTML = filtered.map(review => `
      <div class="review-admin-card" id="adminReview_${review._id}">
        <div class="review-admin-header">
          <div>
            <strong>${this.escapeHTML(review.name)}</strong>
            ${review.mobile ? `<span class="review-email">(${this.escapeHTML(review.mobile)})</span>` : ''}
            <span class="review-stars" aria-label="${review.rating} stars">${this.starString(review.rating)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
            ${this.statusBadge(review.status)}
            <span class="review-date">${this.formatDate(review.createdAt)}</span>
          </div>
        </div>
        <p class="review-comment">"${this.escapeHTML(review.comment)}"</p>

        ${review.adminReply ? `
          <div class="review-admin-reply">
            <b><i class="fa-solid fa-reply"></i> Owner Reply</b>
            <p>${this.escapeHTML(review.adminReply)}</p>
            <small>${this.formatDate(review.adminReplyAt)}</small>
          </div>` : ''}

        <div class="review-admin-reply-form" id="replyForm_${review._id}" style="display:none;">
          <textarea class="form-control" id="replyText_${review._id}" rows="2" placeholder="Write your reply...">${this.escapeHTML(review.adminReply || '')}</textarea>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button class="btn btn-primary btn-sm" onclick="ReviewsModule.saveReply('${review._id}')">
              <i class="fa-solid fa-check"></i> Save Reply
            </button>
            ${review.adminReply ? `<button class="btn btn-secondary btn-sm" onclick="ReviewsModule.deleteReply('${review._id}')">Remove Reply</button>` : ''}
            <button class="btn btn-secondary btn-sm" onclick="ReviewsModule.toggleReplyForm('${review._id}')">Cancel</button>
          </div>
        </div>

        <div class="review-admin-actions">
          ${review.status !== 'approved' ? `<button class="btn btn-success btn-sm" onclick="ReviewsModule.setStatus('${review._id}','approved')"><i class="fa-solid fa-check"></i> Approve</button>` : ''}
          ${review.status !== 'rejected' ? `<button class="btn btn-warning btn-sm" onclick="ReviewsModule.setStatus('${review._id}','rejected')"><i class="fa-solid fa-ban"></i> Reject</button>` : ''}
          ${review.status !== 'pending' ? `<button class="btn btn-secondary btn-sm" onclick="ReviewsModule.setStatus('${review._id}','pending')"><i class="fa-solid fa-clock"></i> Pending</button>` : ''}
          <button class="btn btn-accent btn-sm" onclick="ReviewsModule.toggleReplyForm('${review._id}')"><i class="fa-solid fa-reply"></i> ${review.adminReply ? 'Edit Reply' : 'Reply'}</button>
          <button class="btn btn-danger btn-sm" onclick="ReviewsModule.deleteReview('${review._id}')"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
      </div>
    `).join('');
  },

  toggleReplyForm(id) {
    const form = document.getElementById(`replyForm_${id}`);
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
  },

  async setStatus(id, status) {
    try {
      const res = await fetch(`/api/customer-reviews/${id}/status`, {
        method: 'PATCH',
        headers: AdminAuth.getAuthHeader(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status.');
      await this.loadReviews();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  },

  async saveReply(id) {
    const textarea = document.getElementById(`replyText_${id}`);
    const adminReply = (textarea?.value || '').trim();
    try {
      const res = await fetch(`/api/customer-reviews/${id}/reply`, {
        method: 'PATCH',
        headers: AdminAuth.getAuthHeader(),
        body: JSON.stringify({ adminReply }),
      });
      if (!res.ok) throw new Error('Failed to save reply.');
      await this.loadReviews();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  },

  async deleteReply(id) {
    if (!confirm('Remove your reply?')) return;
    try {
      const res = await fetch(`/api/customer-reviews/${id}/reply`, {
        method: 'PATCH',
        headers: AdminAuth.getAuthHeader(),
        body: JSON.stringify({ adminReply: '' }),
      });
      if (!res.ok) throw new Error('Failed to remove reply.');
      await this.loadReviews();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  },

  async deleteReview(id) {
    if (!confirm('Permanently delete this review? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/customer-reviews/${id}`, {
        method: 'DELETE',
        headers: AdminAuth.getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to delete review.');
      await this.loadReviews();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  },

  bindEvents() {
    document.querySelectorAll('.reviews-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.reviews-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter || 'all';
        this.renderReviews();
      });
    });
  },
};
