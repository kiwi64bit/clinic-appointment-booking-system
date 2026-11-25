/**
 * auth.js - Authentication, Password Hashing, Session Management & Route Guards
 * FR-01, FR-02, FR-03, NFR-04
 */

(function () {
  const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
  root.CABS = root.CABS || {};
  const CABS = root.CABS;
  const SESSION_KEY = 'CABS_SESSION';

  /**
   * Hashes a string using Web Crypto API SHA-256
   * Fallback provides basic hex digest if Web Crypto is unavailable in isolated file context.
   */
  async function hashPassword(text) {
    if (window.crypto && window.crypto.subtle) {
      try {
        const enc = new TextEncoder();
        const data = enc.encode(text);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (err) {
        console.warn('Crypto subtle failed, using internal fallback hash', err);
      }
    }
    // Simple fast DJB2-variant 64-character hash fallback for restricted offline environments
    let h1 = 0xdeadbeef, h2 = 0x41c64e6d, h3 = 0x12345678, h4 = 0x87654321;
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
      h3 = Math.imul(h3 ^ ch, 2246822507);
      h4 = Math.imul(h4 ^ ch, 3266489909);
    }
    const toHex = n => (n >>> 0).toString(16).padStart(8, '0');
    const part = toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4);
    return (part + part).substring(0, 64);
  }

  const Auth = {
    hashPassword,

    /**
     * FR-01: Patient registration
     */
    async registerPatient({ fullName, email, phone, dateOfBirth, password }) {
      const cleanName = (fullName || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPhone = (phone || '').trim();
      const cleanDob = (dateOfBirth || '').trim();
      const cleanPassword = (password || '').trim();

      // Validation
      if (!cleanName || !cleanEmail || !cleanPhone || !cleanDob || !cleanPassword) {
        return { success: false, message: 'All registration fields are required.' };
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return { success: false, message: 'Please enter a valid email address.' };
      }

      // Check duplicate emails across patients, doctors, and admins
      const existing = CABS.Storage.findUserByEmail(cleanEmail);
      if (existing) {
        return {
          success: false,
          message: `The email address "${cleanEmail}" is already registered. Please sign in or use another email.`
        };
      }

      // Password length check
      if (cleanPassword.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
      }

      const passwordHash = await hashPassword(cleanPassword);
      const newPatient = new CABS.Patient({
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        dateOfBirth: cleanDob,
        passwordHash
      });

      const db = CABS.Storage.getDB();
      db.patients.push(newPatient);
      CABS.Storage.saveDB(db);

      return {
        success: true,
        message: 'Registration successful! You may now sign in.',
        patient: newPatient
      };
    },

    /**
     * FR-02: Role-based login
     */
    async login(email, password) {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();

      if (!cleanEmail || !cleanPassword) {
        return { success: false, message: 'Invalid email or password.' };
      }

      const found = CABS.Storage.findUserByEmail(cleanEmail);
      if (!found) {
        return { success: false, message: 'Invalid email or password.' };
      }

      const passwordHash = await hashPassword(cleanPassword);
      if (found.user.passwordHash !== passwordHash) {
        return { success: false, message: 'Invalid email or password.' };
      }

      // Check if user is a deactivated doctor
      if (found.role === 'doctor' && found.user.active === false) {
        return {
          success: false,
          message: 'This doctor account is currently inactive. Please contact administration.'
        };
      }

      // Establish session
      const session = {
        userId: found.user.id,
        email: found.user.email,
        role: found.role,
        name: found.user.name || found.user.fullName || 'User',
        loginTime: new Date().toISOString()
      };

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return {
        success: true,
        session,
        role: found.role,
        redirectHash: this.getDefaultRouteForRole(found.role)
      };
    },

    /**
     * FR-03: Logout
     */
    logout() {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.hash = '#login';
    },

    /**
     * Retrieve current active session
     */
    getSession() {
      const item = sessionStorage.getItem(SESSION_KEY);
      if (!item) return null;
      try {
        return JSON.parse(item);
      } catch (e) {
        return null;
      }
    },

    /**
     * Get the currently logged-in user entity from the DB
     */
    getCurrentUser() {
      const session = this.getSession();
      if (!session) return null;

      if (session.role === 'patient') {
        return CABS.Storage.findPatientById(session.userId);
      }
      if (session.role === 'doctor') {
        return CABS.Storage.findDoctorById(session.userId);
      }
      if (session.role === 'admin') {
        const admins = CABS.Storage.getAdministrators();
        return admins.find(a => a.id === session.userId) || null;
      }
      return null;
    },

    getDefaultRouteForRole(role) {
      switch (role) {
        case 'patient': return '#patient-dashboard';
        case 'doctor':  return '#doctor-dashboard';
        case 'admin':   return '#admin-dashboard';
        default:        return '#login';
      }
    },

    /**
     * NFR-04, FR-03: Route guard verification
     */
    guardRoute(routePath) {
      const session = this.getSession();
      const publicRoutes = ['#login', '#register'];
      const target = (routePath || window.location.hash || '#login').split('?')[0];

      // If user is not logged in and attempts to access protected route
      if (!session) {
        if (!publicRoutes.includes(target)) {
          return { allow: false, redirect: '#login' };
        }
        return { allow: true };
      }

      // If user is logged in and visits login/register, send them to their dashboard
      if (publicRoutes.includes(target)) {
        return { allow: false, redirect: this.getDefaultRouteForRole(session.role) };
      }

      // Role permission guards
      const patientRoutes = ['#patient-dashboard', '#doctors', '#doctor-profile', '#book', '#my-appointments'];
      const doctorRoutes = ['#doctor-dashboard', '#doctor-schedule', '#doctor-slots'];
      const adminRoutes = ['#admin-dashboard', '#admin-specialties', '#admin-doctors', '#admin-slots', '#admin-appointments', '#admin-patients'];

      if (patientRoutes.includes(target) && session.role !== 'patient') {
        return { allow: false, redirect: this.getDefaultRouteForRole(session.role) };
      }
      if (doctorRoutes.includes(target) && session.role !== 'doctor') {
        return { allow: false, redirect: this.getDefaultRouteForRole(session.role) };
      }
      if (adminRoutes.includes(target) && session.role !== 'admin') {
        return { allow: false, redirect: this.getDefaultRouteForRole(session.role) };
      }

      return { allow: true };
    }
  };

  root.CABS.Auth = Auth;
})();
