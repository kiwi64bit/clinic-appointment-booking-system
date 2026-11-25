/**
 * Domain Models for Clinic Appointment Booking System (CABS)
 * Required classes: User, Patient, Doctor, Administrator, Specialty, TimeSlot, Appointment.
 * TimeSlot status: Available | Booked | Blocked
 * Appointment status: Booked | Cancelled | Completed | No-Show
 */

class User {
  constructor({ id, email, passwordHash, role, createdAt }) {
    this.id = id || `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.email = (email || '').trim().toLowerCase();
    this.passwordHash = passwordHash || '';
    this.role = role || 'patient'; // 'patient' | 'doctor' | 'admin'
    this.createdAt = createdAt || new Date().toISOString();
  }
}

class Patient extends User {
  constructor({ id, fullName, email, phone, dateOfBirth, passwordHash, createdAt }) {
    super({ id, email, passwordHash, role: 'patient', createdAt });
    this.fullName = (fullName || '').trim();
    this.phone = (phone || '').trim();
    this.dateOfBirth = dateOfBirth || '';
  }

  get name() {
    return this.fullName;
  }
}

class Doctor extends User {
  constructor({
    id,
    name,
    email,
    specialtyId,
    experienceYears,
    fee,
    bio,
    workingDays,
    consultationHours,
    active = true,
    passwordHash,
    createdAt
  }) {
    super({ id, email, passwordHash, role: 'doctor', createdAt });
    this.name = (name || '').trim();
    this.specialtyId = specialtyId || '';
    this.experienceYears = Number(experienceYears) || 0;
    this.fee = Number(fee) || 0;
    this.bio = (bio || '').trim();
    this.workingDays = Array.isArray(workingDays) ? workingDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    this.consultationHours = consultationHours || '09:00 - 17:00';
    this.active = Boolean(active);
  }
}

class Administrator extends User {
  constructor({ id, name, email, passwordHash, createdAt }) {
    super({ id, email, passwordHash, role: 'admin', createdAt });
    this.name = (name || '').trim();
  }
}

class Specialty {
  constructor({ id, name, description }) {
    this.id = id || `spec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.name = (name || '').trim();
    this.description = (description || '').trim();
  }
}

class TimeSlot {
  constructor({ id, doctorId, date, startTime, endTime, status = 'Available' }) {
    this.id = id || `slot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.doctorId = doctorId;
    this.date = date; // YYYY-MM-DD
    this.startTime = startTime; // HH:MM (24-hour format)
    this.endTime = endTime; // HH:MM
    this.status = status; // 'Available' | 'Booked' | 'Blocked'
  }
}

class Appointment {
  constructor({ id, patientId, doctorId, slotId, date, startTime, endTime, status = 'Booked', notes = '', createdAt }) {
    this.id = id || `apt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.patientId = patientId;
    this.doctorId = doctorId;
    this.slotId = slotId;
    this.date = date; // YYYY-MM-DD
    this.startTime = startTime; // HH:MM
    this.endTime = endTime; // HH:MM
    this.status = status; // 'Booked' | 'Cancelled' | 'Completed' | 'No-Show'
    this.notes = (notes || '').trim();
    this.createdAt = createdAt || new Date().toISOString();
  }
}

// Attach to global/window object for universal availability
const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
root.CABS = root.CABS || {};
Object.assign(root.CABS, {
  User,
  Patient,
  Doctor,
  Administrator,
  Specialty,
  TimeSlot,
  Appointment
});

