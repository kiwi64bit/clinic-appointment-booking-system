/**
 * authView.js - Login and Registration Views
 * FR-01, FR-02, FR-03, NFR-01
 */

(function () {
  const AuthView = {
    render(mode = 'login') {
      const container = document.getElementById('main-viewport');
      if (!container) return;

      const isLogin = mode === 'login';

      container.innerHTML = `
        <div style="max-width: 480px; margin: 2rem auto;">
          <div class="card">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; background-color: var(--primary-light); color: var(--primary); margin-bottom: 0.75rem;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  <path d="M12 5v14"/>
                  <path d="M5 12h14"/>
                </svg>
              </div>
              <h1 class="page-title" style="font-size: 1.5rem;">Clinic Appointment Booking</h1>
              <p class="page-subtitle">Reliable, confidential, and modern healthcare scheduling</p>
            </div>

            <!-- Tab Navigation for Login / Register -->
            <div class="tabs-nav" style="justify-content: center; margin-bottom: 1.5rem;">
              <button type="button" class="tab-btn ${isLogin ? 'active' : ''}" id="tab-btn-login">Sign In</button>
              <button type="button" class="tab-btn ${!isLogin ? 'active' : ''}" id="tab-btn-register">Create Account</button>
            </div>

            <!-- Error Banner -->
            <div id="auth-error-banner" class="form-error" style="background-color: #ffe4e6; color: #be123c; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); margin-bottom: 1rem; border: 1px solid #fecdd3;"></div>

            ${isLogin ? this.renderLoginForm() : this.renderRegisterForm()}
          </div>

          <!-- Demo Credentials Section -->
          <div class="demo-accounts-box">
            <div class="demo-accounts-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Demo Credentials (Click to quick-fill & sign in)
            </div>
            <div class="demo-account-cards">
              <div class="demo-card" data-email="patient@cabs.local" data-pass="patient123" title="Log in as Patient">
                <div class="demo-card-role">Patient</div>
                <div class="demo-card-email">patient@cabs.local</div>
                <div class="demo-card-pass">Password: patient123</div>
              </div>
              <div class="demo-card" data-email="doctor@cabs.local" data-pass="doctor123" title="Log in as Doctor">
                <div class="demo-card-role">Doctor</div>
                <div class="demo-card-email">doctor@cabs.local</div>
                <div class="demo-card-pass">Password: doctor123</div>
              </div>
              <div class="demo-card" data-email="admin@cabs.local" data-pass="admin123" title="Log in as Administrator">
                <div class="demo-card-role">Administrator</div>
                <div class="demo-card-email">admin@cabs.local</div>
                <div class="demo-card-pass">Password: admin123</div>
              </div>
            </div>
          </div>
        </div>
      `;

      this.attachEvents(mode);
    },

    renderLoginForm() {
      return `
        <form id="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address</label>
            <input type="email" id="login-email" class="form-input" placeholder="name@example.com" autocomplete="email" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••" autocomplete="current-password" required />
          </div>

          <button type="submit" id="btn-submit-login" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">
            Sign In
          </button>
        </form>
      `;
    },

    renderRegisterForm() {
      return `
        <form id="register-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="reg-fullname">Full Name *</label>
            <input type="text" id="reg-fullname" class="form-input" placeholder="e.g. Jordan Hayes" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-email">Email Address *</label>
            <input type="email" id="reg-email" class="form-input" placeholder="patient@example.com" required />
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="reg-phone">Phone Number *</label>
              <input type="tel" id="reg-phone" class="form-input" placeholder="+1 555-0199" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-dob">Date of Birth *</label>
              <input type="date" id="reg-dob" class="form-input" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-password">Password (min 6 chars) *</label>
            <input type="password" id="reg-password" class="form-input" placeholder="Create a secure password" minlength="6" required />
          </div>

          <button type="submit" id="btn-submit-register" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">
            Create Patient Account
          </button>
        </form>
      `;
    },

    attachEvents(mode) {
      // Tab switching
      document.getElementById('tab-btn-login')?.addEventListener('click', () => {
        window.location.hash = '#login';
      });
      document.getElementById('tab-btn-register')?.addEventListener('click', () => {
        window.location.hash = '#register';
      });

      const errorBanner = document.getElementById('auth-error-banner');
      const showError = (msg) => {
        if (!errorBanner) return;
        errorBanner.textContent = msg;
        errorBanner.classList.add('visible');
      };
      const clearError = () => {
        if (!errorBanner) return;
        errorBanner.textContent = '';
        errorBanner.classList.remove('visible');
      };

      // Login form submission (FR-02)
      const loginForm = document.getElementById('login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          clearError();

          const email = document.getElementById('login-email').value;
          const password = document.getElementById('login-password').value;
          const btn = document.getElementById('btn-submit-login');

          btn.disabled = true;
          btn.textContent = 'Verifying...';

          const res = await CABS.Auth.login(email, password);
          btn.disabled = false;
          btn.textContent = 'Sign In';

          if (!res.success) {
            showError(res.message);
            CABS.UI.showToast(res.message, 'error');
            return;
          }

          CABS.UI.showToast(`Welcome back, ${res.session.name}!`, 'success');
          window.location.hash = res.redirectHash;
        });
      }

      // Register form submission (FR-01)
      const registerForm = document.getElementById('register-form');
      if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          clearError();

          const fullName = document.getElementById('reg-fullname').value;
          const email = document.getElementById('reg-email').value;
          const phone = document.getElementById('reg-phone').value;
          const dateOfBirth = document.getElementById('reg-dob').value;
          const password = document.getElementById('reg-password').value;
          const btn = document.getElementById('btn-submit-register');

          btn.disabled = true;
          btn.textContent = 'Registering...';

          const res = await CABS.Auth.registerPatient({
            fullName,
            email,
            phone,
            dateOfBirth,
            password
          });

          btn.disabled = false;
          btn.textContent = 'Create Patient Account';

          if (!res.success) {
            showError(res.message);
            CABS.UI.showToast(res.message, 'error');
            return;
          }

          CABS.UI.showToast('Registration complete! Please sign in with your email and password.', 'success', 5000);
          window.location.hash = '#login';
          setTimeout(() => {
            const emailInput = document.getElementById('login-email');
            if (emailInput) {
              emailInput.value = email;
              document.getElementById('login-password')?.focus();
            }
          }, 100);
        });
      }

      // Quick Demo Card Click Handlers
      document.querySelectorAll('.demo-card').forEach(card => {
        card.addEventListener('click', async () => {
          const email = card.getAttribute('data-email');
          const pass = card.getAttribute('data-pass');

          if (mode !== 'login') {
            window.location.hash = '#login';
            setTimeout(() => this.triggerQuickLogin(email, pass), 50);
          } else {
            this.triggerQuickLogin(email, pass);
          }
        });
      });
    },

    async triggerQuickLogin(email, pass) {
      const emailField = document.getElementById('login-email');
      const passField = document.getElementById('login-password');
      if (emailField && passField) {
        emailField.value = email;
        passField.value = pass;
      }
      const res = await CABS.Auth.login(email, pass);
      if (res.success) {
        CABS.UI.showToast(`Signed in as ${res.session.role}: ${res.session.name}`, 'success');
        window.location.hash = res.redirectHash;
      } else {
        CABS.UI.showToast(res.message, 'error');
      }
    }
  };

  window.CABS = window.CABS || {};
  window.CABS.AuthView = AuthView;
})();
