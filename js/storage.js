/**
 * storage.js - LocalStorage Database & Seed Data for CABS
 * FR-01, FR-02, FR-14, FR-15, FR-16, FR-17, FR-18, NFR-03
 */

(function () {
  const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
  root.CABS = root.CABS || {};
  const CABS = root.CABS;
  const STORAGE_KEY = 'CABS_DATA';

  // Demo Password Hashes (Pre-hashed SHA-256)
  // 'patient123' -> d4587ea9ead060c13fd994f21ecfa7926272a78854a2c20136b10a3c9e53e71e
  // 'doctor123'  -> f348d5628621f3d8f59c8cabda0f8eb0aa7e0514a90be7571020b1336f26c113
  // 'admin123'   -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
  // 'password123'-> ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
  const HASH_PATIENT = 'd4587ea9ead060c13fd994f21ecfa7926272a78854a2c20136b10a3c9e53e71e';
  const HASH_DOCTOR  = 'f348d5628621f3d8f59c8cabda0f8eb0aa7e0514a90be7571020b1336f26c113';
  const HASH_ADMIN   = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
  const HASH_COMMON  = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';

  function formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function addDays(d, days) {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res;
  }

  function generateSeedData() {
    const now = new Date();

    // 1. Specialties (6 items > 5 required)
    const specialties = [
      new CABS.Specialty({
        id: 'spec_gp',
        name: 'General Practice',
        description: 'Comprehensive preventive care, health checkups, routine diagnoses, and family wellness.'
      }),
      new CABS.Specialty({
        id: 'spec_cardio',
        name: 'Cardiology',
        description: 'Heart health, cardiovascular assessments, hypertension monitoring, and electrocardiography.'
      }),
      new CABS.Specialty({
        id: 'spec_derma',
        name: 'Dermatology',
        description: 'Skin examinations, treatment of acne, dermatitis, allergies, and dermatological screenings.'
      }),
      new CABS.Specialty({
        id: 'spec_ortho',
        name: 'Orthopedics',
        description: 'Musculoskeletal injuries, joint pain, spine care, sports medicine, and rehabilitation.'
      }),
      new CABS.Specialty({
        id: 'spec_pedia',
        name: 'Pediatrics',
        description: 'Specialized healthcare, immunization, developmental tracking, and nutrition for children.'
      }),
      new CABS.Specialty({
        id: 'spec_neuro',
        name: 'Neurology',
        description: 'Disorders of the nervous system, migraines, neuropathy, tremors, and cognitive consultations.'
      })
    ];

    // 2. Doctors (9 items > 8 required, 2 inactive)
    const doctors = [
      new CABS.Doctor({
        id: 'doc_sarah',
        name: 'Dr. Sarah Jenkins',
        email: 'doctor@cabs.local',
        specialtyId: 'spec_cardio',
        experienceYears: 14,
        fee: 120,
        bio: 'Senior Cardiologist specializing in preventive heart health and stress testing.',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        consultationHours: '09:00 - 16:30',
        active: true,
        passwordHash: HASH_DOCTOR
      }),
      new CABS.Doctor({
        id: 'doc_marcus',
        name: 'Dr. Marcus Vance',
        email: 'marcus.vance@cabs.local',
        specialtyId: 'spec_cardio',
        experienceYears: 18,
        fee: 145,
        bio: 'Cardiology consultant with extensive clinical experience in rhythm management.',
        workingDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        consultationHours: '10:00 - 17:00',
        active: true,
        passwordHash: HASH_COMMON
      }),
      new CABS.Doctor({
        id: 'doc_elena',
        name: 'Dr. Elena Rostova',
        email: 'elena.rostova@cabs.local',
        specialtyId: 'spec_gp',
        experienceYears: 9,
        fee: 75,
        bio: 'Family physician focused on primary care, wellness screenings, and metabolic health.',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
        consultationHours: '08:30 - 15:30',
        active: true,
        passwordHash: HASH_COMMON
      }),
      new CABS.Doctor({
        id: 'doc_david',
        name: 'Dr. David Kim',
        email: 'david.kim@cabs.local',
        specialtyId: 'spec_derma',
        experienceYears: 11,
        fee: 110,
        bio: 'Dermatologist focusing on skin screening, dermatitis care, and procedural treatments.',
        workingDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
        consultationHours: '09:00 - 16:00',
        active: true,
        passwordHash: HASH_COMMON
      }),
      new CABS.Doctor({
        id: 'doc_priya',
        name: 'Dr. Priya Patel',
        email: 'priya.patel@cabs.local',
        specialtyId: 'spec_pedia',
        experienceYears: 13,
        fee: 95,
        bio: 'Pediatric specialist devoted to childhood wellness, immunization, and growth guidance.',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        consultationHours: '09:00 - 17:00',
        active: true,
        passwordHash: HASH_COMMON
      }),
      new CABS.Doctor({
        id: 'doc_robert',
        name: 'Dr. Robert Chen',
        email: 'robert.chen@cabs.local',
        specialtyId: 'spec_ortho',
        experienceYears: 16,
        fee: 135,
        bio: 'Orthopedic specialist treating joint pain, sport injuries, and post-injury rehabilitation.',
        workingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        consultationHours: '08:30 - 16:00',
        active: true,
        passwordHash: HASH_COMMON
      }),
      new CABS.Doctor({
        id: 'doc_hannah',
        name: 'Dr. Hannah Foster',
        email: 'hannah.foster@cabs.local',
        specialtyId: 'spec_neuro',
        experienceYears: 12,
        fee: 160,
        bio: 'Neurologist providing consultations for migraines, neural health, and autonomic conditions.',
        workingDays: ['Monday', 'Wednesday', 'Friday'],
        consultationHours: '10:00 - 16:00',
        active: true,
        passwordHash: HASH_COMMON
      }),
      new CABS.Doctor({
        id: 'doc_arthur',
        name: 'Dr. Arthur Bennett',
        email: 'arthur.bennett@cabs.local',
        specialtyId: 'spec_gp',
        experienceYears: 24,
        fee: 90,
        bio: 'General Practitioner currently on academic leave. Not accepting new bookings.',
        workingDays: ['Monday', 'Tuesday'],
        consultationHours: '10:00 - 14:00',
        active: false,
        passwordHash: HASH_COMMON
      }),
      new CABS.Doctor({
        id: 'doc_clara',
        name: 'Dr. Clara Mercer',
        email: 'clara.mercer@cabs.local',
        specialtyId: 'spec_derma',
        experienceYears: 8,
        fee: 105,
        bio: 'Dermatologist currently away on clinical sabbatical. Inactive for new slots.',
        workingDays: ['Tuesday', 'Thursday'],
        consultationHours: '11:00 - 15:00',
        active: false,
        passwordHash: HASH_COMMON
      })
    ];

    // 3. Patients (23 items > 20 required, first 3 have login credentials)
    const patientNames = [
      { name: 'Alex Taylor', email: 'patient@cabs.local', hash: HASH_PATIENT, phone: '+1 555-0101', dob: '1992-06-15' },
      { name: 'Morgan Hayes', email: 'morgan.hayes@email.com', hash: HASH_COMMON, phone: '+1 555-0102', dob: '1987-03-24' },
      { name: 'Jordan Vance', email: 'jordan.vance@email.com', hash: HASH_COMMON, phone: '+1 555-0103', dob: '1979-11-12' },
      { name: 'Riley Brooks', email: 'riley.brooks@test.com', hash: HASH_COMMON, phone: '+1 555-0104', dob: '1990-04-15' },
      { name: 'Casey Parker', email: 'casey.parker@test.com', hash: HASH_COMMON, phone: '+1 555-0105', dob: '1988-09-20' },
      { name: 'Taylor Price', email: 'taylor.price@test.com', hash: HASH_COMMON, phone: '+1 555-0106', dob: '1995-12-05' },
      { name: 'Sam Russell', email: 'sam.russell@test.com', hash: HASH_COMMON, phone: '+1 555-0107', dob: '1982-01-18' },
      { name: 'Avery Evans', email: 'avery.evans@test.com', hash: HASH_COMMON, phone: '+1 555-0108', dob: '1993-07-29' },
      { name: 'Logan Diaz', email: 'logan.diaz@test.com', hash: HASH_COMMON, phone: '+1 555-0109', dob: '1984-11-03' },
      { name: 'Jamie Cooper', email: 'jamie.cooper@test.com', hash: HASH_COMMON, phone: '+1 555-0110', dob: '1998-02-14' },
      { name: 'Reese Nelson', email: 'reese.nelson@test.com', hash: HASH_COMMON, phone: '+1 555-0111', dob: '1991-08-30' },
      { name: 'Harper Ross', email: 'harper.ross@test.com', hash: HASH_COMMON, phone: '+1 555-0112', dob: '1989-10-10' },
      { name: 'Finley Powell', email: 'finley.powell@test.com', hash: HASH_COMMON, phone: '+1 555-0113', dob: '1994-05-22' },
      { name: 'Rowan Hughes', email: 'rowan.hughes@test.com', hash: HASH_COMMON, phone: '+1 555-0114', dob: '1986-06-18' },
      { name: 'Dakota Butler', email: 'dakota.butler@test.com', hash: HASH_COMMON, phone: '+1 555-0115', dob: '1975-04-02' },
      { name: 'Kendall Simmons', email: 'kendall.simmons@test.com', hash: HASH_COMMON, phone: '+1 555-0116', dob: '2001-09-08' },
      { name: 'Peyton Foster', email: 'peyton.foster@test.com', hash: HASH_COMMON, phone: '+1 555-0117', dob: '1996-03-12' },
      { name: 'Skyler Ward', email: 'skyler.ward@test.com', hash: HASH_COMMON, phone: '+1 555-0118', dob: '1983-11-27' },
      { name: 'Hayden Morris', email: 'hayden.morris@test.com', hash: HASH_COMMON, phone: '+1 555-0119', dob: '1992-12-19' },
      { name: 'Emerson Bell', email: 'emerson.bell@test.com', hash: HASH_COMMON, phone: '+1 555-0120', dob: '1985-05-01' },
      { name: 'Sawyer Murphy', email: 'sawyer.murphy@test.com', hash: HASH_COMMON, phone: '+1 555-0121', dob: '1997-07-07' },
      { name: 'Dallas Rivera', email: 'dallas.rivera@test.com', hash: HASH_COMMON, phone: '+1 555-0122', dob: '1990-10-25' },
      { name: 'Quinn Bailey', email: 'quinn.bailey@test.com', hash: HASH_COMMON, phone: '+1 555-0123', dob: '1993-02-17' }
    ];

    const patients = patientNames.map((p, idx) => new CABS.Patient({
      id: idx === 0 ? 'pat_demo' : `pat_${idx + 1}`,
      fullName: p.name,
      email: p.email,
      phone: p.phone,
      dateOfBirth: p.dob,
      passwordHash: p.hash
    }));

    // 4. Administrators
    const administrators = [
      new CABS.Administrator({
        id: 'admin_master',
        name: 'Clinic Administrator',
        email: 'admin@cabs.local',
        passwordHash: HASH_ADMIN // password: admin123
      })
    ];

    // 5. TimeSlots (Next 14 days + Past days for appointment history)
    const timeSlots = [];
    const appointments = [];

    const slotTemplates = [
      { startTime: '09:00', endTime: '09:30' },
      { startTime: '09:30', endTime: '10:00' },
      { startTime: '10:00', endTime: '10:30' },
      { startTime: '10:30', endTime: '11:00' },
      { startTime: '11:00', endTime: '11:30' },
      { startTime: '11:30', endTime: '12:00' },
      { startTime: '14:00', endTime: '14:30' },
      { startTime: '14:30', endTime: '15:00' },
      { startTime: '15:00', endTime: '15:30' },
      { startTime: '15:30', endTime: '16:00' }
    ];

    // Past appointments (Completed, No-Show, Cancelled)
    const pastOffsets = [-3, -2, -1];
    pastOffsets.forEach((offset, idx) => {
      const pastDate = formatDate(addDays(now, offset));

      // Completed visit
      const s1 = new CABS.TimeSlot({
        id: `slot_past_${idx}_1`,
        doctorId: 'doc_sarah',
        date: pastDate,
        startTime: '09:00',
        endTime: '09:30',
        status: 'Booked'
      });
      timeSlots.push(s1);
      appointments.push(new CABS.Appointment({
        id: `apt_past_${idx}_comp`,
        patientId: 'pat_demo',
        doctorId: 'doc_sarah',
        slotId: s1.id,
        date: pastDate,
        startTime: '09:00',
        endTime: '09:30',
        status: 'Completed',
        notes: 'Routine cardiac evaluation. Vitals normal.',
        createdAt: new Date(addDays(now, offset - 5)).toISOString()
      }));

      // No-Show visit
      const s2 = new CABS.TimeSlot({
        id: `slot_past_${idx}_2`,
        doctorId: 'doc_sarah',
        date: pastDate,
        startTime: '10:00',
        endTime: '10:30',
        status: 'Booked'
      });
      timeSlots.push(s2);
      appointments.push(new CABS.Appointment({
        id: `apt_past_${idx}_noshow`,
        patientId: 'pat_2',
        doctorId: 'doc_sarah',
        slotId: s2.id,
        date: pastDate,
        startTime: '10:00',
        endTime: '10:30',
        status: idx === 2 ? 'No-Show' : 'Completed',
        notes: idx === 2 ? 'Patient missed scheduled consultation.' : 'General checkup completed.',
        createdAt: new Date(addDays(now, offset - 4)).toISOString()
      }));

      // Cancelled visit
      const s3 = new CABS.TimeSlot({
        id: `slot_past_${idx}_3`,
        doctorId: 'doc_elena',
        date: pastDate,
        startTime: '11:00',
        endTime: '11:30',
        status: 'Available' // Freed when cancelled
      });
      timeSlots.push(s3);
      appointments.push(new CABS.Appointment({
        id: `apt_past_${idx}_canc`,
        patientId: 'pat_3',
        doctorId: 'doc_elena',
        slotId: s3.id,
        date: pastDate,
        startTime: '11:00',
        endTime: '11:30',
        status: 'Cancelled',
        notes: 'Cancelled due to patient scheduling conflict.',
        createdAt: new Date(addDays(now, offset - 3)).toISOString()
      }));
    });

    // Future slots (Day 0 through Day 13 - next 14 days)
    const activeDocs = doctors.filter(d => d.active);

    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const targetDate = formatDate(addDays(now, dayOffset));

      activeDocs.forEach((doc, dIdx) => {
        slotTemplates.forEach((tmpl, sIdx) => {
          const slotId = `slot_d${dayOffset}_doc${dIdx}_s${sIdx}`;
          let status = 'Available';

          // Specific booked visits for demo testing
          if (doc.id === 'doc_sarah' && dayOffset === 0 && sIdx === 1) {
            status = 'Booked';
            timeSlots.push(new CABS.TimeSlot({ id: slotId, doctorId: doc.id, date: targetDate, startTime: tmpl.startTime, endTime: tmpl.endTime, status }));
            appointments.push(new CABS.Appointment({
              id: 'apt_today_demo_sarah',
              patientId: 'pat_demo',
              doctorId: doc.id,
              slotId: slotId,
              date: targetDate,
              startTime: tmpl.startTime,
              endTime: tmpl.endTime,
              status: 'Booked',
              notes: 'Annual cardiology consultation and ECG.',
              createdAt: new Date().toISOString()
            }));
            return;
          }

          if (doc.id === 'doc_sarah' && dayOffset === 1 && sIdx === 3) {
            status = 'Booked';
            timeSlots.push(new CABS.TimeSlot({ id: slotId, doctorId: doc.id, date: targetDate, startTime: tmpl.startTime, endTime: tmpl.endTime, status }));
            appointments.push(new CABS.Appointment({
              id: 'apt_tomorrow_pat2_sarah',
              patientId: 'pat_2',
              doctorId: doc.id,
              slotId: slotId,
              date: targetDate,
              startTime: tmpl.startTime,
              endTime: tmpl.endTime,
              status: 'Booked',
              notes: 'Follow-up consultation.',
              createdAt: new Date().toISOString()
            }));
            return;
          }

          if (doc.id === 'doc_elena' && dayOffset === 2 && sIdx === 0) {
            status = 'Booked';
            timeSlots.push(new CABS.TimeSlot({ id: slotId, doctorId: doc.id, date: targetDate, startTime: tmpl.startTime, endTime: tmpl.endTime, status }));
            appointments.push(new CABS.Appointment({
              id: 'apt_day2_demo_elena',
              patientId: 'pat_demo',
              doctorId: doc.id,
              slotId: slotId,
              date: targetDate,
              startTime: tmpl.startTime,
              endTime: tmpl.endTime,
              status: 'Booked',
              notes: 'Routine blood panel review.',
              createdAt: new Date().toISOString()
            }));
            return;
          }

          // A few blocked slots for maintenance / rounds
          if (sIdx === 5 && dayOffset % 2 === 0) {
            status = 'Blocked';
          }

          timeSlots.push(new CABS.TimeSlot({
            id: slotId,
            doctorId: doc.id,
            date: targetDate,
            startTime: tmpl.startTime,
            endTime: tmpl.endTime,
            status
          }));
        });
      });
    }

    return {
      version: 1,
      specialties,
      doctors,
      patients,
      administrators,
      timeSlots,
      appointments
    };
  }

  const Storage = {
    init() {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        return this.reset();
      }
      try {
        const parsed = JSON.parse(existing);
        if (!parsed || !parsed.specialties || !parsed.doctors || !parsed.patients) {
          return this.reset();
        }
        return parsed;
      } catch (e) {
        console.warn('CABS: Corrupted storage found. Resetting...', e);
        return this.reset();
      }
    },

    getDB() {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return this.init();
      try {
        return JSON.parse(data);
      } catch (e) {
        return this.init();
      }
    },

    saveDB(db) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    },

    reset() {
      const seed = generateSeedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    },

    getSpecialties() {
      return this.getDB().specialties || [];
    },

    getDoctors() {
      return this.getDB().doctors || [];
    },

    getPatients() {
      return this.getDB().patients || [];
    },

    getAdministrators() {
      return this.getDB().administrators || [];
    },

    getTimeSlots() {
      return this.getDB().timeSlots || [];
    },

    getAppointments() {
      return this.getDB().appointments || [];
    },

    findUserByEmail(email) {
      if (!email) return null;
      const cleanEmail = email.trim().toLowerCase();
      const db = this.getDB();

      const admin = (db.administrators || []).find(a => a.email.toLowerCase() === cleanEmail);
      if (admin) return { user: admin, role: 'admin' };

      const doctor = (db.doctors || []).find(d => d.email.toLowerCase() === cleanEmail);
      if (doctor) return { user: doctor, role: 'doctor' };

      const patient = (db.patients || []).find(p => p.email.toLowerCase() === cleanEmail);
      if (patient) return { user: patient, role: 'patient' };

      return null;
    },

    findDoctorById(id) {
      return (this.getDoctors()).find(d => d.id === id) || null;
    },

    findPatientById(id) {
      return (this.getPatients()).find(p => p.id === id) || null;
    },

    findSpecialtyById(id) {
      return (this.getSpecialties()).find(s => s.id === id) || null;
    },

    findTimeSlotById(id) {
      return (this.getTimeSlots()).find(s => s.id === id) || null;
    },

    findAppointmentById(id) {
      return (this.getAppointments()).find(a => a.id === id) || null;
    }
  };

  root.CABS.Storage = Storage;
  Storage.init();
})();
