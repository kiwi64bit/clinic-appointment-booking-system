/**
 * ui.js - User Interface Helpers, Toasts, Modals, Badges, and Notifications
 * NFR-01, NFR-02, NFR-04
 */

(function () {
  const UI = {
    /**
     * NFR-01: Toast Notification System (< 1 second feedback)
     */
    showToast(message, type = 'info', duration = 3800) {
      let container = document.getElementById('cabs-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'cabs-toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.setAttribute('role', 'alert');

      const icons = {
        success: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
        error: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
        warning: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
        info: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`
      };

      toast.innerHTML = `
        <div class="toast-content">
          ${icons[type] || icons.info}
          <div class="toast-message">${this.escapeHtml(message)}</div>
        </div>
        <button type="button" class="toast-close" aria-label="Close notification">&times;</button>
      `;

      const removeToast = () => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 250);
      };

      toast.querySelector('.toast-close').addEventListener('click', removeToast);
      container.appendChild(toast);

      setTimeout(removeToast, duration);
    },

    /**
     * Modal Dialog Manager
     */
    showModal({ title, contentHtml, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, size = 'md' }) {
      this.closeModal();

      const modalOverlay = document.createElement('div');
      modalOverlay.id = 'cabs-active-modal';
      modalOverlay.className = 'modal-backdrop';
      modalOverlay.setAttribute('role', 'dialog');
      modalOverlay.setAttribute('aria-modal', 'true');
      modalOverlay.setAttribute('aria-labelledby', 'modal-dialog-title');

      modalOverlay.innerHTML = `
        <div class="modal-dialog modal-${size}">
          <div class="modal-header">
            <h3 id="modal-dialog-title" class="modal-title">${this.escapeHtml(title)}</h3>
            <button type="button" class="btn-close" aria-label="Close modal">&times;</button>
          </div>
          <div class="modal-body">
            ${contentHtml}
          </div>
          <div class="modal-footer">
            ${cancelText ? `<button type="button" class="btn btn-secondary modal-btn-cancel">${this.escapeHtml(cancelText)}</button>` : ''}
            ${confirmText ? `<button type="button" class="btn btn-primary modal-btn-confirm">${this.escapeHtml(confirmText)}</button>` : ''}
          </div>
        </div>
      `;

      document.body.appendChild(modalOverlay);
      document.body.classList.add('modal-open');

      const close = () => {
        this.closeModal();
        if (onCancel) onCancel();
      };

      modalOverlay.querySelector('.btn-close').addEventListener('click', close);
      const cancelBtn = modalOverlay.querySelector('.modal-btn-cancel');
      if (cancelBtn) cancelBtn.addEventListener('click', close);

      const confirmBtn = modalOverlay.querySelector('.modal-btn-confirm');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
          if (onConfirm) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Processing...';
            const keepOpen = await onConfirm();
            if (!keepOpen) {
              this.closeModal();
            } else {
              confirmBtn.disabled = false;
              confirmBtn.textContent = confirmText;
            }
          } else {
            this.closeModal();
          }
        });
      }

      // Close on background click
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) close();
      });

      // Escape key handler
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          close();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    },

    closeModal() {
      const existing = document.getElementById('cabs-active-modal');
      if (existing) {
        existing.remove();
        document.body.classList.remove('modal-open');
      }
    },

    /**
     * Status Badges with designated accessible colors
     * TimeSlot: Available | Booked | Blocked
     * Appointment: Booked | Cancelled | Completed | No-Show
     */
    renderStatusBadge(status) {
      const map = {
        'Available': 'badge-available',
        'Booked': 'badge-booked',
        'Blocked': 'badge-blocked',
        'Completed': 'badge-completed',
        'Cancelled': 'badge-cancelled',
        'No-Show': 'badge-noshow',
        'Past': 'badge-blocked',
        'Current': 'badge-booked'
      };
      const cls = map[status] || 'badge-default';
      return `<span class="badge ${cls}">${this.escapeHtml(status)}</span>`;
    },

    formatCurrency(amount) {
      return `$${Number(amount || 0).toFixed(2)}`;
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const d = new Date(parts[0], parts[1] - 1, parts[2]);
          return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        }
        return dateStr;
      } catch (e) {
        return dateStr;
      }
    },

    escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  };

  window.CABS = window.CABS || {};
  window.CABS.UI = UI;
})();
