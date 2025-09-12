import React, { useState, useEffect } from 'react';
import { Star, Clock, DollarSign, Languages, AlertTriangle, Video, Calendar } from 'lucide-react';
import { Doctor, Patient, Consultation, TimeSlot } from '../../types';
import { api } from '../../services/api';

interface DoctorBookingProps {
  patient: Patient;
  onBookingComplete: (consultation: Consultation) => void;
}

export const DoctorBooking: React.FC<DoctorBookingProps> = ({ patient, onBookingComplete }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isCritical, setIsCritical] = useState(false);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await api.getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookConsultation = async () => {
    if (!selectedDoctor || !selectedSlot) return;

    setBooking(true);
    try {
      const consultation = await api.bookConsultation(selectedDoctor.id, selectedSlot.id, isCritical);
      onBookingComplete(consultation);
    } catch (error) {
      console.error('Failed to book consultation:', error);
    } finally {
      setBooking(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(filter.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedDoctor && selectedSlot) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Booking</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctor Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              <img
                src={selectedDoctor.avatar || 'https://images.pexels.com/photos/612608/pexels-photo-612608.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
                alt={selectedDoctor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">{selectedDoctor.name}</h3>
                <p className="text-gray-600">{selectedDoctor.specialty}</p>
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{selectedDoctor.rating}</span>
                  <span className="text-sm text-gray-600 ml-2">({selectedDoctor.experience} years exp.)</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Consultation Details</h4>
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{selectedSlot.date} at {selectedSlot.time}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>${selectedDoctor.price}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Video className="w-4 h-4 mr-2" />
                  <span>Video Consultation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isCritical}
                  onChange={(e) => setIsCritical(e.target.checked)}
                  className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">
                  This is a critical/urgent consultation
                </span>
              </label>
              {isCritical && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-800 text-sm">
                      Critical consultations will be prioritized and may incur additional charges.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What to expect:</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• You'll receive a video call link after booking</li>
                <li>• The doctor will join at the scheduled time</li>
                <li>• Consultation typically lasts 15-30 minutes</li>
                <li>• Digital prescription will be provided if needed</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setSelectedDoctor(null);
                  setSelectedSlot(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Doctors
              </button>
              <button
                onClick={handleBookConsultation}
                disabled={booking}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {booking ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Book Consultation - $${selectedDoctor.price}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedDoctor) {
    const availableSlots = selectedDoctor.slots.filter(slot => slot.available);
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <button
          onClick={() => setSelectedDoctor(null)}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Doctors
        </button>

        <div className="flex items-center mb-6">
          <img
            src={selectedDoctor.avatar || 'https://images.pexels.com/photos/612608/pexels-photo-612608.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
            alt={selectedDoctor.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h2>
            <p className="text-gray-600 text-lg">{selectedDoctor.specialty}</p>
            <div className="flex items-center mt-2">
              <Star className="w-5 h-5 text-yellow-400 mr-1" />
              <span className="font-medium mr-4">{selectedDoctor.rating}</span>
              <span className="text-gray-600">{selectedDoctor.experience} years experience</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold">Consultation Fee</span>
            </div>
            <p className="text-2xl font-bold text-green-600">${selectedDoctor.price}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Languages className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-semibold">Languages</span>
            </div>
            <p className="text-gray-700">{selectedDoctor.languages.join(', ')}</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Time Slots</h3>
        {availableSlots.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No available slots at the moment</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSlots.map(slot => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-gray-600 mr-2" />
                </div>
                <p className="font-medium text-gray-900">{slot.date}</p>
                <p className="text-sm text-gray-600">{slot.time}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Available Doctors</h2>
          <div className="max-w-xs">
            <input
              type="text"
              placeholder="Search doctors or specialties..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDoctors.map(doctor => {
            const availableSlots = doctor.slots.filter(slot => slot.available).length;
            
            return (
              <div
                key={doctor.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedDoctor(doctor)}
              >
                <div className="flex items-center mb-4">
                  <img
                    src={doctor.avatar || 'https://images.pexels.com/photos/612608/pexels-photo-612608.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-gray-600">{doctor.specialty}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                      <span className="text-sm text-gray-600 ml-2">({doctor.experience} years)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium">${doctor.price}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-blue-600 mr-1" />
                      <span className="text-sm font-medium">{availableSlots} slots</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {doctor.languages.slice(0, 3).map(lang => (
                      <span
                        key={lang}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                    {doctor.languages.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{doctor.languages.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={availableSlots === 0}
                >
                  {availableSlots > 0 ? 'Book Consultation' : 'No Available Slots'}
                </button>
              </div>
            );
          })}
        </div>

        {filteredDoctors.length === 0 && (
          <p className="text-gray-500 text-center py-8">No doctors found matching your search</p>
        )}
      </div>
    </div>
  );
};