# Clinic Appointment Booking System (CABS)

A complete, production-grade front-end web application for clinic and hospital appointment management built with **pure HTML5, CSS3, and vanilla JavaScript (ES6)**.

Zero dependencies, zero build steps, and zero external frameworks. Runs instantly by double-clicking `index.html` in any modern web browser or through a local static web server.

---

## Quick Start & How to Run

### Method 1: Direct File Launch (No server required)
Double-click `index.html` or drag and drop [index.html](file:///c:/Users/omar%20samy/Downloads/Clinic%20appointment%20booking%20system/index.html) into Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari.

### Method 2: Local Web Server (Optional)
Run using Python or Node.js:
```bash
# Python
python -m http.server 8080

# Or Node.js
npx serve .
```
Then navigate to `http://localhost:8080`.

---

## Demo Accounts

The application automatically seeds realistic medical demo data on first launch. For convenience, the login page features **interactive quick-fill credential cards** to sign in with one click:

| Role | Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Patient** | Alex Taylor | `patient@cabs.local` | `patient123` |
| **Doctor** | Dr. Sarah Jenkins | `doctor@cabs.local` | `doctor123` |
| **Administrator** | Clinic Administrator | `admin@cabs.local` | `admin123` |
| **Patient 2** | Morgan Hayes | `morgan.hayes@email.com` | `password123` |
| **Patient 3** | Jordan Vance | `jordan.vance@email.com` | `password123` |

> **Note on Security:** All passwords are cryptographically hashed using the **Web Crypto API (SHA-256)**. Plain text passwords are never stored in localStorage.

---

## Page Mapping to FR / NFR IDs

| Page / View | Route / Hash | Primary Role | Functional Requirements (FR) & NFRs | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Login & Registration** | `#login`<br>`#register` | Public / All | **FR-01, FR-02, FR-03, NFR-01, NFR-03, NFR-04** | Form validation, duplicate email check, role-based authentication, SHA-256 hashing, demo credential cards, and back-button route guards. |
| **Patient Dashboard** | `#patient-dashboard` | Patient | **FR-02, FR-09, NFR-01, NFR-02, NFR-04** | Overview metrics, next upcoming consultation card, and quick links to booking and doctor directories. |
| **Doctors List** | `#doctors` | Patient | **FR-04, NFR-01, NFR-02** | Live search by physician name or bio, filter dropdown by specialty, displays active doctors only, friendly empty states. |
| **Doctor Profile** | `#doctor-profile?id=...` | Patient | **FR-05, NFR-01, NFR-02** | Complete physician profile including medical specialty, years of experience, consultation fee, hours, and direct booking trigger. |
| **Appointment Booking** | `#book?doctorId=...` | Patient | **FR-06, FR-07, FR-08, NFR-01, NFR-02** | Date picker (14-day window), interactive slot button grid with distinct visual states (`Available`, `Booked`, `Blocked`), consultation summary, and FR-08 conflict prevention. |
| **My Appointments** | `#my-appointments` | Patient | **FR-09, FR-10, FR-11, NFR-01, NFR-02** | Tabbed views for Upcoming and Past visits. Modal-based cancellation dialog (FR-10) and conflict-checked rescheduling modal (FR-11). |
| **Doctor Dashboard & Daily Schedule** | `#doctor-dashboard`<br>`#doctor-schedule` | Doctor | **FR-12, FR-13, NFR-01, NFR-02, NFR-04** | Date-specific daily schedule sorted by start time. Doctors can update visit status to `Completed` or `No-Show` with clinical notes. |
| **Doctor Time Slot Management** | `#doctor-slots` | Doctor | **FR-16, NFR-01, NFR-02, NFR-04** | Daily slot viewer, single-slot creator with overlap prevention, and toggle block/unblock (blocking booked slots is refused). |
| **Admin Oversight (All Visits)** | `#admin-dashboard` | Administrator | **FR-17, NFR-01, NFR-02, NFR-04** | Master appointment ledger with filters for Date, Doctor, Patient, and Status. Administrative cancellation that immediately frees the slot. |
| **Admin Doctor Registry** | `#admin-doctors` | Administrator | **FR-15, NFR-01, NFR-02, NFR-04** | List and edit doctor credentials. Activate or deactivate doctors (deactivating hides them from patients while preserving medical history). |
| **Admin Specialties** | `#admin-specialties` | Administrator | **FR-14, NFR-01, NFR-02, NFR-04** | Add and edit medical specialties. Rejects blank names and duplicate names. |
| **Admin Time Slots** | `#admin-slots` | Administrator | **FR-16, NFR-01, NFR-02, NFR-04** | Create and block/unblock time slots for any doctor on any date, with overlap prevention. |
| **Admin Patient Records** | `#admin-patients` | Administrator | **FR-18, NFR-01, NFR-02, NFR-04** | Search patient directory by name, email, or phone. Opens comprehensive profile with full consultation history. |

---

## Domain Model Specifications

Names and statuses match the required domain model exactly:

- **Classes**:
  - `User`: `id`, `email`, `passwordHash`, `role`, `createdAt`
  - `Patient`: `id`, `fullName`, `email`, `phone`, `dateOfBirth`, `passwordHash`
  - `Doctor`: `id`, `name`, `email`, `specialtyId`, `experienceYears`, `fee`, `bio`, `workingDays`, `consultationHours`, `active`, `passwordHash`
  - `Administrator`: `id`, `name`, `email`, `passwordHash`
  - `Specialty`: `id`, `name`, `description`
  - `TimeSlot`: `id`, `doctorId`, `date`, `startTime`, `endTime`, `status`
  - `Appointment`: `id`, `patientId`, `doctorId`, `slotId`, `date`, `startTime`, `endTime`, `status`, `notes`, `createdAt`
- **TimeSlot status**: `Available` | `Booked` | `Blocked`
- **Appointment status**: `Booked` | `Cancelled` | `Completed` | `No-Show`

---

## Non-Functional Requirements & Design

- **NFR-01 (Instant Feedback)**: All actions provide immediate feedback (< 1 second) via high-visibility toast notifications, inline error messages, and accessible confirmation modals. Conflict errors explain the exact reason (e.g. target slot booked, overlap with another physician).
- **NFR-02 (Responsive Design)**: Engineered for screens from 375px mobile viewports up to 1280px+ desktop monitors. Table wrappers (`.table-responsive`) and slot grids scroll internally with **zero page-level horizontal overflow**.
- **NFR-03 (Persistence & Reset)**: All mutations persist in `localStorage`. A "Reset Demo Data" button is accessible in the header to reseed the database at any time.
- **NFR-04 (Role-Based Route Guards)**: Enforced via `checkRouteGuard` in JavaScript. Unauthenticated users are redirected to `#login`. Users attempting to access URLs outside their authorized role are redirected to their permitted dashboard. Browser navigation (Back/Forward) is guarded on both `hashchange` and `pageshow`.

---

## Code Structure

```
/
├── index.html                   # Main entry point & SPA mount point
├── css/
│   └── styles.css               # Medical teal design system & responsive layout
├── js/
│   ├── models.js                # Domain classes (User, Patient, Doctor, Administrator, etc.)
│   ├── storage.js               # LocalStorage DB layer & rich sample data generator
│   ├── auth.js                  # SHA-256 Web Crypto hashing, session & route guards
│   ├── services.js              # Business logic (booking, conflict checks, reschedule, status)
│   ├── ui.js                    # Toasts, accessible modals, and status badges
│   ├── views/
│   │   ├── authView.js          # Login & registration forms, demo credential cards
│   │   ├── patientViews.js      # Patient dashboard, doctor search, profile, booking, visits
│   │   ├── doctorViews.js       # Doctor daily schedule, visit status updates, slot management
│   │   └── adminViews.js        # Specialties, doctor management, slot schedules, oversight, patients
│   └── app.js                   # SPA hash router, dynamic navigation header, and bootstrapper
├── test-acceptance.js           # Automated verification test suite
└── README.md                    # Documentation and requirement mappings
```

---

## Acceptance Verification Results

Automated verification was executed and confirmed all 11 criteria:
1. Patient registration with an existing email is rejected with a clear message.
2. Login correctly routes to the respective role dashboard; browser Back button after logout cannot restore the session.
3. Booking an available slot marks it `Booked`; subsequent attempts to book the same slot are blocked.
4. Attempting to book overlapping appointments across different doctors for the same patient is blocked with a detailed conflict explanation.
5. Rescheduling into an already `Booked` slot fails safely while keeping the original booking untouched; rescheduling into an `Available` slot frees the old slot.
6. Cancelling a visit returns its slot to `Available`; past visits cannot be cancelled.
7. Doctor status updates to `Completed` or `No-Show` update the patient's Past list and the admin oversight ledger.
8. Deactivating a doctor hides them from the patient directory while preserving all existing appointment history.
9. Blocking an active `Booked` slot is refused; creating overlapping slots for the same doctor is refused.
10. Page refreshes retain all changes; clicking "Reset Demo Data" restores the initial database seed.
11. Viewports tested at 375px and 1280px show 0 horizontal page-level scrollbars.
