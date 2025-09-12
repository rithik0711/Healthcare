export interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'patient';
  avatar?: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialty: string;
  experience: number;
  rating: number;
  price: number;
  languages: string[];
  slots: TimeSlot[];
}

export interface Patient extends User {
  role: 'patient';
  age: number;
  gender: string;
  medicalHistory: string[];
  prescriptions: Prescription[];
  consultations: Consultation[];
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  available: boolean;
  isCritical?: boolean;
}

export interface Consultation {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  isCritical: boolean;
  videoLink?: string;
  prescription?: Prescription;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  consultationId: string;
  medicines: Medicine[];
  instructions: string;
  date: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

export interface PharmacyOrder {
  id: string;
  patientId: string;
  prescriptionId: string;
  medicines: Medicine[];
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
  totalAmount: number;
  estimatedDelivery: string;
}

export interface SymptomQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'scale';
  options?: string[];
  specialty?: string;
}

export interface SymptomResponse {
  questionId: string;
  answer: string | string[] | number;
}