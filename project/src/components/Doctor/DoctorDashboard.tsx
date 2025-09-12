import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Video, FileText, Star } from 'lucide-react';
import { Doctor, Consultation, TimeSlot } from '../../types';
import { api } from '../../services/api';

interface DoctorDashboardProps {
  doctor: Doctor;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctor }) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConsultations();
  }, [doctor.id]);

  const loadConsultations = async () => {
    try {
      const data = await api.getConsultations(doctor.id, 'doctor');
      setConsultations(data);
    } catch (error) {
      console.error('Failed to load consultations:', error);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.addTimeSlot(doctor.id, newSlot.date, newSlot.time);
      setNewSlot({ date: '', time: '' });
      setShowAddSlot(false);
      // Refresh doctor data in parent component would be needed here
    } catch (error) {
      console.error('Failed to add slot:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingConsultations = consultations.filter(c => c.status === 'scheduled');
  const completedConsultations = consultations.filter(c => c.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <img
                src="./images/image.png"
                alt={doctor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                <p className="text-gray-600">{doctor.specialty}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="font-semmg
                bold">{doctor.rating}</span>
              </div>
              <button
                onClick={() => setShowAddSlot(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Slot
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{upcomingConsultations.length}</p>
                <p className="text-gray-600">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{doctor.slots.filter(s => s.available).length}</p>
                <p className="text-gray-600">Available Slots</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{completedConsultations.length}</p>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">${(doctor.price * completedConsultations.length).toFixed(0)}</p>
                <p className="text-gray-600">Earnings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Consultations */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Consultations</h2>
          </div>
          <div className="p-6">
            {upcomingConsultations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming consultations</p>
            ) : (
              <div className="space-y-4">
                {upcomingConsultations.map(consultation => (
                  <div
                    key={consultation.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          consultation.isCritical ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">Patient Consultation</p>
                          <p className="text-sm text-gray-600">
                            {consultation.date} at {consultation.time}
                            {consultation.isCritical && (
                              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                Critical
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(consultation.videoLink, '_blank')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center"
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Join
                        </button>
                        <button
                          onClick={() => setSelectedConsultation(consultation)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Prescribe
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Slots */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Available Time Slots</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {doctor.slots.filter(slot => slot.available).map(slot => (
                <div
                  key={slot.id}
                  className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  </div>
                  <p className="font-medium text-gray-900">{slot.date}</p>
                  <p className="text-sm text-gray-600">{slot.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Time Slot</h3>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={newSlot.date}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  required
                  value={newSlot.time}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddSlot(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {selectedConsultation && (
        <PrescriptionModal
          consultation={selectedConsultation}
          doctor={doctor}
          onClose={() => setSelectedConsultation(null)}
          onSave={() => {
            setSelectedConsultation(null);
            loadConsultations();
          }}
        />
      )}
    </div>
  );
};

// Prescription Modal Component
const PrescriptionModal: React.FC<{
  consultation: Consultation;
  doctor: Doctor;
  onClose: () => void;
  onSave: () => void;
}> = ({ consultation, doctor, onClose, onSave }) => {
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '', quantity: 1 }
  ]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const addMedicine = () => {
    setMedicines(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '', quantity: 1 }]);
  };

  const updateMedicine = (index: number, field: string, value: string | number) => {
    setMedicines(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const prescriptionData = {
        doctorId: doctor.id,
        patientId: consultation.patientId,
        consultationId: consultation.id,
        medicines: medicines.map(med => ({ ...med, id: `med${Date.now()}${Math.random()}` })),
        instructions,
        date: new Date().toISOString().split('T')[0]
      };
      
      await api.addPrescription(consultation.id, prescriptionData);
      onSave();
    } catch (error) {
      console.error('Failed to save prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-6">Create Prescription</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h4 className="text-lg font-medium mb-4">Medicines</h4>
            {medicines.map((medicine, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={medicine.name}
                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Paracetamol"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    value={medicine.dosage}
                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    required
                    value={medicine.frequency}
                    onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Four times daily">Four times daily</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={medicine.duration}
                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 7 days"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={medicine.quantity}
                    onChange={(e) => updateMedicine(index, 'quantity', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addMedicine}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Another Medicine
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional instructions for the patient..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Save Prescription
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};