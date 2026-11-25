/**
 * doctorViews.js - Doctor Views: Dashboard, Daily Schedule, Visit Status & Slots
 * FR-12, FR-13, FR-16
 */

(function () {
  const DoctorViews = {
    /**
     * FR-12: Doctor Dashboard & Daily Schedule
     */
    renderDashboard() {
      const container = document.getElementById('main-viewport');
      const doctor = CABS.Auth.getCurrentUser();
      if (!container || !doctor) return;

      const specialty = CABS.Storage.findSpecialtyById(doctor.specialtyId);
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      container.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">Doctor Portal: ${CABS.UI.escapeHtml(doctor.name)}</h1>
            <p class="page-subtitle">${CABS.UI.escapeHtml(specialty ? specialty.name : 'Specialist')} | Working Hours: ${CABS.UI.escapeHtml(doctor.consultationHours)}</p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button type="button" id="btn-toggle-slot-modal" class="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Manage My Slots
            </button>
          </div>
        </div>

        <!-- Navigation Tabs: Schedule vs Slot Management -->
        <div class="tabs-nav">
          <button type="button" class="tab-btn active" id="doc-tab-schedule">Daily Schedule</button>
          <button type="button" class="tab-btn" id="doc-tab-slots">My Time Slots</button>
        </div>

        <div id="doctor-view-content">
          <!-- Dynamic schedule or slots -->
        </div>
      `;

      const scheduleTab = document.getElementById('doc-tab-schedule');
      const slotsTab = document.getElementById('doc-tab-slots');

      scheduleTab.addEventListener('click', () => {
        scheduleTab.classList.add('active');
        slotsTab.classList.remove('active');
        this.renderScheduleSection(doctor.id, todayStr);
      });

      slotsTab.addEventListener('click', () => {
        slotsTab.classList.add('active');
        scheduleTab.classList.remove('active');
        this.renderSlotsSection(doctor.id, todayStr);
      });

      document.getElementById('btn-toggle-slot-modal')?.addEventListener('click', () => {
        slotsTab.click();
      });

      // Default view: Schedule today
      this.renderScheduleSection(doctor.id, todayStr);
    },

    /**
     * FR-12: Schedule Section with Date Picker and FR-13 Status Updates
     */
    renderScheduleSection(doctorId, selectedDate) {
      const content = document.getElementById('doctor-view-content');
      if (!content) return;

      const appointments = CABS.AppointmentService.getDoctorDailySchedule(doctorId, selectedDate);

      content.innerHTML = `
        <div class="filters-bar" style="justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <label class="form-label" for="doc-date-picker" style="margin-bottom: 0; white-space: nowrap;">Schedule Date:</label>
            <input type="date" id="doc-date-picker" class="form-input" style="width: auto;" value="${selectedDate}" />
          </div>
          <div style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500;">
            ${appointments.length} appointment${appointments.length === 1 ? '' : 's'} on this date
          </div>
        </div>

        ${!appointments.length ? `
          <div class="empty-state">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <h3 class="empty-state-title">No appointments scheduled</h3>
            <p class="empty-state-text">You have no patient consultations scheduled for ${CABS.UI.formatDate(selectedDate)}.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="cabs-table">
              <thead>
                <tr>
                  <th>Time Window</th>
                  <th>Patient Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Reason / Clinical Notes</th>
                  <th style="text-align: right;">Update Status</th>
                </tr>
              </thead>
              <tbody>
                ${appointments.map(a => `
                  <tr>
                    <td><strong>${a.startTime} - ${a.endTime}</strong></td>
                    <td><strong>${CABS.UI.escapeHtml(a.patientName)}</strong></td>
                    <td style="font-size: 0.85rem; color: var(--text-secondary);">
                      ${CABS.UI.escapeHtml(a.patientPhone || a.patientEmail)}
                    </td>
                    <td>${CABS.UI.renderStatusBadge(a.status)}</td>
                    <td style="max-width: 250px; font-size: 0.85rem; color: var(--text-muted);">
                      ${CABS.UI.escapeHtml(a.notes || '—')}
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      ${a.status === 'Booked' ? `
                        <button type="button" class="btn btn-outline btn-sm btn-mark-status" data-id="${a.id}" data-status="Completed" style="color: #059669; border-color: #10b981;">Mark Completed</button>
                        <button type="button" class="btn btn-secondary btn-sm btn-mark-status" data-id="${a.id}" data-status="No-Show" style="color: #b45309;">No-Show</button>
                      ` : `
                        <span style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">Finalized</span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      `;

      // Date change listener
      document.getElementById('doc-date-picker')?.addEventListener('change', (e) => {
        this.renderScheduleSection(doctorId, e.target.value);
      });

      // FR-13 Status update listeners
      content.querySelectorAll('.btn-mark-status').forEach(btn => {
        btn.addEventListener('click', () => {
          const apptId = btn.getAttribute('data-id');
          const newStatus = btn.getAttribute('data-status');
          const appt = CABS.Storage.findAppointmentById(apptId);
          if (!appt) return;

          CABS.UI.showModal({
            title: `Mark Appointment as ${newStatus}`,
            contentHtml: `
              <p>Are you sure you want to mark this consultation at <strong>${appt.startTime} - ${appt.endTime}</strong> as <strong>${newStatus}</strong>?</p>
              <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label" for="visit-notes-input">Add Consultation Notes / Observations:</label>
                <textarea id="visit-notes-input" class="form-textarea" rows="3" placeholder="Clinical observations, diagnostic notes, or no-show reason..."></textarea>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Once updated to ${newStatus}, this consultation is finalized and moved to past visits.</p>
            `,
            confirmText: `Confirm ${newStatus}`,
            cancelText: 'Cancel',
            onConfirm: async () => {
              const notes = document.getElementById('visit-notes-input')?.value || '';
              const res = CABS.AppointmentService.updateVisitStatus(apptId, doctorId, newStatus, notes);
              if (res.success) {
                CABS.UI.showToast(res.message, 'success');
                const currentDate = document.getElementById('doc-date-picker')?.value || selectedDate;
                DoctorViews.renderScheduleSection(doctorId, currentDate);
                return false;
              } else {
                CABS.UI.showToast(res.message, 'error');
                return true;
              }
            }
          });
        });
      });
    },

    /**
     * FR-16: Doctor Slots Management (View, Create, Block/Unblock Available slots)
     */
    renderSlotsSection(doctorId, selectedDate) {
      const content = document.getElementById('doctor-view-content');
      if (!content) return;

      const slots = CABS.SlotService.getSlotsForDoctor(doctorId, selectedDate);

      content.innerHTML = `
        <div class="filters-bar" style="justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <label class="form-label" for="slot-date-picker" style="margin-bottom: 0; white-space: nowrap;">Slots for Date:</label>
            <input type="date" id="slot-date-picker" class="form-input" style="width: auto;" value="${selectedDate}" />
          </div>

          <button type="button" id="btn-add-slot-dialog" class="btn btn-primary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Add New Slot
          </button>
        </div>

        <div class="card" style="margin-top: 1rem;">
          <h3 class="card-title" style="margin-bottom: 0.5rem;">Scheduled Slots for ${CABS.UI.formatDate(selectedDate)}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Click on an Available or Blocked slot to toggle its status. Slots with active bookings cannot be blocked.
          </p>

          ${!slots.length ? `
            <div class="empty-state">
              <h3 class="empty-state-title">No slots configured for this date</h3>
              <p class="empty-state-text">Create slots using the button above to allow patients to schedule appointments with you.</p>
            </div>
          ` : `
            <div class="slot-grid">
              ${slots.map(s => {
                let badgeCls = 'badge-available';
                let toggleHint = 'Click to block';
                if (s.status === 'Booked') {
                  badgeCls = 'badge-booked';
                  toggleHint = 'Booked (Protected)';
                } else if (s.status === 'Blocked') {
                  badgeCls = 'badge-blocked';
                  toggleHint = 'Click to unblock';
                }

                return `
                  <div class="slot-btn ${s.status === 'Available' ? 'slot-available' : (s.status === 'Booked' ? 'slot-booked' : 'slot-blocked')}"
                       style="cursor: ${s.status === 'Booked' ? 'default' : 'pointer'};"
                       data-slot-id="${s.id}"
                       title="${toggleHint}">
                    <span class="slot-time">${s.startTime} - ${s.endTime}</span>
                    <span class="badge ${badgeCls}">${s.status}</span>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;

      // Date change listener
      document.getElementById('slot-date-picker')?.addEventListener('change', (e) => {
        this.renderSlotsSection(doctorId, e.target.value);
      });

      // Toggle slot block/unblock listener
      content.querySelectorAll('.slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const slotId = btn.getAttribute('data-slot-id');
          const slot = CABS.Storage.findTimeSlotById(slotId);
          if (!slot) return;

          if (slot.status === 'Booked') {
            CABS.UI.showToast('Cannot block a slot that has an active Booked appointment.', 'warning');
            return;
          }

          const res = CABS.SlotService.toggleBlockSlot(slotId);
          if (res.success) {
            CABS.UI.showToast(res.message, 'success');
            const curDate = document.getElementById('slot-date-picker')?.value || selectedDate;
            DoctorViews.renderSlotsSection(doctorId, curDate);
          } else {
            CABS.UI.showToast(res.message, 'error');
          }
        });
      });

      // Add slot modal dialog
      document.getElementById('btn-add-slot-dialog')?.addEventListener('click', () => {
        const curDate = document.getElementById('slot-date-picker')?.value || selectedDate;

        CABS.UI.showModal({
          title: 'Create Time Slot',
          contentHtml: `
            <div class="form-group">
              <label class="form-label" for="new-slot-date">Date</label>
              <input type="date" id="new-slot-date" class="form-input" value="${curDate}" required />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="new-slot-start">Start Time</label>
                <input type="time" id="new-slot-start" class="form-input" value="11:30" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="new-slot-end">End Time</label>
                <input type="time" id="new-slot-end" class="form-input" value="12:00" required />
              </div>
            </div>
            <div id="new-slot-error" class="form-error"></div>
          `,
          confirmText: 'Create Slot',
          cancelText: 'Cancel',
          onConfirm: async () => {
            const date = document.getElementById('new-slot-date')?.value;
            const startTime = document.getElementById('new-slot-start')?.value;
            const endTime = document.getElementById('new-slot-end')?.value;

            const res = CABS.SlotService.createSlot({
              doctorId,
              date,
              startTime,
              endTime
            });

            if (!res.success) {
              const err = document.getElementById('new-slot-error');
              if (err) {
                err.textContent = res.message;
                err.classList.add('visible');
              }
              CABS.UI.showToast(res.message, 'error');
              return true; // Keep open
            }

            CABS.UI.showToast('Time slot successfully created!', 'success');
            DoctorViews.renderSlotsSection(doctorId, date);
            return false;
          }
        });
      });
    }
  };

  window.CABS = window.CABS || {};
  window.CABS.DoctorViews = DoctorViews;
})();
