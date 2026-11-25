/**
 * adminViews.js - Administrator Views: Dashboard, Specialties, Doctors, Slots, Oversight, Patients
 * FR-14, FR-15, FR-16, FR-17, FR-18
 */

(function () {
  const AdminViews = {
    renderDashboard(activeTab = 'oversight') {
      const container = document.getElementById('main-viewport');
      const admin = CABS.Auth.getCurrentUser();
      if (!container || !admin) return;

      container.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">Clinic Administration</h1>
            <p class="page-subtitle">Hospital oversight, doctors, clinical specialties, schedules, and patient registries</p>
          </div>
        </div>

        <!-- Admin Section Tabs -->
        <div class="tabs-nav">
          <button type="button" class="tab-btn ${activeTab === 'oversight' ? 'active' : ''}" id="adm-tab-oversight">Appointments Oversight</button>
          <button type="button" class="tab-btn ${activeTab === 'doctors' ? 'active' : ''}" id="adm-tab-doctors">Doctors Registry</button>
          <button type="button" class="tab-btn ${activeTab === 'specialties' ? 'active' : ''}" id="adm-tab-specialties">Specialties</button>
          <button type="button" class="tab-btn ${activeTab === 'slots' ? 'active' : ''}" id="adm-tab-slots">Time Slot Schedules</button>
          <button type="button" class="tab-btn ${activeTab === 'patients' ? 'active' : ''}" id="adm-tab-patients">Patient Records</button>
        </div>

        <div id="admin-tab-container">
          <!-- Dynamic tab content -->
        </div>
      `;

      const tabs = {
        oversight: document.getElementById('adm-tab-oversight'),
        doctors: document.getElementById('adm-tab-doctors'),
        specialties: document.getElementById('adm-tab-specialties'),
        slots: document.getElementById('adm-tab-slots'),
        patients: document.getElementById('adm-tab-patients')
      };

      const switchTab = (name) => {
        Object.entries(tabs).forEach(([k, btn]) => {
          if (btn) {
            if (k === name) btn.classList.add('active');
            else btn.classList.remove('active');
          }
        });

        if (name === 'oversight') this.renderOversightTab();
        else if (name === 'doctors') this.renderDoctorsTab();
        else if (name === 'specialties') this.renderSpecialtiesTab();
        else if (name === 'slots') this.renderSlotsTab();
        else if (name === 'patients') this.renderPatientsTab();
      };

      Object.entries(tabs).forEach(([name, btn]) => {
        btn?.addEventListener('click', () => switchTab(name));
      });

      switchTab(activeTab);
    },

    /**
     * FR-17: Admin Oversight (All appointments with date, doctor, patient, status filters & cancel)
     */
    renderOversightTab() {
      const container = document.getElementById('admin-tab-container');
      if (!container) return;

      const doctors = CABS.Storage.getDoctors();
      const patients = CABS.Storage.getPatients();

      container.innerHTML = `
        <div class="filters-bar">
          <div style="flex: 1 1 160px;">
            <label class="form-label" for="filter-apt-date">Date</label>
            <input type="date" id="filter-apt-date" class="form-input" />
          </div>

          <div style="flex: 1 1 180px;">
            <label class="form-label" for="filter-apt-doc">Doctor</label>
            <select id="filter-apt-doc" class="form-select">
              <option value="all">All Doctors</option>
              ${doctors.map(d => `<option value="${d.id}">${CABS.UI.escapeHtml(d.name)}</option>`).join('')}
            </select>
          </div>

          <div style="flex: 1 1 180px;">
            <label class="form-label" for="filter-apt-pat">Patient</label>
            <select id="filter-apt-pat" class="form-select">
              <option value="all">All Patients</option>
              ${patients.map(p => `<option value="${p.id}">${CABS.UI.escapeHtml(p.fullName)}</option>`).join('')}
            </select>
          </div>

          <div style="flex: 1 1 140px;">
            <label class="form-label" for="filter-apt-status">Status</label>
            <select id="filter-apt-status" class="form-select">
              <option value="all">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-Show">No-Show</option>
            </select>
          </div>

          <div style="flex: 0 0 auto; align-self: flex-end;">
            <button type="button" id="btn-reset-apt-filters" class="btn btn-secondary btn-sm">Reset</button>
          </div>
        </div>

        <div id="oversight-table-container">
          <!-- Populated -->
        </div>
      `;

      const dateF = document.getElementById('filter-apt-date');
      const docF = document.getElementById('filter-apt-doc');
      const patF = document.getElementById('filter-apt-pat');
      const statusF = document.getElementById('filter-apt-status');
      const resetBtn = document.getElementById('btn-reset-apt-filters');
      const tableContainer = document.getElementById('oversight-table-container');

      const refreshTable = () => {
        const appointments = CABS.AppointmentService.getAdminAppointments({
          date: dateF.value || null,
          doctorId: docF.value,
          patientId: patF.value,
          status: statusF.value
        });

        if (!appointments.length) {
          tableContainer.innerHTML = `
            <div class="empty-state">
              <h3 class="empty-state-title">No appointments found</h3>
              <p class="empty-state-text">No records matched the selected oversight filter criteria.</p>
            </div>
          `;
          return;
        }

        tableContainer.innerHTML = `
          <div class="table-responsive">
            <table class="cabs-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style="text-align: right;">Admin Action</th>
                </tr>
              </thead>
              <tbody>
                ${appointments.map(a => `
                  <tr>
                    <td>
                      <strong>${CABS.UI.formatDate(a.date)}</strong><br>
                      <span style="font-size: 0.85rem; color: var(--text-muted);">${a.startTime} - ${a.endTime}</span>
                    </td>
                    <td>
                      <strong>${CABS.UI.escapeHtml(a.patientName)}</strong><br>
                      <span style="font-size: 0.8rem; color: var(--text-muted);">${CABS.UI.escapeHtml(a.patientPhone || a.patientEmail)}</span>
                    </td>
                    <td><strong>${CABS.UI.escapeHtml(a.doctorName)}</strong></td>
                    <td>${CABS.UI.escapeHtml(a.specialtyName)}</td>
                    <td>${CABS.UI.renderStatusBadge(a.status)}</td>
                    <td style="max-width: 220px; font-size: 0.85rem; color: var(--text-muted);">${CABS.UI.escapeHtml(a.notes || '—')}</td>
                    <td style="text-align: right;">
                      ${a.status === 'Booked' ? `
                        <button type="button" class="btn btn-danger btn-sm btn-admin-cancel-apt" data-id="${a.id}">
                          Cancel Visit
                        </button>
                      ` : `
                        <span style="font-size: 0.85rem; color: var(--text-muted);">—</span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        // FR-17: Admin cancel booking (also frees slot)
        tableContainer.querySelectorAll('.btn-admin-cancel-apt').forEach(btn => {
          btn.addEventListener('click', () => {
            const apptId = btn.getAttribute('data-id');
            const apt = CABS.Storage.findAppointmentById(apptId);
            if (!apt) return;

            CABS.UI.showModal({
              title: 'Administrative Appointment Cancellation',
              contentHtml: `
                <p>Are you sure you want to administratively cancel this appointment for patient on <strong>${CABS.UI.formatDate(apt.date)}</strong> at <strong>${apt.startTime} - ${apt.endTime}</strong>?</p>
                <div class="form-group" style="margin-top: 1rem;">
                  <label class="form-label" for="admin-cancel-note">Cancellation Notice:</label>
                  <input type="text" id="admin-cancel-note" class="form-input" placeholder="e.g. Doctor emergency or administrative schedule adjustment" />
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted);">This action will mark the visit Cancelled and immediately release the time slot back to Available.</p>
              `,
              confirmText: 'Cancel Appointment',
              cancelText: 'Keep Active',
              onConfirm: async () => {
                const note = document.getElementById('admin-cancel-note')?.value || 'Admin cancelled';
                const res = CABS.AppointmentService.cancelAppointment(apptId, CABS.Auth.getSession().userId, note);
                if (res.success) {
                  CABS.UI.showToast(res.message, 'success');
                  refreshTable();
                  return false;
                } else {
                  CABS.UI.showToast(res.message, 'error');
                  return true;
                }
              }
            });
          });
        });
      };

      dateF.addEventListener('change', refreshTable);
      docF.addEventListener('change', refreshTable);
      patF.addEventListener('change', refreshTable);
      statusF.addEventListener('change', refreshTable);
      resetBtn.addEventListener('click', () => {
        dateF.value = '';
        docF.value = 'all';
        patF.value = 'all';
        statusF.value = 'all';
        refreshTable();
      });

      refreshTable();
    },

    /**
     * FR-15: Doctors Registry (Add, Edit, Deactivate/Reactivate)
     */
    renderDoctorsTab() {
      const container = document.getElementById('admin-tab-container');
      if (!container) return;

      const doctors = CABS.Storage.getDoctors();
      const specialties = CABS.SpecialtyService.getAll();

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <h2 class="card-title" style="margin-bottom: 0.2rem;">Doctor Staff Registry</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Manage physician credentials, active status, and consultation rates</p>
          </div>
          <button type="button" id="btn-add-doc-dialog" class="btn btn-primary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Add New Doctor
          </button>
        </div>

        <div class="table-responsive">
          <table class="cabs-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Email</th>
                <th>Experience</th>
                <th>Fee</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${doctors.map(d => {
                const spec = specialties.find(s => s.id === d.specialtyId);
                return `
                  <tr>
                    <td>
                      <strong>${CABS.UI.escapeHtml(d.name)}</strong><br>
                      <span style="font-size: 0.8rem; color: var(--text-muted);">${CABS.UI.escapeHtml(d.consultationHours)}</span>
                    </td>
                    <td>${CABS.UI.escapeHtml(spec ? spec.name : '—')}</td>
                    <td style="font-size: 0.85rem;">${CABS.UI.escapeHtml(d.email)}</td>
                    <td>${d.experienceYears} Years</td>
                    <td><strong>${CABS.UI.formatCurrency(d.fee)}</strong></td>
                    <td>
                      <span class="badge ${d.active ? 'badge-available' : 'badge-blocked'}">
                        ${d.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      <button type="button" class="btn btn-secondary btn-sm btn-edit-doc" data-id="${d.id}">Edit</button>
                      <button type="button" class="btn btn-outline btn-sm btn-toggle-doc-status" data-id="${d.id}" style="${d.active ? 'color: #e11d48; border-color: #fca5a5;' : 'color: #059669; border-color: #6ee7b7;'}">
                        ${d.active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Toggle Active / Deactivate (FR-15)
      container.querySelectorAll('.btn-toggle-doc-status').forEach(btn => {
        btn.addEventListener('click', () => {
          const docId = btn.getAttribute('data-id');
          const doc = CABS.Storage.findDoctorById(docId);
          if (!doc) return;

          const action = doc.active ? 'deactivate' : 'reactivate';
          CABS.UI.showModal({
            title: `${action === 'deactivate' ? 'Deactivate' : 'Reactivate'} Doctor`,
            contentHtml: `
              <p>Are you sure you want to <strong>${action}</strong> <strong>${CABS.UI.escapeHtml(doc.name)}</strong>?</p>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
                ${action === 'deactivate' ? 'Deactivating will immediately hide this doctor from the patient directory and prevent new bookings, but existing appointments and visit history remain preserved.' : 'Reactivating will make this doctor visible to patients and enable appointment bookings.'}
              </p>
            `,
            confirmText: `Confirm ${action}`,
            cancelText: 'Cancel',
            onConfirm: async () => {
              const res = CABS.DoctorService.toggleDoctorStatus(docId);
              if (res.success) {
                CABS.UI.showToast(res.message, 'success');
                AdminViews.renderDoctorsTab();
                return false;
              } else {
                CABS.UI.showToast(res.message, 'error');
                return true;
              }
            }
          });
        });
      });

      // Add Doctor Dialog (FR-15)
      document.getElementById('btn-add-doc-dialog')?.addEventListener('click', () => {
        CABS.UI.showModal({
          title: 'Add New Doctor',
          size: 'lg',
          contentHtml: `
            <form id="form-add-doc" novalidate>
              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="doc-add-name">Doctor Full Name *</label>
                  <input type="text" id="doc-add-name" class="form-input" placeholder="Dr. Jane Doe" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="doc-add-email">Email Address *</label>
                  <input type="email" id="doc-add-email" class="form-input" placeholder="jane.doe@cabs.local" required />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="doc-add-specialty">Specialty *</label>
                  <select id="doc-add-specialty" class="form-select">
                    ${specialties.map(s => `<option value="${s.id}">${CABS.UI.escapeHtml(s.name)}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="doc-add-exp">Experience (Years)</label>
                  <input type="number" id="doc-add-exp" class="form-input" value="10" min="0" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="doc-add-fee">Consultation Fee ($) *</label>
                  <input type="number" id="doc-add-fee" class="form-input" value="100" min="0" step="5" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="doc-add-hours">Consultation Hours</label>
                  <input type="text" id="doc-add-hours" class="form-input" value="09:00 - 17:00" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="doc-add-bio">Professional Bio / Summary</label>
                <textarea id="doc-add-bio" class="form-textarea" rows="2" placeholder="Clinical background, credentials, and specialties..."></textarea>
              </div>

              <div class="form-group">
                <label class="form-label" for="doc-add-password">Initial Password (Default: doctor123)</label>
                <input type="text" id="doc-add-password" class="form-input" value="doctor123" />
              </div>

              <div id="doc-add-error" class="form-error"></div>
            </form>
          `,
          confirmText: 'Save Doctor',
          cancelText: 'Cancel',
          onConfirm: async () => {
            const name = document.getElementById('doc-add-name')?.value;
            const email = document.getElementById('doc-add-email')?.value;
            const specialtyId = document.getElementById('doc-add-specialty')?.value;
            const exp = document.getElementById('doc-add-exp')?.value;
            const fee = document.getElementById('doc-add-fee')?.value;
            const hours = document.getElementById('doc-add-hours')?.value;
            const bio = document.getElementById('doc-add-bio')?.value;
            const password = document.getElementById('doc-add-password')?.value;

            const res = await CABS.DoctorService.addDoctor({
              name,
              email,
              specialtyId,
              experienceYears: exp,
              fee,
              bio,
              consultationHours: hours,
              password
            });

            if (!res.success) {
              const err = document.getElementById('doc-add-error');
              if (err) {
                err.textContent = res.message;
                err.classList.add('visible');
              }
              CABS.UI.showToast(res.message, 'error');
              return true; // Keep modal open
            }

            CABS.UI.showToast(res.message, 'success');
            AdminViews.renderDoctorsTab();
            return false;
          }
        });
      });

      // Edit Doctor Dialog (FR-15)
      container.querySelectorAll('.btn-edit-doc').forEach(btn => {
        btn.addEventListener('click', () => {
          const docId = btn.getAttribute('data-id');
          const doc = CABS.Storage.findDoctorById(docId);
          if (!doc) return;

          CABS.UI.showModal({
            title: `Edit ${CABS.UI.escapeHtml(doc.name)}`,
            size: 'lg',
            contentHtml: `
              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="doc-edit-name">Name</label>
                  <input type="text" id="doc-edit-name" class="form-input" value="${CABS.UI.escapeHtml(doc.name)}" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="doc-edit-email">Email</label>
                  <input type="email" id="doc-edit-email" class="form-input" value="${CABS.UI.escapeHtml(doc.email)}" required />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="doc-edit-specialty">Specialty</label>
                  <select id="doc-edit-specialty" class="form-select">
                    ${specialties.map(s => `<option value="${s.id}" ${s.id === doc.specialtyId ? 'selected' : ''}>${CABS.UI.escapeHtml(s.name)}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="doc-edit-fee">Fee ($)</label>
                  <input type="number" id="doc-edit-fee" class="form-input" value="${doc.fee}" min="0" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="doc-edit-exp">Experience (Years)</label>
                  <input type="number" id="doc-edit-exp" class="form-input" value="${doc.experienceYears}" min="0" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="doc-edit-hours">Hours</label>
                  <input type="text" id="doc-edit-hours" class="form-input" value="${CABS.UI.escapeHtml(doc.consultationHours)}" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="doc-edit-bio">Bio</label>
                <textarea id="doc-edit-bio" class="form-textarea" rows="2">${CABS.UI.escapeHtml(doc.bio)}</textarea>
              </div>
              <div id="doc-edit-error" class="form-error"></div>
            `,
            confirmText: 'Save Changes',
            cancelText: 'Cancel',
            onConfirm: async () => {
              const name = document.getElementById('doc-edit-name')?.value;
              const email = document.getElementById('doc-edit-email')?.value;
              const specialtyId = document.getElementById('doc-edit-specialty')?.value;
              const fee = document.getElementById('doc-edit-fee')?.value;
              const experienceYears = document.getElementById('doc-edit-exp')?.value;
              const consultationHours = document.getElementById('doc-edit-hours')?.value;
              const bio = document.getElementById('doc-edit-bio')?.value;

              const res = CABS.DoctorService.updateDoctor(docId, {
                name,
                email,
                specialtyId,
                fee,
                experienceYears,
                consultationHours,
                bio
              });

              if (!res.success) {
                const err = document.getElementById('doc-edit-error');
                if (err) {
                  err.textContent = res.message;
                  err.classList.add('visible');
                }
                CABS.UI.showToast(res.message, 'error');
                return true;
              }

              CABS.UI.showToast(res.message, 'success');
              AdminViews.renderDoctorsTab();
              return false;
            }
          });
        });
      });
    },

    /**
     * FR-14: Specialties Management (Add & Edit, block blank & duplicate names)
     */
    renderSpecialtiesTab() {
      const container = document.getElementById('admin-tab-container');
      if (!container) return;

      const specialties = CABS.SpecialtyService.getAll();
      const doctors = CABS.Storage.getDoctors();

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <h2 class="card-title" style="margin-bottom: 0.2rem;">Medical Specialties</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Manage clinical disciplines and their descriptions</p>
          </div>
          <button type="button" id="btn-add-spec-dialog" class="btn btn-primary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Add Specialty
          </button>
        </div>

        <div class="table-responsive">
          <table class="cabs-table">
            <thead>
              <tr>
                <th style="width: 25%;">Specialty Name</th>
                <th>Clinical Description</th>
                <th style="width: 15%;">Assigned Doctors</th>
                <th style="width: 15%; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${specialties.map(s => {
                const assignedDocs = doctors.filter(d => d.specialtyId === s.id);
                return `
                  <tr>
                    <td><strong>${CABS.UI.escapeHtml(s.name)}</strong></td>
                    <td style="font-size: 0.875rem; color: var(--text-secondary);">${CABS.UI.escapeHtml(s.description || '—')}</td>
                    <td>${assignedDocs.length} Doctor${assignedDocs.length === 1 ? '' : 's'}</td>
                    <td style="text-align: right;">
                      <button type="button" class="btn btn-secondary btn-sm btn-edit-spec" data-id="${s.id}">Edit</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Add Specialty Dialog (FR-14)
      document.getElementById('btn-add-spec-dialog')?.addEventListener('click', () => {
        CABS.UI.showModal({
          title: 'Add Medical Specialty',
          contentHtml: `
            <div class="form-group">
              <label class="form-label" for="spec-add-name">Specialty Name *</label>
              <input type="text" id="spec-add-name" class="form-input" placeholder="e.g. Ophthalmology" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="spec-add-desc">Clinical Description</label>
              <textarea id="spec-add-desc" class="form-textarea" rows="3" placeholder="Scope of medical practice..."></textarea>
            </div>
            <div id="spec-add-error" class="form-error"></div>
          `,
          confirmText: 'Save Specialty',
          cancelText: 'Cancel',
          onConfirm: async () => {
            const name = document.getElementById('spec-add-name')?.value;
            const desc = document.getElementById('spec-add-desc')?.value;

            const res = CABS.SpecialtyService.addSpecialty({ name, description: desc });
            if (!res.success) {
              const err = document.getElementById('spec-add-error');
              if (err) {
                err.textContent = res.message;
                err.classList.add('visible');
              }
              CABS.UI.showToast(res.message, 'error');
              return true;
            }

            CABS.UI.showToast(res.message, 'success');
            AdminViews.renderSpecialtiesTab();
            return false;
          }
        });
      });

      // Edit Specialty Dialog (FR-14)
      container.querySelectorAll('.btn-edit-spec').forEach(btn => {
        btn.addEventListener('click', () => {
          const specId = btn.getAttribute('data-id');
          const spec = CABS.Storage.findSpecialtyById(specId);
          if (!spec) return;

          CABS.UI.showModal({
            title: `Edit Specialty: ${CABS.UI.escapeHtml(spec.name)}`,
            contentHtml: `
              <div class="form-group">
                <label class="form-label" for="spec-edit-name">Specialty Name *</label>
                <input type="text" id="spec-edit-name" class="form-input" value="${CABS.UI.escapeHtml(spec.name)}" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="spec-edit-desc">Description</label>
                <textarea id="spec-edit-desc" class="form-textarea" rows="3">${CABS.UI.escapeHtml(spec.description)}</textarea>
              </div>
              <div id="spec-edit-error" class="form-error"></div>
            `,
            confirmText: 'Update Specialty',
            cancelText: 'Cancel',
            onConfirm: async () => {
              const name = document.getElementById('spec-edit-name')?.value;
              const desc = document.getElementById('spec-edit-desc')?.value;

              const res = CABS.SpecialtyService.updateSpecialty(specId, { name, description: desc });
              if (!res.success) {
                const err = document.getElementById('spec-edit-error');
                if (err) {
                  err.textContent = res.message;
                  err.classList.add('visible');
                }
                CABS.UI.showToast(res.message, 'error');
                return true;
              }

              CABS.UI.showToast(res.message, 'success');
              AdminViews.renderSpecialtiesTab();
              return false;
            }
          });
        });
      });
    },

    /**
     * FR-16: Admin Time Slots Management (Any doctor)
     */
    renderSlotsTab() {
      const container = document.getElementById('admin-tab-container');
      if (!container) return;

      const doctors = CABS.Storage.getDoctors();
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      container.innerHTML = `
        <div class="filters-bar" style="justify-content: space-between;">
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1rem;">
            <div>
              <label class="form-label" for="admin-slot-doc" style="margin-bottom: 0;">Doctor:</label>
              <select id="admin-slot-doc" class="form-select" style="width: auto;">
                ${doctors.map(d => `<option value="${d.id}">${CABS.UI.escapeHtml(d.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label" for="admin-slot-date" style="margin-bottom: 0;">Date:</label>
              <input type="date" id="admin-slot-date" class="form-input" style="width: auto;" value="${todayStr}" />
            </div>
          </div>

          <button type="button" id="btn-admin-add-slot" class="btn btn-primary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Add Slot for Doctor
          </button>
        </div>

        <div id="admin-slots-grid-area" style="margin-top: 1.5rem;">
          <!-- Populated -->
        </div>
      `;

      const docSelect = document.getElementById('admin-slot-doc');
      const datePicker = document.getElementById('admin-slot-date');
      const gridArea = document.getElementById('admin-slots-grid-area');

      const refreshSlots = () => {
        const docId = docSelect.value;
        const targetDate = datePicker.value;
        const slots = CABS.SlotService.getSlotsForDoctor(docId, targetDate);

        gridArea.innerHTML = `
          <div class="card">
            <h3 class="card-title" style="margin-bottom: 0.35rem;">Configured Slots</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
              Click an Available or Blocked slot to toggle status. Active Booked slots cannot be blocked.
            </p>

            ${!slots.length ? `
              <div class="empty-state">
                <h3 class="empty-state-title">No slots found</h3>
                <p class="empty-state-text">No time slots exist for this doctor on ${CABS.UI.formatDate(targetDate)}.</p>
              </div>
            ` : `
              <div class="slot-grid">
                ${slots.map(s => `
                  <div class="slot-btn ${s.status === 'Available' ? 'slot-available' : (s.status === 'Booked' ? 'slot-booked' : 'slot-blocked')}"
                       style="cursor: ${s.status === 'Booked' ? 'default' : 'pointer'};"
                       data-slot-id="${s.id}">
                    <span class="slot-time">${s.startTime} - ${s.endTime}</span>
                    <span class="badge ${s.status === 'Available' ? 'badge-available' : (s.status === 'Booked' ? 'badge-booked' : 'badge-blocked')}">${s.status}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        `;

        gridArea.querySelectorAll('.slot-btn').forEach(btn => {
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
              refreshSlots();
            } else {
              CABS.UI.showToast(res.message, 'error');
            }
          });
        });
      };

      docSelect.addEventListener('change', refreshSlots);
      datePicker.addEventListener('change', refreshSlots);
      refreshSlots();

      // Add Slot Dialog (FR-16)
      document.getElementById('btn-admin-add-slot')?.addEventListener('click', () => {
        const docId = docSelect.value;
        const curDate = datePicker.value;
        const doc = CABS.Storage.findDoctorById(docId);

        CABS.UI.showModal({
          title: `Create Slot for ${CABS.UI.escapeHtml(doc ? doc.name : 'Doctor')}`,
          contentHtml: `
            <div class="form-group">
              <label class="form-label" for="adm-new-slot-date">Date</label>
              <input type="date" id="adm-new-slot-date" class="form-input" value="${curDate}" required />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="adm-new-slot-start">Start Time</label>
                <input type="time" id="adm-new-slot-start" class="form-input" value="12:00" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="adm-new-slot-end">End Time</label>
                <input type="time" id="adm-new-slot-end" class="form-input" value="12:30" required />
              </div>
            </div>
            <div id="adm-new-slot-error" class="form-error"></div>
          `,
          confirmText: 'Create Slot',
          cancelText: 'Cancel',
          onConfirm: async () => {
            const date = document.getElementById('adm-new-slot-date')?.value;
            const startTime = document.getElementById('adm-new-slot-start')?.value;
            const endTime = document.getElementById('adm-new-slot-end')?.value;

            const res = CABS.SlotService.createSlot({
              doctorId: docId,
              date,
              startTime,
              endTime
            });

            if (!res.success) {
              const err = document.getElementById('adm-new-slot-error');
              if (err) {
                err.textContent = res.message;
                err.classList.add('visible');
              }
              CABS.UI.showToast(res.message, 'error');
              return true;
            }

            CABS.UI.showToast('Slot created successfully.', 'success');
            refreshSlots();
            return false;
          }
        });
      });
    },

    /**
     * FR-18: Patient Records (List, search by name, email, phone, view details & history)
     */
    renderPatientsTab() {
      const container = document.getElementById('admin-tab-container');
      if (!container) return;

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <h2 class="card-title" style="margin-bottom: 0.2rem;">Patient Registry</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Lookup patient files, contact information, and consultation history</p>
          </div>
        </div>

        <div class="filters-bar">
          <div class="search-input-group">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" id="patient-search-input" class="form-input" placeholder="Search patient by name, email, or phone number..." />
          </div>
        </div>

        <div id="patients-table-container">
          <!-- Populated -->
        </div>
      `;

      const searchInput = document.getElementById('patient-search-input');
      const tableArea = document.getElementById('patients-table-container');

      const refreshPatients = () => {
        const query = searchInput.value;
        const patients = CABS.AppointmentService.searchPatients(query);

        if (!patients.length) {
          tableArea.innerHTML = `
            <div class="empty-state">
              <h3 class="empty-state-title">No patients found</h3>
              <p class="empty-state-text">No registered patient matched "${CABS.UI.escapeHtml(query)}".</p>
            </div>
          `;
          return;
        }

        tableArea.innerHTML = `
          <div class="table-responsive">
            <table class="cabs-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Date of Birth</th>
                  <th style="text-align: right;">Medical History</th>
                </tr>
              </thead>
              <tbody>
                ${patients.map(p => `
                  <tr>
                    <td><strong>${CABS.UI.escapeHtml(p.fullName)}</strong></td>
                    <td>${CABS.UI.escapeHtml(p.email)}</td>
                    <td>${CABS.UI.escapeHtml(p.phone || '—')}</td>
                    <td>${p.dateOfBirth || '—'}</td>
                    <td style="text-align: right;">
                      <button type="button" class="btn btn-secondary btn-sm btn-view-patient-record" data-id="${p.id}">
                        View Profile & History
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        // Open Patient Record (FR-18)
        tableArea.querySelectorAll('.btn-view-patient-record').forEach(btn => {
          btn.addEventListener('click', () => {
            const patId = btn.getAttribute('data-id');
            const record = CABS.AppointmentService.getPatientRecord(patId);
            if (!record) return;

            const { patient, appointments } = record;

            CABS.UI.showModal({
              title: `Patient Record: ${CABS.UI.escapeHtml(patient.fullName)}`,
              size: 'lg',
              contentHtml: `
                <div style="background-color: var(--bg-subtle); padding: 1rem 1.25rem; border-radius: var(--radius-sm); margin-bottom: 1.25rem;">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.9rem;">
                    <div><strong>Full Name:</strong> ${CABS.UI.escapeHtml(patient.fullName)}</div>
                    <div><strong>Email:</strong> ${CABS.UI.escapeHtml(patient.email)}</div>
                    <div><strong>Phone:</strong> ${CABS.UI.escapeHtml(patient.phone || '—')}</div>
                    <div><strong>Date of Birth:</strong> ${patient.dateOfBirth || '—'}</div>
                  </div>
                </div>

                <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem;">Appointment History (${appointments.all.length} Total)</h4>
                ${!appointments.all.length ? `
                  <p style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">No appointments on file for this patient.</p>
                ` : `
                  <div class="table-responsive" style="max-height: 280px; overflow-y: auto;">
                    <table class="cabs-table" style="font-size: 0.85rem;">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Doctor</th>
                          <th>Status</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${appointments.all.map(a => `
                          <tr>
                            <td>${a.date}</td>
                            <td>${a.startTime} - ${a.endTime}</td>
                            <td><strong>${CABS.UI.escapeHtml(a.doctorName)}</strong></td>
                            <td>${CABS.UI.renderStatusBadge(a.status)}</td>
                            <td>${CABS.UI.escapeHtml(a.notes || '—')}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `}
              `,
              confirmText: 'Done',
              cancelText: '',
              onConfirm: () => {}
            });
          });
        });
      };

      searchInput.addEventListener('input', refreshPatients);
      refreshPatients();
    }
  };

  window.CABS = window.CABS || {};
  window.CABS.AdminViews = AdminViews;
})();
