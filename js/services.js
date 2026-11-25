/**
 * services.js - Core Business Logic Services for CABS
 * FR-04 through FR-18, NFR-01, NFR-04
 */

(function () {
  const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
  root.CABS = root.CABS || {};
  const CABS = root.CABS;

  /**
   * Helper: Check if a date string + time string is in the future compared to now
   */
  function isFutureDateTime(dateStr, timeStr) {
    if (!dateStr) return false;
    const now = new Date();
    const time = timeStr || '23:59';
    const target = new Date(`${dateStr}T${time}:00`);
    return target > now;
  }

  /**
   * Helper: Checks whether two time intervals overlap (same date assumed)
   * Format "HH:MM"
   */
  function timesOverlap(startA, endA, startB, endB) {
    return (startA < endB) && (startB < endA);
  }

  const DoctorService = {
    /**
     * FR-04: Browse active doctors with optional specialty filter and search term
     */
    getActiveDoctors({ specialtyId, search } = {}) {
      let doctors = CABS.Storage.getDoctors().filter(d => d.active === true);

      if (specialtyId && specialtyId !== 'all') {
        doctors = doctors.filter(d => d.specialtyId === specialtyId);
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        doctors = doctors.filter(d =>
          d.name.toLowerCase().includes(q) ||
          d.bio.toLowerCase().includes(q)
        );
      }

      return doctors;
    },

    /**
     * FR-05: Get full doctor profile by ID
     */
    getDoctorProfile(doctorId) {
      const doc = CABS.Storage.findDoctorById(doctorId);
      if (!doc) return null;
      const specialty = CABS.Storage.findSpecialtyById(doc.specialtyId);
      return {
        ...doc,
        specialtyName: specialty ? specialty.name : 'General Healthcare'
      };
    },

    /**
     * FR-15: Admin adds a new doctor
     */
    async addDoctor({ name, email, specialtyId, experienceYears, fee, bio, workingDays, consultationHours, password }) {
      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanSpecialty = (specialtyId || '').trim();
      const exp = Number(experienceYears) || 0;
      const feeNum = Number(fee) || 0;
      const cleanBio = (bio || '').trim();
      const hours = (consultationHours || '09:00 - 17:00').trim();

      if (!cleanName || !cleanEmail || !cleanSpecialty) {
        return { success: false, message: 'Name, email, and specialty are required.' };
      }

      const existingUser = CABS.Storage.findUserByEmail(cleanEmail);
      if (existingUser) {
        return { success: false, message: `The email "${cleanEmail}" is already in use.` };
      }

      const pass = password && password.trim() ? password.trim() : 'doctor123';
      const passwordHash = await CABS.Auth.hashPassword(pass);

      const newDoctor = new CABS.Doctor({
        name: cleanName,
        email: cleanEmail,
        specialtyId: cleanSpecialty,
        experienceYears: exp,
        fee: feeNum,
        bio: cleanBio,
        workingDays: workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        consultationHours: hours,
        active: true,
        passwordHash
      });

      const db = CABS.Storage.getDB();
      db.doctors.push(newDoctor);
      CABS.Storage.saveDB(db);

      return { success: true, message: `Doctor ${cleanName} added successfully.`, doctor: newDoctor };
    },

    /**
     * FR-15: Admin updates an existing doctor
     */
    updateDoctor(doctorId, updateData) {
      const db = CABS.Storage.getDB();
      const index = db.doctors.findIndex(d => d.id === doctorId);
      if (index === -1) {
        return { success: false, message: 'Doctor not found.' };
      }

      const current = db.doctors[index];
      // If email changed, check uniqueness
      if (updateData.email && updateData.email.trim().toLowerCase() !== current.email) {
        const cleanEmail = updateData.email.trim().toLowerCase();
        const existing = CABS.Storage.findUserByEmail(cleanEmail);
        if (existing) {
          return { success: false, message: `Email "${cleanEmail}" is already taken.` };
        }
        current.email = cleanEmail;
      }

      if (updateData.name) current.name = updateData.name.trim();
      if (updateData.specialtyId) current.specialtyId = updateData.specialtyId;
      if (updateData.experienceYears !== undefined) current.experienceYears = Number(updateData.experienceYears);
      if (updateData.fee !== undefined) current.fee = Number(updateData.fee);
      if (updateData.bio !== undefined) current.bio = updateData.bio.trim();
      if (updateData.workingDays) current.workingDays = updateData.workingDays;
      if (updateData.consultationHours) current.consultationHours = updateData.consultationHours.trim();

      CABS.Storage.saveDB(db);
      return { success: true, message: 'Doctor profile updated successfully.', doctor: current };
    },

    /**
     * FR-15: Admin toggles doctor active status
     */
    toggleDoctorStatus(doctorId) {
      const db = CABS.Storage.getDB();
      const doc = db.doctors.find(d => d.id === doctorId);
      if (!doc) {
        return { success: false, message: 'Doctor not found.' };
      }

      doc.active = !doc.active;
      CABS.Storage.saveDB(db);

      const statusText = doc.active ? 'activated' : 'deactivated';
      return {
        success: true,
        message: `Doctor ${doc.name} has been ${statusText}.`,
        active: doc.active
      };
    }
  };

  const SpecialtyService = {
    getAll() {
      return CABS.Storage.getSpecialties();
    },

    /**
     * FR-14: Admin adds a specialty (reject blank and duplicates)
     */
    addSpecialty({ name, description }) {
      const cleanName = (name || '').trim();
      const cleanDesc = (description || '').trim();

      if (!cleanName) {
        return { success: false, message: 'Specialty name cannot be blank.' };
      }

      const db = CABS.Storage.getDB();
      const duplicate = db.specialties.some(s => s.name.toLowerCase() === cleanName.toLowerCase());
      if (duplicate) {
        return { success: false, message: `Specialty "${cleanName}" already exists.` };
      }

      const spec = new CABS.Specialty({ name: cleanName, description: cleanDesc });
      db.specialties.push(spec);
      CABS.Storage.saveDB(db);

      return { success: true, message: `Specialty "${cleanName}" created successfully.`, specialty: spec };
    },

    /**
     * FR-14: Admin edits a specialty
     */
    updateSpecialty(id, { name, description }) {
      const cleanName = (name || '').trim();
      const cleanDesc = (description || '').trim();

      if (!cleanName) {
        return { success: false, message: 'Specialty name cannot be blank.' };
      }

      const db = CABS.Storage.getDB();
      const index = db.specialties.findIndex(s => s.id === id);
      if (index === -1) {
        return { success: false, message: 'Specialty not found.' };
      }

      const duplicate = db.specialties.some(
        s => s.id !== id && s.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (duplicate) {
        return { success: false, message: `Specialty with name "${cleanName}" already exists.` };
      }

      db.specialties[index].name = cleanName;
      db.specialties[index].description = cleanDesc;
      CABS.Storage.saveDB(db);

      return { success: true, message: 'Specialty updated successfully.' };
    }
  };

  const SlotService = {
    /**
     * FR-06: Get slots for a doctor on a specific date
     */
    getSlotsForDoctor(doctorId, dateStr) {
      const allSlots = CABS.Storage.getTimeSlots();
      return allSlots
        .filter(s => s.doctorId === doctorId && s.date === dateStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    },

    /**
     * FR-16: Create single slot or batch of slots for a doctor
     */
    createSlot({ doctorId, date, startTime, endTime }) {
      if (!doctorId || !date || !startTime || !endTime) {
        return { success: false, message: 'Doctor, date, start time, and end time are required.' };
      }

      if (startTime >= endTime) {
        return { success: false, message: 'Slot end time must be after start time.' };
      }

      const db = CABS.Storage.getDB();
      // Check for overlap with existing slots for the SAME doctor on that date
      const existingDocSlots = db.timeSlots.filter(s => s.doctorId === doctorId && s.date === date);
      const hasOverlap = existingDocSlots.some(s =>
        timesOverlap(startTime, endTime, s.startTime, s.endTime)
      );

      if (hasOverlap) {
        return {
          success: false,
          message: `Slot ${startTime} - ${endTime} overlaps with an existing slot for this doctor on ${date}.`
        };
      }

      const newSlot = new CABS.TimeSlot({
        doctorId,
        date,
        startTime,
        endTime,
        status: 'Available'
      });

      db.timeSlots.push(newSlot);
      CABS.Storage.saveDB(db);

      return { success: true, message: 'Time slot created.', slot: newSlot };
    },

    /**
     * FR-16: Block/Unblock an Available slot
     * Do NOT allow blocking a slot that has an active Booked appointment!
     */
    toggleBlockSlot(slotId) {
      const db = CABS.Storage.getDB();
      const slot = db.timeSlots.find(s => s.id === slotId);
      if (!slot) {
        return { success: false, message: 'Time slot not found.' };
      }

      if (slot.status === 'Booked') {
        return {
          success: false,
          message: 'Cannot block a slot that has an active Booked appointment.'
        };
      }

      if (slot.status === 'Blocked') {
        slot.status = 'Available';
        CABS.Storage.saveDB(db);
        return { success: true, message: 'Slot is now Available.', status: 'Available' };
      } else if (slot.status === 'Available') {
        slot.status = 'Blocked';
        CABS.Storage.saveDB(db);
        return { success: true, message: 'Slot has been Blocked.', status: 'Blocked' };
      }

      return { success: false, message: `Cannot modify slot with status ${slot.status}.` };
    }
  };

  const AppointmentService = {
    /**
     * FR-08: Conflict prevention (used by booking AND reschedule)
     * (1) Target slot exists, belongs to doctor, and is Available.
     * (2) Patient has no other Booked appointment overlapping on same date and time window.
     * @param {string} patientId
     * @param {string} doctorId
     * @param {string} slotId
     * @param {string} [excludeAppointmentId] - Ignore current appointment when rescheduling
     */
    validateSlotAvailability(patientId, doctorId, slotId, excludeAppointmentId = null) {
      const db = CABS.Storage.getDB();
      const slot = db.timeSlots.find(s => s.id === slotId);

      // (1) Target slot check
      if (!slot) {
        return { valid: false, reason: 'The selected time slot no longer exists.' };
      }

      if (slot.doctorId !== doctorId) {
        return { valid: false, reason: 'The selected time slot does not belong to the chosen doctor.' };
      }

      if (slot.status !== 'Available') {
        return { valid: false, reason: `This time slot is ${slot.status} and cannot be booked.` };
      }

      // Check if slot is in the past
      if (!isFutureDateTime(slot.date, slot.startTime)) {
        return { valid: false, reason: 'Cannot book a time slot in the past.' };
      }

      // (2) Patient overlapping Booked appointments check
      const patientAppointments = db.appointments.filter(a =>
        a.patientId === patientId &&
        a.status === 'Booked' &&
        a.date === slot.date &&
        (!excludeAppointmentId || a.id !== excludeAppointmentId)
      );

      const overlap = patientAppointments.find(a =>
        timesOverlap(slot.startTime, slot.endTime, a.startTime, a.endTime)
      );

      if (overlap) {
        const doctor = db.doctors.find(d => d.id === overlap.doctorId);
        const docName = doctor ? doctor.name : 'another doctor';
        return {
          valid: false,
          reason: `Schedule conflict: You already have a booked visit on ${slot.date} at ${overlap.startTime}-${overlap.endTime} with ${docName}.`
        };
      }

      return { valid: true, slot };
    },

    /**
     * FR-07: Book appointment
     */
    bookAppointment({ patientId, doctorId, slotId, notes }) {
      const check = this.validateSlotAvailability(patientId, doctorId, slotId);
      if (!check.valid) {
        return { success: false, message: check.reason };
      }

      const db = CABS.Storage.getDB();
      const targetSlot = db.timeSlots.find(s => s.id === slotId);
      const doctor = db.doctors.find(d => d.id === doctorId);

      if (!doctor || !doctor.active) {
        return { success: false, message: 'This doctor is currently inactive and cannot accept bookings.' };
      }

      // Mark slot as Booked
      targetSlot.status = 'Booked';

      // Create new Appointment
      const appointment = new CABS.Appointment({
        patientId,
        doctorId,
        slotId: targetSlot.id,
        date: targetSlot.date,
        startTime: targetSlot.startTime,
        endTime: targetSlot.endTime,
        status: 'Booked',
        notes: (notes || '').trim()
      });

      db.appointments.push(appointment);
      CABS.Storage.saveDB(db);

      return {
        success: true,
        message: 'Appointment successfully booked!',
        appointment
      };
    },

    /**
     * FR-10: Cancel appointment
     * Only for future Booked appointments. Set status to Cancelled and slot back to Available.
     */
    cancelAppointment(appointmentId, cancelledByUserId, reason = '') {
      const db = CABS.Storage.getDB();
      const apt = db.appointments.find(a => a.id === appointmentId);

      if (!apt) {
        return { success: false, message: 'Appointment not found.' };
      }

      if (apt.status !== 'Booked') {
        return { success: false, message: `Cannot cancel an appointment with status "${apt.status}".` };
      }

      // Check if future
      if (!isFutureDateTime(apt.date, apt.startTime)) {
        return { success: false, message: 'Past appointments cannot be cancelled.' };
      }

      // Update appointment
      apt.status = 'Cancelled';
      if (reason) {
        apt.notes = apt.notes ? `${apt.notes} | Cancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
      }

      // Free the slot back to Available
      const slot = db.timeSlots.find(s => s.id === apt.slotId);
      if (slot) {
        slot.status = 'Available';
      }

      CABS.Storage.saveDB(db);

      return {
        success: true,
        message: 'Appointment has been cancelled and the time slot is now available.',
        appointment: apt
      };
    },

    /**
     * FR-11: Reschedule appointment
     * Run FR-08 on new slot first. If valid, move appointment, mark new slot Booked, free old slot.
     */
    rescheduleAppointment(appointmentId, newSlotId) {
      const db = CABS.Storage.getDB();
      const apt = db.appointments.find(a => a.id === appointmentId);

      if (!apt) {
        return { success: false, message: 'Appointment not found.' };
      }

      if (apt.status !== 'Booked') {
        return { success: false, message: `Only "Booked" appointments can be rescheduled. Current status: ${apt.status}` };
      }

      if (!isFutureDateTime(apt.date, apt.startTime)) {
        return { success: false, message: 'Cannot reschedule past visits.' };
      }

      const newSlot = db.timeSlots.find(s => s.id === newSlotId);
      if (!newSlot) {
        return { success: false, message: 'The chosen reschedule slot was not found.' };
      }

      // FR-08 check on the new slot
      const check = this.validateSlotAvailability(apt.patientId, newSlot.doctorId, newSlotId, apt.id);
      if (!check.valid) {
        return {
          success: false,
          message: `Reschedule failed: ${check.reason}. Original appointment remains untouched.`
        };
      }

      // Free the old slot
      const oldSlot = db.timeSlots.find(s => s.id === apt.slotId);
      if (oldSlot) {
        oldSlot.status = 'Available';
      }

      // Mark new slot Booked
      newSlot.status = 'Booked';

      // Update appointment
      apt.doctorId = newSlot.doctorId;
      apt.slotId = newSlot.id;
      apt.date = newSlot.date;
      apt.startTime = newSlot.startTime;
      apt.endTime = newSlot.endTime;

      CABS.Storage.saveDB(db);

      return {
        success: true,
        message: `Appointment successfully rescheduled to ${newSlot.date} at ${newSlot.startTime}!`,
        appointment: apt
      };
    },

    /**
     * FR-13: Doctor updates visit status to Completed or No-Show
     */
    updateVisitStatus(appointmentId, doctorId, newStatus, visitNotes = '') {
      if (!['Completed', 'No-Show'].includes(newStatus)) {
        return { success: false, message: 'Status must be either "Completed" or "No-Show".' };
      }

      const db = CABS.Storage.getDB();
      const apt = db.appointments.find(a => a.id === appointmentId);

      if (!apt) {
        return { success: false, message: 'Appointment not found.' };
      }

      if (apt.doctorId !== doctorId) {
        return { success: false, message: 'Unauthorized: this appointment belongs to another doctor.' };
      }

      if (apt.status !== 'Booked') {
        return { success: false, message: `Appointment visit is already finalized as "${apt.status}".` };
      }

      apt.status = newStatus;
      if (visitNotes && visitNotes.trim()) {
        apt.notes = apt.notes ? `${apt.notes} | ${visitNotes.trim()}` : visitNotes.trim();
      }

      CABS.Storage.saveDB(db);

      return {
        success: true,
        message: `Appointment marked as ${newStatus}.`,
        appointment: apt
      };
    },

    /**
     * FR-09: Get patient appointments split into upcoming and past
     */
    getPatientAppointments(patientId) {
      const all = CABS.Storage.getAppointments().filter(a => a.patientId === patientId);
      const doctors = CABS.Storage.getDoctors();
      const specialties = CABS.Storage.getSpecialties();

      const enriched = all.map(a => {
        const doc = doctors.find(d => d.id === a.doctorId);
        const spec = doc ? specialties.find(s => s.id === doc.specialtyId) : null;
        const isFuture = isFutureDateTime(a.date, a.startTime);
        return {
          ...a,
          doctorName: doc ? doc.name : 'Unknown Doctor',
          specialtyName: spec ? spec.name : 'General Care',
          isFuture
        };
      });

      // Sort by date/time
      const upcoming = enriched
        .filter(a => a.status === 'Booked' && a.isFuture)
        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

      const past = enriched
        .filter(a => a.status !== 'Booked' || !a.isFuture)
        .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));

      return { upcoming, past, all: enriched };
    },

    /**
     * FR-12: Doctor daily schedule
     */
    getDoctorDailySchedule(doctorId, dateStr) {
      const db = CABS.Storage.getDB();
      const dayAppointments = db.appointments.filter(a => a.doctorId === doctorId && a.date === dateStr);
      const patients = db.patients;

      return dayAppointments
        .map(a => {
          const pat = patients.find(p => p.id === a.patientId);
          return {
            ...a,
            patientName: pat ? pat.fullName : 'Unknown Patient',
            patientPhone: pat ? pat.phone : '',
            patientEmail: pat ? pat.email : ''
          };
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    },

    /**
     * FR-17: Admin appointments overview with filters
     */
    getAdminAppointments({ date, doctorId, patientId, status } = {}) {
      let appointments = CABS.Storage.getAppointments();
      const doctors = CABS.Storage.getDoctors();
      const patients = CABS.Storage.getPatients();
      const specialties = CABS.Storage.getSpecialties();

      if (date) {
        appointments = appointments.filter(a => a.date === date);
      }
      if (doctorId && doctorId !== 'all') {
        appointments = appointments.filter(a => a.doctorId === doctorId);
      }
      if (patientId && patientId !== 'all') {
        appointments = appointments.filter(a => a.patientId === patientId);
      }
      if (status && status !== 'all') {
        appointments = appointments.filter(a => a.status === status);
      }

      return appointments
        .map(a => {
          const doc = doctors.find(d => d.id === a.doctorId);
          const pat = patients.find(p => p.id === a.patientId);
          const spec = doc ? specialties.find(s => s.id === doc.specialtyId) : null;
          return {
            ...a,
            doctorName: doc ? doc.name : 'Unknown Doctor',
            specialtyName: spec ? spec.name : 'General Care',
            patientName: pat ? pat.fullName : 'Unknown Patient',
            patientEmail: pat ? pat.email : '',
            patientPhone: pat ? pat.phone : '',
            isFuture: isFutureDateTime(a.date, a.startTime)
          };
        })
        .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
    },

    /**
     * FR-18: Admin patient search and profile history
     */
    searchPatients(query) {
      const patients = CABS.Storage.getPatients();
      if (!query || !query.trim()) return patients;

      const q = query.trim().toLowerCase();
      return patients.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q)
      );
    },

    getPatientRecord(patientId) {
      const patient = CABS.Storage.findPatientById(patientId);
      if (!patient) return null;

      const appointments = this.getPatientAppointments(patientId);
      return {
        patient,
        appointments
      };
    }
  };

  root.CABS.DoctorService = DoctorService;
  root.CABS.SpecialtyService = SpecialtyService;
  root.CABS.SlotService = SlotService;
  root.CABS.AppointmentService = AppointmentService;
  root.CABS.Helpers = { isFutureDateTime, timesOverlap };
})();
