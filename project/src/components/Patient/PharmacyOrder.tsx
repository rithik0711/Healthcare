import React, { useState } from 'react';
import { ShoppingBag, Truck, CheckCircle, Clock, Package, MapPin } from 'lucide-react';
import { Patient, PharmacyOrder, Prescription } from '../../types';
import { api } from '../../services/api';

interface PharmacyOrderComponentProps {
  patient: Patient;
  orders: PharmacyOrder[];
  onOrderUpdate: () => void;
}

export const PharmacyOrderComponent: React.FC<PharmacyOrderComponentProps> = ({
  patient,
  orders,
  onOrderUpdate
}) => {
  const [selectedPrescription, setSelectedPrescription] = useState<string>('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderingMedicine, setOrderingMedicine] = useState(false);

  React.useEffect(() => {
    loadPrescriptions();
  }, [patient.id]);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await api.getPrescriptions(patient.id);
      setPrescriptions(data);
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderMedicine = async (prescriptionId: string) => {
    setOrderingMedicine(true);
    try {
      await api.orderMedicines(prescriptionId);
      onOrderUpdate();
      setSelectedPrescription('');
    } catch (error) {
      console.error('Failed to order medicine:', error);
    } finally {
      setOrderingMedicine(false);
    }
  };

  const getStatusIcon = (status: PharmacyOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'preparing':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: PharmacyOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-700 bg-blue-100';
      case 'preparing':
        return 'text-purple-700 bg-purple-100';
      case 'out_for_delivery':
        return 'text-orange-700 bg-orange-100';
      case 'delivered':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getProgressPercentage = (status: PharmacyOrder['status']) => {
    switch (status) {
      case 'pending':
        return 20;
      case 'confirmed':
        return 40;
      case 'preparing':
        return 60;
      case 'out_for_delivery':
        return 80;
      case 'delivered':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* New Order Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Medicine from Prescription</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No prescriptions available to order from</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a prescription to order from:
              </label>
              <select
                value={selectedPrescription}
                onChange={(e) => setSelectedPrescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a prescription...</option>
                {prescriptions.map(prescription => (
                  <option key={prescription.id} value={prescription.id}>
                    Prescription #{prescription.id.slice(-6)} - {prescription.date} ({prescription.medicines.length} medicines)
                  </option>
                ))}
              </select>
            </div>

            {selectedPrescription && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Prescription Details</h3>
                {(() => {
                  const prescription = prescriptions.find(p => p.id === selectedPrescription);
                  if (!prescription) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {prescription.medicines.map(medicine => (
                          <div key={medicine.id} className="bg-white rounded-lg p-3 border">
                            <p className="font-medium text-gray-900">{medicine.name}</p>
                            <p className="text-sm text-gray-600">
                              {medicine.dosage} • {medicine.frequency} • {medicine.duration}
                            </p>
                            <p className="text-sm text-gray-600">Quantity: {medicine.quantity}</p>
                            <p className="text-sm font-medium text-green-600 mt-1">
                              ${(medicine.quantity * 2.5).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <p className="font-semibold text-gray-900">
                          Total: ${prescription.medicines.reduce((sum, med) => sum + (med.quantity * 2.5), 0).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleOrderMedicine(selectedPrescription)}
                          disabled={orderingMedicine}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                          {orderingMedicine ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Ordering...
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              Order Medicine
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Orders */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Medicine Orders</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders yet</p>
            <p className="text-gray-400 text-sm">Order medicines from your prescriptions above</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Order #{order.id.slice(-6)}</h3>
                    <p className="text-sm text-gray-600">{order.medicines.length} item(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Order Progress</span>
                    <span className="text-sm text-gray-600">{getProgressPercentage(order.status)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(order.status)}%` }}
                    />
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className={`flex items-center ${order.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                      <div className={`w-3 h-3 rounded-full mr-2 ${order.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                      Order Placed
                    </div>
                    <div className={`flex items-center ${['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-3 h-3 rounded-full mr-2 ${['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      Confirmed
                    </div>
                    <div className={`flex items-center ${['preparing', 'out_for_delivery', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-3 h-3 rounded-full mr-2 ${['preparing', 'out_for_delivery', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      Preparing
                    </div>
                    <div className={`flex items-center ${['out_for_delivery', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-3 h-3 rounded-full mr-2 ${['out_for_delivery', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      Shipped
                    </div>
                    <div className={`flex items-center ${order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-3 h-3 rounded-full mr-2 ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      Delivered
                    </div>
                  </div>
                </div>

                {/* Medicines List */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Medicines</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {order.medicines.map(medicine => (
                      <div key={medicine.id} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-gray-900">{medicine.name}</p>
                        <p className="text-sm text-gray-600">
                          {medicine.dosage} • Qty: {medicine.quantity}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          ${(medicine.quantity * 2.5).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Delivery Information</span>
                  </div>
                  <p className="text-blue-800 text-sm">
                    Estimated delivery: {order.estimatedDelivery}
                  </p>
                  <p className="text-blue-800 text-sm">
                    Delivery address: 123 Main St, City, State 12345 (Demo Address)
                  </p>
                </div>

                {/* Mock Update Buttons for Demo */}
                {order.status !== 'delivered' && (
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        const nextStatus = {
                          pending: 'confirmed',
                          confirmed: 'preparing',
                          preparing: 'out_for_delivery',
                          out_for_delivery: 'delivered'
                        }[order.status] as PharmacyOrder['status'];
                        
                        api.updateOrderStatus(order.id, nextStatus).then(onOrderUpdate);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Mock: Update Status
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};