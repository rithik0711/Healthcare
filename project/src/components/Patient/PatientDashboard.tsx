import React, { useState, useEffect } from 'react';
import { Calendar, FileText, ShoppingBag, Stethoscope, Brain, Wifi, WifiOff } from 'lucide-react';
import { Patient, Doctor, Consultation, Prescription, PharmacyOrder } from '../../types';
import { api } from '../../services/api';
import { offlineStorage } from '../../utils/offline';
import { SymptomChecker } from './SymptomChecker';
import { DoctorBooking } from './DoctorBooking';
import { PharmacyOrderComponent } from './PharmacyOrder';

interface PatientDashboardProps {
  patient: Patient;
}

type ActiveTab = 'dashboard' | 'symptom-checker' | 'book-doctor' | 'prescriptions' | 'orders';

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyOrder[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadData();
    
    // Setup online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [patient.id]);

  const loadData = async () => {
    try {
      if (isOnline) {
        const [consultationsData, prescriptionsData, ordersData] = await Promise.all([
          api.getConsultations(patient.id, 'patient'),
          api.getPrescriptions(patient.id),
          api.getPharmacyOrders(patient.id)
        ]);
        
        setConsultations(consultationsData);
        setPrescriptions(prescriptionsData);
        setPharmacyOrders(ordersData);
        
        // Store offline
        offlineStorage.storePrescriptions(prescriptionsData);
        offlineStorage.storeOrders(ordersData);
      } else {
        // Load from offline storage
        const offlinePrescriptions = offlineStorage.getPrescriptions();
        const offlineOrders = offlineStorage.getOrders();
        setPrescriptions(offlinePrescriptions);
        setPharmacyOrders(offlineOrders);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Fallback to offline data
      const offlinePrescriptions = offlineStorage.getPrescriptions();
      const offlineOrders = offlineStorage.getOrders();
      setPrescriptions(offlinePrescriptions);
      setPharmacyOrders(offlineOrders);
    }
  };

  const handleBookingComplete = async (consultation: Consultation) => {
    setConsultations(prev => [...prev, consultation]);
    setActiveTab('dashboard');
    await loadData();
  };

  const upcomingConsultations = consultations.filter(c => c.status === 'scheduled');
  const recentPrescriptions = prescriptions.slice(0, 3);
  const activeOrders = pharmacyOrders.filter(o => o.status !== 'delivered');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'symptom-checker':
        return <SymptomChecker onComplete={() => setActiveTab('book-doctor')} />;
      case 'book-doctor':
        return <DoctorBooking patient={patient} onBookingComplete={handleBookingComplete} />;
      case 'prescriptions':
        return <PrescriptionsView prescriptions={prescriptions} onOrderMedicine={(prescriptionId) => {
          setActiveTab('orders');
        }} />;
      case 'orders':
        return <PharmacyOrderComponent 
          patient={patient} 
          orders={pharmacyOrders}
          onOrderUpdate={loadData}
        />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('symptom-checker')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <Brain className="w-8 h-8 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Check Symptoms</p>
              <p className="text-sm text-gray-600">AI-powered symptom analysis</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('book-doctor')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors"
          >
            <Stethoscope className="w-8 h-8 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Book Doctor</p>
              <p className="text-sm text-gray-600">Schedule consultation</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors"
          >
            <ShoppingBag className="w-8 h-8 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Order Medicine</p>
              <p className="text-sm text-gray-600">Get medications delivered</p>
            </div>
          </button>
        </div>
      </div>

      {/* Upcoming Consultations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Consultations</h2>
        {upcomingConsultations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming consultations</p>
        ) : (
          <div className="space-y-4">
            {upcomingConsultations.map(consultation => (
              <div
                key={consultation.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    consultation.isCritical ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">Consultation</p>
                    <p className="text-sm text-gray-600">
                      {consultation.date} at {consultation.time}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.open(consultation.videoLink, '_blank')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Join Video Call
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Prescriptions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Prescriptions</h2>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        {recentPrescriptions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No prescriptions yet</p>
        ) : (
          <div className="space-y-3">
            {recentPrescriptions.map(prescription => (
              <div
                key={prescription.id}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">Prescription #{prescription.id.slice(-6)}</p>
                  <span className="text-sm text-gray-600">{prescription.date}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{prescription.medicines.length} medicine(s)</p>
                <p className="text-sm text-gray-800">{prescription.instructions}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Medicine Orders</h2>
          <div className="space-y-3">
            {activeOrders.map(order => (
              <div
                key={order.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">Order #{order.id.slice(-6)}</p>
                  <p className="text-sm text-gray-600">
                    Status: <span className="capitalize font-medium">{order.status.replace('_', ' ')}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Est. {order.estimatedDelivery}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {patient.name}</h1>
              <p className="text-gray-600">Your health dashboard</p>
            </div>
            <div className="flex items-center">
              {isOnline ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="w-5 h-5 mr-2" />
                  <span className="text-sm">Online</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="w-5 h-5 mr-2" />
                  <span className="text-sm">Offline Mode</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Calendar },
              { id: 'symptom-checker', label: 'Symptom Checker', icon: Brain },
              { id: 'book-doctor', label: 'Book Doctor', icon: Stethoscope },
              { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
              { id: 'orders', label: 'Medicine Orders', icon: ShoppingBag }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as ActiveTab)}
                className={`flex items-center py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isOnline && activeTab !== 'dashboard' && activeTab !== 'prescriptions' && activeTab !== 'orders' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <WifiOff className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800">
                You're offline. Some features may not be available. Switch to Dashboard to view cached data.
              </p>
            </div>
          </div>
        )}
        {renderTabContent()}
      </div>
    </div>
  );
};

// Prescriptions View Component
const PrescriptionsView: React.FC<{
  prescriptions: Prescription[];
  onOrderMedicine: (prescriptionId: string) => void;
}> = ({ prescriptions, onOrderMedicine }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Prescriptions</h2>
        {prescriptions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No prescriptions available</p>
        ) : (
          <div className="space-y-6">
            {prescriptions.map(prescription => (
              <div key={prescription.id} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Prescription #{prescription.id.slice(-6)}</h3>
                    <p className="text-sm text-gray-600">{prescription.date}</p>
                  </div>
                  <button
                    onClick={() => onOrderMedicine(prescription.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Order Medicine
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Medicines:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {prescription.medicines.map(medicine => (
                        <div key={medicine.id} className="bg-gray-50 rounded-lg p-3">
                          <p className="font-medium text-gray-900">{medicine.name}</p>
                          <p className="text-sm text-gray-600">
                            {medicine.dosage} • {medicine.frequency} • {medicine.duration}
                          </p>
                          <p className="text-sm text-gray-600">Quantity: {medicine.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {prescription.instructions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                      <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{prescription.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};