/**
 * patientViews.js - Patient Views: Dashboard, Doctors List, Profile, Booking, Appointments
 * FR-04, FR-05, FR-06, FR-07, FR-08, FR-09, FR-10, FR-11
 */

(function () {
  const PatientViews = {
    /**
     * Patient Dashboard
     */
    renderDashboard() {
      const container = document.getElementById('main-viewport');
      const user = CABS.Auth.getCurrentUser();
      if (!container || !user) return;

      const appts = CABS.AppointmentService.getPatientAppointments(user.id);
      const nextVisit = appts.upcoming[0] || null;

      container.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">Welcome, ${CABS.UI.escapeHtml(user.fullName)}</h1>
            <p class="page-subtitle">Manage your consultations, book visits, and track your health records</p>
          </div>
          <a href="#doctors" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Book New Appointment
          </a>
        </div>

        <!-- Quick Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <div class="card" style="padding: 1.25rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">UPCOMING VISITS</div>
            <div style="font-size: 1.85rem; font-weight: 700; color: var(--primary); margin-top: 0.25rem;">${appts.upcoming.length}</div>
          </div>
          <div class="card" style="padding: 1.25rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">PAST CONSULTATIONS</div>
            <div style="font-size: 1.85rem; font-weight: 700; color: var(--text-main); margin-top: 0.25rem;">${appts.past.length}</div>
          </div>
          <div class="card" style="padding: 1.25rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">TOTAL VISITS RECORDED</div>
            <div style="font-size: 1.85rem; font-weight: 700; color: var(--text-secondary); margin-top: 0.25rem;">${appts.all.length}</div>
          </div>
        </div>

        <!-- Next Upcoming Visit Banner -->
        ${nextVisit ? `
          <div class="card" style="border-left: 4px solid var(--primary); margin-bottom: 2rem;">
            <div class="card-header" style="border: none; padding-bottom: 0; margin-bottom: 0.5rem;">
              <span style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--primary);">Next Upcoming Appointment</span>
              ${CABS.UI.renderStatusBadge(nextVisit.status)}
            </div>
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
              <div>
                <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-main);">${CABS.UI.escapeHtml(nextVisit.doctorName)}</h3>
                <p style="color: var(--primary); font-weight: 600; font-size: 0.9rem;">${CABS.UI.escapeHtml(nextVisit.specialtyName)}</p>
                <div style="display: flex; gap: 1rem; color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">
                  <span><strong>Date:</strong> ${CABS.UI.formatDate(nextVisit.date)}</span>
                  <span><strong>Time:</strong> ${nextVisit.startTime} - ${nextVisit.endTime}</span>
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button type="button" class="btn btn-outline btn-sm btn-reschedule" data-id="${nextVisit.id}">Reschedule</button>
                <button type="button" class="btn btn-secondary btn-sm btn-cancel-appt" data-id="${nextVisit.id}">Cancel</button>
              </div>
            </div>
          </div>
        ` : `
          <div class="empty-state" style="margin-bottom: 2rem;">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <h3 class="empty-state-title">No upcoming appointments scheduled</h3>
            <p class="empty-state-text">Ready to see a doctor? Find certified specialists and reserve available slots online in seconds.</p>
            <a href="#doctors" class="btn btn-primary">Find a Doctor</a>
          </div>
        `}

        <!-- Quick Access Hub -->
        <h2 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem;">Quick Navigation</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
          <a href="#doctors" class="card" style="text-decoration: none; color: inherit;">
            <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 0.35rem;">Find Doctors</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Search medical specialists, view ratings, bios, and consultation rates.</p>
          </a>
          <a href="#my-appointments" class="card" style="text-decoration: none; color: inherit;">
            <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 0.35rem;">My Appointments</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Review your active bookings, visit history, and reschedule upcoming consultations.</p>
          </a>
        </div>
      `;

      this.attachAppointmentActions();
    },

    /**
     * FR-04: Doctors List with live filtering by specialty and search term
     */
    renderDoctorsList() {
      const container = document.getElementById('main-viewport');
      if (!container) return;

      const specialties = CABS.SpecialtyService.getAll();

      container.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">Find a Doctor</h1>
            <p class="page-subtitle">Browse certified practitioners, explore specialties, and schedule your appointment</p>
          </div>
        </div>

        <!-- Filter and Search Bar -->
        <div class="filters-bar">
          <div class="search-input-group">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" id="doctor-search-input" class="form-input" placeholder="Search doctor name or expertise..." />
          </div>

          <div style="flex: 0 1 240px;">
            <select id="doctor-specialty-filter" class="form-select">
              <option value="all">All Specialties</option>
              ${specialties.map(s => `<option value="${s.id}">${CABS.UI.escapeHtml(s.name)}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Doctor Grid Container -->
        <div id="doctor-grid-container" class="doctor-grid">
          <!-- Dynamically populated -->
        </div>
      `;

      const searchInput = document.getElementById('doctor-search-input');
      const specialtyFilter = document.getElementById('doctor-specialty-filter');

      const updateList = () => {
        const specialtyId = specialtyFilter.value;
        const search = searchInput.value;
        const doctors = CABS.DoctorService.getActiveDoctors({ specialtyId, search });
        const grid = document.getElementById('doctor-grid-container');

        if (!doctors.length) {
          grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
              <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <h3 class="empty-state-title">No doctors found</h3>
              <p class="empty-state-text">No active doctors matched your current search filters. Try clearing your search term or selecting another specialty.</p>
              <button type="button" id="btn-clear-filters" class="btn btn-secondary btn-sm">Clear Filters</button>
            </div>
          `;
          document.getElementById('btn-clear-filters')?.addEventListener('click', () => {
            searchInput.value = '';
            specialtyFilter.value = 'all';
            updateList();
          });
          return;
        }

        grid.innerHTML = doctors.map(doc => {
          const spec = CABS.Storage.findSpecialtyById(doc.specialtyId);
          const initials = doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2);

          return `
            <div class="doctor-card">
              <div>
                <div class="doctor-header">
                  <div class="doctor-avatar">${initials}</div>
                  <div>
                    <h3 class="doctor-name">${CABS.UI.escapeHtml(doc.name)}</h3>
                    <div class="doctor-spec">${CABS.UI.escapeHtml(spec ? spec.name : 'Specialist')}</div>
                  </div>
                </div>
                <p class="doctor-bio-snippet">${CABS.UI.escapeHtml(doc.bio)}</p>
              </div>

              <div>
                <div class="doctor-meta-row">
                  <span>Experience</span>
                  <strong>${doc.experienceYears} Years</strong>
                </div>
                <div class="doctor-meta-row">
                  <span>Consultation Fee</span>
                  <span class="doctor-fee">${CABS.UI.formatCurrency(doc.fee)}</span>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                  <a href="#doctor-profile?id=${doc.id}" class="btn btn-secondary btn-sm" style="flex: 1;">View Profile</a>
                  <a href="#book?doctorId=${doc.id}" class="btn btn-primary btn-sm" style="flex: 1;">Check Slots</a>
                </div>
              </div>
            </div>
          `;
        }).join('');
      };

      searchInput.addEventListener('input', updateList);
      specialtyFilter.addEventListener('change', updateList);
      updateList();
    },

    /**
     * FR-05: Doctor Profile View
     */
    renderDoctorProfile(doctorId) {
      const container = document.getElementById('main-viewport');
      if (!container) return;

      const doctor = CABS.DoctorService.getDoctorProfile(doctorId);
      if (!doctor) {
        container.innerHTML = `
          <div class="empty-state">
            <h3 class="empty-state-title">Doctor profile not found</h3>
            <p class="empty-state-text">The requested physician profile could not be located or has been archived.</p>
            <a href="#doctors" class="btn btn-primary">Browse All Doctors</a>
          </div>
        `;
        return;
      }

      const initials = doctor.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2);

      container.innerHTML = `
        <div style="margin-bottom: 1rem;">
          <a href="#doctors" style="display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 500; font-size: 0.9rem;">
            &larr; Back to all doctors
          </a>
        </div>

        <div class="profile-hero">
          <div class="profile-avatar">${initials}</div>
          <div class="profile-info">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <h1 class="page-title" style="margin-bottom: 0.2rem;">${CABS.UI.escapeHtml(doctor.name)}</h1>
                <p style="font-size: 1.1rem; color: var(--primary); font-weight: 600;">${CABS.UI.escapeHtml(doctor.specialtyName)}</p>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.85rem; color: var(--text-muted);">Consultation Rate</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-dark);">${CABS.UI.formatCurrency(doctor.fee)}</div>
              </div>
            </div>

            <div class="profile-tags">
              <span class="profile-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Hours: ${CABS.UI.escapeHtml(doctor.consultationHours)}
              </span>
              <span class="profile-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                ${doctor.experienceYears} Years Experience
              </span>
              <span class="profile-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                Days: ${(doctor.workingDays || []).join(', ')}
              </span>
            </div>

            <div style="margin: 1.25rem 0; font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
              <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">Physician Bio</h3>
              <p>${CABS.UI.escapeHtml(doctor.bio)}</p>
            </div>

            ${doctor.active ? `
              <a href="#book?doctorId=${doctor.id}" class="btn btn-primary" style="margin-top: 0.5rem;">
                Check Available Slots & Book
              </a>
            ` : `
              <div class="badge badge-blocked" style="font-size: 0.9rem; padding: 0.4rem 0.8rem;">
                Currently Not Accepting New Patients
              </div>
            `}
          </div>
        </div>
      `;
    },

    /**
     * FR-06, FR-07, FR-08: Appointment Booking View
     */
    renderBookingPage(params = {}) {
      const container = document.getElementById('main-viewport');
      const user = CABS.Auth.getCurrentUser();
      if (!container || !user) return;

      const doctors = CABS.DoctorService.getActiveDoctors();
      const initialDoctorId = params.doctorId || (doctors[0] ? doctors[0].id : '');

      // Helper for today string YYYY-MM-DD
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 14);
      const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

      container.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">Book an Appointment</h1>
            <p class="page-subtitle">Select your physician, pick an available slot, and confirm your booking</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; max-width: 880px;">
          <div class="card">
            <!-- Doctor and Date Selectors -->
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="booking-doctor-select">Select Doctor</label>
                <select id="booking-doctor-select" class="form-select">
                  ${doctors.map(d => {
                    const spec = CABS.Storage.findSpecialtyById(d.specialtyId);
                    const selected = d.id === initialDoctorId ? 'selected' : '';
                    return `<option value="${d.id}" ${selected}>${CABS.UI.escapeHtml(d.name)} (${spec ? spec.name : 'Specialist'})</option>`;
                  }).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="booking-date-input">Select Date</label>
                <input type="date" id="booking-date-input" class="form-input" min="${todayStr}" max="${maxDateStr}" value="${todayStr}" />
              </div>
            </div>

            <!-- Doctor brief info banner -->
            <div id="booking-doc-info" style="margin-bottom: 1.25rem; padding: 0.75rem 1rem; background-color: var(--primary-light); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">
              <!-- Dynamic doc info -->
            </div>

            <!-- FR-06 Available Slots Grid -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label class="form-label" style="margin-bottom: 0;">Available Time Slots</label>
                <div style="display: flex; gap: 0.75rem; font-size: 0.75rem;">
                  <span style="display: inline-flex; align-items: center; gap: 0.25rem;"><span style="width: 10px; height: 10px; border-radius: 2px; background: #a7f3d0;"></span> Available</span>
                  <span style="display: inline-flex; align-items: center; gap: 0.25rem;"><span style="width: 10px; height: 10px; border-radius: 2px; background: #cbd5e1;"></span> Booked</span>
                  <span style="display: inline-flex; align-items: center; gap: 0.25rem;"><span style="width: 10px; height: 10px; border-radius: 2px; background: #e2e8f0;"></span> Blocked</span>
                </div>
              </div>

              <div id="booking-slots-container" class="slot-grid">
                <!-- Slots render here -->
              </div>
            </div>

            <!-- FR-07 Booking Summary & Notes -->
            <div id="booking-summary-section" style="display: none; margin-top: 1.5rem; border-top: 1px solid var(--border-light); padding-top: 1.25rem;">
              <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.75rem;">Consultation Summary</h3>

              <div class="summary-box">
                <div class="summary-row">
                  <span class="summary-label">Patient Name:</span>
                  <span class="summary-value">${CABS.UI.escapeHtml(user.fullName)}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Doctor:</span>
                  <span id="summary-doctor-name" class="summary-value"></span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Specialty:</span>
                  <span id="summary-specialty-name" class="summary-value"></span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Date:</span>
                  <span id="summary-date" class="summary-value"></span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Time Window:</span>
                  <span id="summary-time" class="summary-value"></span>
                </div>
                <div class="summary-row summary-total">
                  <span class="summary-label" style="font-weight: 700; color: var(--text-main);">Consultation Fee:</span>
                  <span id="summary-fee" class="summary-value" style="color: var(--primary-dark); font-size: 1.2rem;"></span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="booking-notes">Reason for Visit / Symptoms (Optional)</label>
                <textarea id="booking-notes" class="form-textarea" rows="2" placeholder="Describe symptoms or reasons for the consultation..."></textarea>
              </div>

              <button type="button" id="btn-confirm-booking" class="btn btn-primary" style="width: 100%; font-size: 1rem; padding: 0.75rem;">
                Confirm & Book Appointment
              </button>
            </div>
          </div>
        </div>
      `;

      const docSelect = document.getElementById('booking-doctor-select');
      const dateInput = document.getElementById('booking-date-input');
      const slotsContainer = document.getElementById('booking-slots-container');
      const summarySection = document.getElementById('booking-summary-section');
      const docInfo = document.getElementById('booking-doc-info');

      let selectedSlot = null;

      const renderSlots = () => {
        selectedSlot = null;
        summarySection.style.display = 'none';

        const doctorId = docSelect.value;
        const dateStr = dateInput.value;
        const doctor = CABS.Storage.findDoctorById(doctorId);
        const specialty = doctor ? CABS.Storage.findSpecialtyById(doctor.specialtyId) : null;

        if (doctor) {
          docInfo.innerHTML = `
            <span><strong>Hours:</strong> ${CABS.UI.escapeHtml(doctor.consultationHours)} | <strong>Days:</strong> ${(doctor.workingDays || []).join(', ')}</span>
            <span><strong>Fee:</strong> ${CABS.UI.formatCurrency(doctor.fee)}</span>
          `;
        }

        const slots = CABS.SlotService.getSlotsForDoctor(doctorId, dateStr);

        if (!slots.length) {
          slotsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 1.5rem; text-align: center; color: var(--text-muted); background: var(--bg-subtle); border-radius: var(--radius-sm);">
              No slots scheduled for this doctor on ${CABS.UI.formatDate(dateStr)}. Please select another date.
            </div>
          `;
          return;
        }

        slotsContainer.innerHTML = slots.map(slot => {
          const isFuture = CABS.Helpers.isFutureDateTime(slot.date, slot.startTime);
          const isAvailable = slot.status === 'Available' && isFuture;

          let btnClass = 'slot-btn';
          let disabled = '';
          let badgeText = slot.status;

          if (!isFuture && slot.status === 'Available') {
            btnClass += ' slot-blocked';
            disabled = 'disabled';
            badgeText = 'Past';
          } else if (slot.status === 'Available') {
            btnClass += ' slot-available';
          } else if (slot.status === 'Booked') {
            btnClass += ' slot-booked';
            disabled = 'disabled';
          } else if (slot.status === 'Blocked') {
            btnClass += ' slot-blocked';
            disabled = 'disabled';
          }

          return `
            <button type="button" class="${btnClass}" data-slot-id="${slot.id}" ${disabled}>
              <span class="slot-time">${slot.startTime} - ${slot.endTime}</span>
              ${CABS.UI.renderStatusBadge(badgeText)}
            </button>
          `;
        }).join('');

        // Attach slot click listener
        slotsContainer.querySelectorAll('.slot-btn.slot-available').forEach(btn => {
          btn.addEventListener('click', () => {
            slotsContainer.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('slot-selected'));
            btn.classList.add('slot-selected');

            const slotId = btn.getAttribute('data-slot-id');
            selectedSlot = slots.find(s => s.id === slotId);

            // Populate summary
            document.getElementById('summary-doctor-name').textContent = doctor ? doctor.name : '';
            document.getElementById('summary-specialty-name').textContent = specialty ? specialty.name : '';
            document.getElementById('summary-date').textContent = CABS.UI.formatDate(selectedSlot.date);
            document.getElementById('summary-time').textContent = `${selectedSlot.startTime} - ${selectedSlot.endTime}`;
            document.getElementById('summary-fee').textContent = CABS.UI.formatCurrency(doctor ? doctor.fee : 0);

            summarySection.style.display = 'block';
            summarySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
        });
      };

      docSelect.addEventListener('change', renderSlots);
      dateInput.addEventListener('change', renderSlots);
      renderSlots();

      // Confirm Booking Handler (FR-07, FR-08, NFR-01)
      document.getElementById('btn-confirm-booking').addEventListener('click', () => {
        if (!selectedSlot) {
          CABS.UI.showToast('Please select an available time slot first.', 'warning');
          return;
        }

        const notes = document.getElementById('booking-notes').value;
        const confirmBtn = document.getElementById('btn-confirm-booking');

        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Securing appointment...';

        const result = CABS.AppointmentService.bookAppointment({
          patientId: user.id,
          doctorId: docSelect.value,
          slotId: selectedSlot.id,
          notes
        });

        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm & Book Appointment';

        if (!result.success) {
          // FR-08 conflict reason
          CABS.UI.showToast(result.message, 'error', 5500);
          return;
        }

        // Success dialog and redirect
        CABS.UI.showToast(result.message, 'success');
        CABS.UI.showModal({
          title: 'Appointment Confirmed!',
          contentHtml: `
            <div style="text-align: center; padding: 1rem 0;">
              <div style="width: 52px; height: 52px; border-radius: 50%; background: #d1fae5; color: #047857; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style="font-size: 1.05rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem;">Your visit has been successfully scheduled.</p>
              <p style="color: var(--text-muted); font-size: 0.9rem;">You can review or reschedule this visit at any time from your Appointments page.</p>
            </div>
          `,
          confirmText: 'View My Appointments',
          cancelText: 'Done',
          onConfirm: () => {
            window.location.hash = '#my-appointments';
          }
        });
      });
    },

    /**
     * FR-09: My Appointments (Upcoming & Past tabs, Cancel FR-10, Reschedule FR-11)
     */
    renderMyAppointments() {
      const container = document.getElementById('main-viewport');
      const user = CABS.Auth.getCurrentUser();
      if (!container || !user) return;

      const appts = CABS.AppointmentService.getPatientAppointments(user.id);

      container.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">My Appointments</h1>
            <p class="page-subtitle">Track your upcoming visits and clinical consultation history</p>
          </div>
          <a href="#doctors" class="btn btn-primary">Book New Visit</a>
        </div>

        <div class="tabs-nav">
          <button type="button" class="tab-btn active" id="tab-upcoming">Upcoming (${appts.upcoming.length})</button>
          <button type="button" class="tab-btn" id="tab-past">Past Visits (${appts.past.length})</button>
        </div>

        <div id="appointments-content">
          <!-- Dynamically populated -->
        </div>
      `;

      const tabUpcoming = document.getElementById('tab-upcoming');
      const tabPast = document.getElementById('tab-past');
      const content = document.getElementById('appointments-content');

      const renderTab = (tab = 'upcoming') => {
        const list = tab === 'upcoming' ? appts.upcoming : appts.past;

        if (!list.length) {
          content.innerHTML = `
            <div class="empty-state">
              <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <h3 class="empty-state-title">No ${tab} appointments</h3>
              <p class="empty-state-text">${tab === 'upcoming' ? 'You have no future appointments currently booked.' : 'You have no past consultation records.'}</p>
              ${tab === 'upcoming' ? `<a href="#doctors" class="btn btn-primary">Find a Doctor</a>` : ''}
            </div>
          `;
          return;
        }

        content.innerHTML = `
          <div class="table-responsive">
            <table class="cabs-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date</th>
                  <th>Time Window</th>
                  <th>Status</th>
                  <th>Notes</th>
                  ${tab === 'upcoming' ? '<th style="text-align: right;">Actions</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${list.map(a => `
                  <tr>
                    <td><strong>${CABS.UI.escapeHtml(a.doctorName)}</strong></td>
                    <td>${CABS.UI.escapeHtml(a.specialtyName)}</td>
                    <td>${CABS.UI.formatDate(a.date)}</td>
                    <td>${a.startTime} - ${a.endTime}</td>
                    <td>${CABS.UI.renderStatusBadge(a.status)}</td>
                    <td style="max-width: 220px; font-size: 0.85rem; color: var(--text-muted);">${CABS.UI.escapeHtml(a.notes || '—')}</td>
                    ${tab === 'upcoming' && a.status === 'Booked' ? `
                      <td style="text-align: right; white-space: nowrap;">
                        <button type="button" class="btn btn-outline btn-sm btn-reschedule" data-id="${a.id}">Reschedule</button>
                        <button type="button" class="btn btn-secondary btn-sm btn-cancel-appt" data-id="${a.id}">Cancel</button>
                      </td>
                    ` : (tab === 'upcoming' ? '<td>—</td>' : '')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        this.attachAppointmentActions();
      };

      tabUpcoming.addEventListener('click', () => {
        tabUpcoming.classList.add('active');
        tabPast.classList.remove('active');
        renderTab('upcoming');
      });

      tabPast.addEventListener('click', () => {
        tabPast.classList.add('active');
        tabUpcoming.classList.remove('active');
        renderTab('past');
      });

      renderTab('upcoming');
    },

    /**
     * Attaches Cancel (FR-10) and Reschedule (FR-11) handlers
     */
    attachAppointmentActions() {
      // FR-10 Cancel Handler
      document.querySelectorAll('.btn-cancel-appt').forEach(btn => {
        btn.addEventListener('click', () => {
          const apptId = btn.getAttribute('data-id');
          const appt = CABS.Storage.findAppointmentById(apptId);
          if (!appt) return;

          const doc = CABS.Storage.findDoctorById(appt.doctorId);

          CABS.UI.showModal({
            title: 'Cancel Appointment',
            contentHtml: `
              <p>Are you sure you want to cancel your appointment with <strong>${CABS.UI.escapeHtml(doc ? doc.name : 'your doctor')}</strong> on <strong>${CABS.UI.formatDate(appt.date)}</strong> at <strong>${appt.startTime} - ${appt.endTime}</strong>?</p>
              <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label" for="cancel-reason-input">Reason for cancellation (optional):</label>
                <input type="text" id="cancel-reason-input" class="form-input" placeholder="e.g. Personal schedule change" />
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">Once cancelled, this time slot will be released back to other patients.</p>
            `,
            confirmText: 'Yes, Cancel Appointment',
            cancelText: 'Keep Booking',
            onConfirm: async () => {
              const reason = document.getElementById('cancel-reason-input')?.value || '';
              const res = CABS.AppointmentService.cancelAppointment(apptId, CABS.Auth.getSession().userId, reason);
              if (res.success) {
                CABS.UI.showToast(res.message, 'success');
                // Refresh view
                if (window.location.hash.startsWith('#my-appointments')) {
                  PatientViews.renderMyAppointments();
                } else {
                  PatientViews.renderDashboard();
                }
                return false;
              } else {
                CABS.UI.showToast(res.message, 'error');
                return true; // Keep modal open
              }
            }
          });
        });
      });

      // FR-11 Reschedule Handler
      document.querySelectorAll('.btn-reschedule').forEach(btn => {
        btn.addEventListener('click', () => {
          const apptId = btn.getAttribute('data-id');
          const appt = CABS.Storage.findAppointmentById(apptId);
          if (!appt) return;

          const doc = CABS.Storage.findDoctorById(appt.doctorId);
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const maxDate = new Date();
          maxDate.setDate(maxDate.getDate() + 14);
          const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

          let selectedNewSlotId = null;

          CABS.UI.showModal({
            title: 'Reschedule Appointment',
            size: 'lg',
            contentHtml: `
              <div style="margin-bottom: 1rem; padding: 0.75rem 1rem; background-color: var(--bg-subtle); border-radius: var(--radius-sm); font-size: 0.9rem;">
                <strong>Current Booking:</strong> ${CABS.UI.escapeHtml(doc ? doc.name : 'Doctor')} on ${CABS.UI.formatDate(appt.date)} at ${appt.startTime} - ${appt.endTime}
              </div>

              <div class="form-group">
                <label class="form-label" for="reschedule-date-picker">Pick New Date</label>
                <input type="date" id="reschedule-date-picker" class="form-input" min="${todayStr}" max="${maxDateStr}" value="${appt.date >= todayStr ? appt.date : todayStr}" />
              </div>

              <label class="form-label">Select Available Time Slot</label>
              <div id="reschedule-slots-grid" class="slot-grid" style="max-height: 240px; overflow-y: auto;">
                <!-- Slots render here -->
              </div>
              <div id="reschedule-error" class="form-error" style="margin-top: 0.5rem;"></div>
            `,
            confirmText: 'Confirm Reschedule',
            cancelText: 'Dismiss',
            onConfirm: async () => {
              if (!selectedNewSlotId) {
                const err = document.getElementById('reschedule-error');
                if (err) {
                  err.textContent = 'Please choose a new available time slot first.';
                  err.classList.add('visible');
                }
                return true; // Keep open
              }

              const res = CABS.AppointmentService.rescheduleAppointment(apptId, selectedNewSlotId);
              if (!res.success) {
                const err = document.getElementById('reschedule-error');
                if (err) {
                  err.textContent = res.message;
                  err.classList.add('visible');
                }
                CABS.UI.showToast(res.message, 'error', 5000);
                return true; // Keep open so user can pick another slot
              }

              CABS.UI.showToast(res.message, 'success');
              if (window.location.hash.startsWith('#my-appointments')) {
                PatientViews.renderMyAppointments();
              } else {
                PatientViews.renderDashboard();
              }
              return false; // Close modal
            }
          });

          // Logic to populate slots inside reschedule modal
          const datePicker = document.getElementById('reschedule-date-picker');
          const grid = document.getElementById('reschedule-slots-grid');

          const loadRescheduleSlots = () => {
            selectedNewSlotId = null;
            const targetDate = datePicker.value;
            const slots = CABS.SlotService.getSlotsForDoctor(appt.doctorId, targetDate);

            if (!slots.length) {
              grid.innerHTML = `<div style="grid-column: 1 / -1; padding: 1rem; text-align: center; color: var(--text-muted);">No slots available on ${CABS.UI.formatDate(targetDate)}.</div>`;
              return;
            }

            grid.innerHTML = slots.map(slot => {
              const isFuture = CABS.Helpers.isFutureDateTime(slot.date, slot.startTime);
              const isCurrent = slot.id === appt.slotId;
              const isAvailable = slot.status === 'Available' && isFuture;

              let cls = 'slot-btn';
              let dis = '';
              let label = slot.status;

              if (isCurrent) {
                cls += ' slot-selected';
                label = 'Current';
                dis = 'disabled';
              } else if (!isFuture && slot.status === 'Available') {
                cls += ' slot-blocked';
                dis = 'disabled';
                label = 'Past';
              } else if (slot.status !== 'Available') {
                cls += ' slot-blocked';
                dis = 'disabled';
              } else {
                cls += ' slot-available';
              }

              return `
                <button type="button" class="${cls}" data-slot-id="${slot.id}" ${dis}>
                  <span class="slot-time">${slot.startTime}</span>
                  ${CABS.UI.renderStatusBadge(label)}
                </button>
              `;
            }).join('');

            grid.querySelectorAll('.slot-btn.slot-available').forEach(btn => {
              btn.addEventListener('click', () => {
                grid.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('slot-selected'));
                btn.classList.add('slot-selected');
                selectedNewSlotId = btn.getAttribute('data-slot-id');
                const err = document.getElementById('reschedule-error');
                if (err) err.classList.remove('visible');
              });
            });
          };

          datePicker.addEventListener('change', loadRescheduleSlots);
          loadRescheduleSlots();
        });
      });
    }
  };

  window.CABS = window.CABS || {};
  window.CABS.PatientViews = PatientViews;
})();
