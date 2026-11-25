/**
 * app.js - SPA Router, Navigation Bar, Global Event Listeners & Bootstrapper
 * FR-02, FR-03, NFR-03, NFR-04
 */

(function () {
  function parseHash(hashStr) {
    const hash = (hashStr || window.location.hash || '#login').replace(/^#/, '');
    const [pathPart, queryPart] = hash.split('?');
    const path = '#' + pathPart;
    const params = {};

    if (queryPart) {
      queryPart.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }

    return { path, params };
  }

  const App = {
    init() {
      // Initialize Storage
      CABS.Storage.init();

      // Setup window listeners for SPA navigation and back-button route guards (FR-03)
      window.addEventListener('hashchange', () => this.handleRoute());
      window.addEventListener('pageshow', () => this.handleRoute());
      window.addEventListener('popstate', () => this.handleRoute());

      // Initial route handle
      this.handleRoute();
    },

    renderHeader() {
      const headerContainer = document.getElementById('header-container');
      if (!headerContainer) return;

      const session = CABS.Auth.getSession();

      if (!session) {
        // Public Header
        headerContainer.innerHTML = `
          <a href="#login" class="brand-logo">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
            <span>CABS Healthcare</span>
          </a>

          <div class="user-controls">
            <button type="button" id="btn-global-reset-demo" class="btn btn-secondary btn-sm" title="Reset all data back to original seed state">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
              Reset Demo Data
            </button>
          </div>
        `;
      } else {
        // Authenticated Header
        let roleLinks = '';
        const currentHash = window.location.hash.split('?')[0];

        if (session.role === 'patient') {
          roleLinks = `
            <a href="#patient-dashboard" class="nav-link ${currentHash === '#patient-dashboard' ? 'active' : ''}">Dashboard</a>
            <a href="#doctors" class="nav-link ${currentHash === '#doctors' ? 'active' : ''}">Find Doctors</a>
            <a href="#book" class="nav-link ${currentHash === '#book' ? 'active' : ''}">Book Visit</a>
            <a href="#my-appointments" class="nav-link ${currentHash === '#my-appointments' ? 'active' : ''}">My Appointments</a>
          `;
        } else if (session.role === 'doctor') {
          roleLinks = `
            <a href="#doctor-dashboard" class="nav-link ${currentHash === '#doctor-dashboard' ? 'active' : ''}">Doctor Portal</a>
          `;
        } else if (session.role === 'admin') {
          roleLinks = `
            <a href="#admin-dashboard" class="nav-link ${currentHash === '#admin-dashboard' ? 'active' : ''}">Administration</a>
          `;
        }

        headerContainer.innerHTML = `
          <a href="${CABS.Auth.getDefaultRouteForRole(session.role)}" class="brand-logo">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
            <span>CABS</span>
          </a>

          <nav class="main-nav">
            ${roleLinks}
          </nav>

          <div class="user-controls">
            <div class="user-badge">
              <span class="role-pill role-pill-${session.role}">${session.role}</span>
              <span style="max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${CABS.UI.escapeHtml(session.name)}</span>
            </div>

            <button type="button" id="btn-global-logout" class="btn btn-secondary btn-sm" title="Log out of current session">
              Sign Out
            </button>

            <button type="button" id="btn-global-reset-demo" class="btn btn-secondary btn-sm" title="Reset all data back to original seed state">
              Reset Data
            </button>
          </div>
        `;

        document.getElementById('btn-global-logout')?.addEventListener('click', () => {
          CABS.Auth.logout();
        });
      }

      // Attach Reset Data button handler
      document.querySelectorAll('#btn-global-reset-demo').forEach(btn => {
        btn.addEventListener('click', () => {
          CABS.UI.showModal({
            title: 'Reset Demo Database',
            contentHtml: `
              <p>Are you sure you want to reset all data back to original demo seed state?</p>
              <p style="font-size: 0.85rem; color: #be123c; margin-top: 0.5rem;">
                Warning: Any patient registrations, new appointments, or doctor status modifications created during this session will be reset to defaults.
              </p>
            `,
            confirmText: 'Reset Everything',
            cancelText: 'Keep Data',
            onConfirm: async () => {
              CABS.Storage.reset();
              CABS.UI.showToast('Demo data re-seeded to initial state.', 'success');
              // Clear current session to avoid orphaned user state
              CABS.Auth.logout();
              return false;
            }
          });
        });
      });
    },

    handleRoute() {
      const { path, params } = parseHash();

      // Guard check (FR-03, NFR-04)
      const guard = CABS.Auth.guardRoute(path);
      if (!guard.allow) {
        window.location.hash = guard.redirect;
        return;
      }

      this.renderHeader();

      // Route Dispatcher
      switch (path) {
        case '#login':
          CABS.AuthView.render('login');
          break;

        case '#register':
          CABS.AuthView.render('register');
          break;

        case '#patient-dashboard':
          CABS.PatientViews.renderDashboard();
          break;

        case '#doctors':
          CABS.PatientViews.renderDoctorsList();
          break;

        case '#doctor-profile':
          CABS.PatientViews.renderDoctorProfile(params.id);
          break;

        case '#book':
          CABS.PatientViews.renderBookingPage(params);
          break;

        case '#my-appointments':
          CABS.PatientViews.renderMyAppointments();
          break;

        case '#doctor-dashboard':
        case '#doctor-schedule':
        case '#doctor-slots':
          CABS.DoctorViews.renderDashboard();
          break;

        case '#admin-dashboard':
        case '#admin-oversight':
          CABS.AdminViews.renderDashboard('oversight');
          break;

        case '#admin-doctors':
          CABS.AdminViews.renderDashboard('doctors');
          break;

        case '#admin-specialties':
          CABS.AdminViews.renderDashboard('specialties');
          break;

        case '#admin-slots':
          CABS.AdminViews.renderDashboard('slots');
          break;

        case '#admin-patients':
          CABS.AdminViews.renderDashboard('patients');
          break;

        default:
          const session = CABS.Auth.getSession();
          window.location.hash = session ? CABS.Auth.getDefaultRouteForRole(session.role) : '#login';
          break;
      }

      window.scrollTo(0, 0);
    }
  };

  window.CABS = window.CABS || {};
  window.CABS.App = App;

  // Boot when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})();
