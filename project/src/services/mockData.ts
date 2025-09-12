import { Doctor, Patient, TimeSlot, Consultation, Prescription, SymptomQuestion, PharmacyOrder } from '../types';

export const mockDoctors: Doctor[] = [
  // {
  //   id: 'doc1',
  //   name: 'Dr. Sarah Johnson',
  //   email: 'sarah@clinic.com',
  //   role: 'doctor',
  //   specialty: 'General Medicine',
  //   experience: 8,
  //   rating: 4.8,
  //   price: 50,
  //   languages: ['English', 'Spanish'],
  //   avatar: 'https://images.pexels.com/photos/559823/pexels-photo-559823.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  //   slots: [
  //     { id: 'slot1', doctorId: 'doc1', date: '2025-01-15', time: '09:00', available: true },
  //     { id: 'slot2', doctorId: 'doc1', date: '2025-01-15', time: '10:00', available: true },
  //     { id: 'slot3', doctorId: 'doc1', date: '2025-01-15', time: '14:00', available: true }
  //   ]
  // },
  // {
  //   id: 'doc2',
  //   name: 'Dr. Michael Chen',
  //   email: 'michael@clinic.com',
  //   role: 'doctor',
  //   specialty: 'Cardiology',
  //   experience: 12,
  //   rating: 4.9,
  //   price: 75,
  //   languages: ['English', 'Chinese'],
  //   avatar: 'https://images.pexels.com/photos/612608/pexels-photo-612608.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  //   slots: [
  //     { id: 'slot4', doctorId: 'doc2', date: '2025-01-15', time: '11:00', available: true },
  //     { id: 'slot5', doctorId: 'doc2', date: '2025-01-15', time: '15:00', available: true }
  //   ]
  // },
  {
    id: 'doc1',
    name: 'Dr. Emily Rodriguez',
    email: 'emily@clinic.com',
    role: 'doctor',
    specialty: 'Dermatology',
    experience: 6,
    rating: 4.7,
    price: 60,
    languages: ['English', 'Spanish', 'French'],
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    slots: [
      { id: 'slot6', doctorId: 'doc3', date: '2025-01-15', time: '13:00', available: true },
      { id: 'slot7', doctorId: 'doc3', date: '2025-01-15', time: '16:00', available: true }
    ]
  }
];

export const mockPatient: Patient = {
  id: 'patient1',
  name: 'Ram Kumar',
  email: 'ramkumar@email.com',
  role: 'patient',
  age: 35,
  gender: 'Male',
  medicalHistory: ['Hypertension', 'Diabetes Type 2'],
  prescriptions: [],
  consultations: []
};

export const symptomQuestions: SymptomQuestion[] = [
  {
    id: 'q1',
    question: 'What is your primary concern today?',
    type: 'single',
    options: ['Fever', 'Headache', 'Chest Pain', 'Skin Issues', 'Digestive Problems', 'Mental Health']
  },
  {
    id: 'q2',
    question: 'How long have you been experiencing this?',
    type: 'single',
    options: ['Less than 24 hours', '1-3 days', '1 week', 'More than a week']
  },
  {
    id: 'q3',
    question: 'Rate your pain/discomfort level (1-10)',
    type: 'scale'
  },
  {
    id: 'q4',
    question: 'Do you have any of these additional symptoms?',
    type: 'multiple',
    options: ['Nausea', 'Dizziness', 'Fatigue', 'Shortness of breath', 'None of the above']
  }
];

export const mockPrescription: Prescription = {
  id: 'rx1',
  doctorId: 'doc1',
  patientId: 'patient1',
  consultationId: 'cons1',
  date: '2025-01-10',
  instructions: 'Take medication as prescribed. Rest well and stay hydrated.',
  medicines: [
    {
      id: 'med1',
      name: 'Paracetamol 500mg',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '5 days',
      quantity: 10
    },
    {
      id: 'med2',
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'Once daily',
      duration: '30 days',
      quantity: 30
    }
  ]
};

export const mockPharmacyOrder: PharmacyOrder = {
  id: 'order1',
  patientId: 'patient1',
  prescriptionId: 'rx1',
  medicines: mockPrescription.medicines,
  status: 'preparing',
  totalAmount: 25.50,
  estimatedDelivery: '2025-01-16'
};