import { Doctor, Patient, Consultation, Prescription, PharmacyOrder, SymptomResponse } from '../types';
import { mockDoctors, mockPatient, mockPrescription, mockPharmacyOrder, symptomQuestions } from './mockData';

class TelemedicineAPI {
  private doctors: Doctor[] = [...mockDoctors];
  private consultations: Consultation[] = [];
  private prescriptions: Prescription[] = [mockPrescription];
  private pharmacyOrders: PharmacyOrder[] = [mockPharmacyOrder];
  private patients: Patient[] = [mockPatient];

  // Auth (mocked)
  async login(email: string, _password: string, role: 'doctor' | 'patient'): Promise<Doctor | Patient | null> {
    if (role === 'doctor') {
      return this.doctors.find(d => d.email === email) || null;
    }
    return this.patients.find(p => p.email === email) || this.patients[0] || null;
  }

  async registerDoctor(doctorData: Partial<Doctor>): Promise<Doctor> {
    const newDoctor: Doctor = {
      id: `doc${Date.now()}`,
      role: 'doctor',
      slots: [],
      rating: 4.5,
      languages: [],
      price: 0,
      experience: 0,
      specialty: '',
      name: '',
      email: '',
      ...doctorData
    } as Doctor;
    this.doctors.push(newDoctor);
    return newDoctor;
  }

  // Doctors (mocked)
  async getDoctors(): Promise<Doctor[]> {
    return this.doctors;
  }

  async addTimeSlot(doctorId: string, date: string, time: string): Promise<void> {
    await this.delay(300);
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (doctor) {
      const newSlot = {
        id: `slot${Date.now()}`,
        doctorId,
        date,
        time,
        available: true
      };
      doctor.slots.push(newSlot);
    }
  }

  // Consultations
  async bookConsultation(doctorId: string, slotId: string, isCritical: boolean): Promise<Consultation> {
    await this.delay(500);
    const doctor = this.doctors.find(d => d.id === doctorId);
    const slot = doctor?.slots.find(s => s.id === slotId);
    
    if (!doctor || !slot) throw new Error('Invalid booking');
    
    slot.available = false;
    slot.isCritical = isCritical;
    
    const consultation: Consultation = {
      id: `cons${Date.now()}`,
      doctorId,
      patientId: mockPatient.id,
      date: slot.date,
      time: slot.time,
      status: 'scheduled',
      isCritical,
      videoLink: `https://meet.telemedicine.com/room/${Date.now()}`
    };
    
    this.consultations.push(consultation);
    return consultation;
  }

  async getConsultations(userId: string, role: 'doctor' | 'patient'): Promise<Consultation[]> {
    await this.delay(300);
    if (role === 'doctor') {
      return this.consultations.filter(c => c.doctorId === userId);
    } else {
      return this.consultations.filter(c => c.patientId === userId);
    }
  }

  // Prescriptions
  async addPrescription(consultationId: string, prescription: Omit<Prescription, 'id'>): Promise<Prescription> {
    await this.delay(500);
    const newPrescription: Prescription = {
      ...prescription,
      id: `rx${Date.now()}`
    };
    
    this.prescriptions.push(newPrescription);
    
    // Update consultation
    const consultation = this.consultations.find(c => c.id === consultationId);
    if (consultation) {
      consultation.prescription = newPrescription;
      consultation.status = 'completed';
    }
    
    return newPrescription;
  }

  async getPrescriptions(patientId: string): Promise<Prescription[]> {
    await this.delay(300);
    return this.prescriptions.filter(p => p.patientId === patientId);
  }

  // Pharmacy
  async orderMedicines(prescriptionId: string): Promise<PharmacyOrder> {
    await this.delay(500);
    const prescription = this.prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) throw new Error('Prescription not found');
    
    const order: PharmacyOrder = {
      id: `order${Date.now()}`,
      patientId: prescription.patientId,
      prescriptionId,
      medicines: prescription.medicines,
      status: 'pending',
      totalAmount: prescription.medicines.reduce((sum, med) => sum + (med.quantity * 2.5), 0),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    this.pharmacyOrders.push(order);
    return order;
  }

  async getPharmacyOrders(patientId: string): Promise<PharmacyOrder[]> {
    await this.delay(300);
    return this.pharmacyOrders.filter(o => o.patientId === patientId);
  }

  async updateOrderStatus(orderId: string, status: PharmacyOrder['status']): Promise<void> {
    await this.delay(300);
    const order = this.pharmacyOrders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
    }
  }

  // AI Symptom Checker
  async getSymptomQuestions() {
    await this.delay(300);
    return symptomQuestions;
  }

  async analyzeSymptoms(responses: SymptomResponse[]): Promise<{ specialty: string; urgency: 'low' | 'medium' | 'high'; recommendation: string }> {
    await this.delay(1000);
    
    const primaryConcern = responses.find(r => r.questionId === 'q1')?.answer as string;
    const painLevel = responses.find(r => r.questionId === 'q3')?.answer as number;
    
    // Simple AI logic
    let specialty = 'General Medicine';
    let urgency: 'low' | 'medium' | 'high' = 'low';
    
    if (primaryConcern?.includes('Chest Pain')) {
      specialty = 'Cardiology';
      urgency = 'high';
    } else if (primaryConcern?.includes('Skin Issues')) {
      specialty = 'Dermatology';
      urgency = 'low';
    } else if (primaryConcern?.includes('Mental Health')) {
      specialty = 'Psychiatry';
      urgency = 'medium';
    }
    
    if (painLevel && painLevel >= 8) {
      urgency = 'high';
    }
    
    return {
      specialty,
      urgency,
      recommendation: `Based on your symptoms, we recommend consulting with a ${specialty} specialist. ${urgency === 'high' ? 'Please seek immediate medical attention.' : ''}`
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Patients (mocked)
  async createPatient(patient: Partial<Patient>) {
    const newPatient: Patient = {
      id: `patient${Date.now()}`,
      role: 'patient',
      name: patient.name || 'New Patient',
      email: patient.email || `patient${Date.now()}@example.com`,
      age: patient.age || 0,
      gender: patient.gender || 'other',
      medicalHistory: patient.medicalHistory || [],
      prescriptions: [],
      consultations: []
    };
    this.patients.push(newPatient);
    return newPatient;
  }

  async getPatients() {
    return this.patients;
  }

  async getPatient(id: string) {
    return this.patients.find(p => p.id === id) || null;
  }

  async updatePatient(id: string, updates: Partial<Patient>) {
    const index = this.patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Not found');
    this.patients[index] = { ...this.patients[index], ...updates } as Patient;
    return this.patients[index];
  }

  async deletePatient(id: string) {
    this.patients = this.patients.filter(p => p.id !== id);
    return { success: true } as any;
  }
}

export const api = new TelemedicineAPI();