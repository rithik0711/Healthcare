import { Prescription, PharmacyOrder } from '../types';

export class OfflineStorage {
  private readonly PRESCRIPTIONS_KEY = 'telemedicine_prescriptions';
  private readonly ORDERS_KEY = 'telemedicine_orders';
  private readonly LAST_SYNC_KEY = 'telemedicine_last_sync';

  storePrescriptions(prescriptions: Prescription[]): void {
    try {
      localStorage.setItem(this.PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));
      localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Failed to store prescriptions offline:', error);
    }
  }

  getPrescriptions(): Prescription[] {
    try {
      const stored = localStorage.getItem(this.PRESCRIPTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve prescriptions from offline storage:', error);
      return [];
    }
  }

  storeOrders(orders: PharmacyOrder[]): void {
    try {
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Failed to store orders offline:', error);
    }
  }

  getOrders(): PharmacyOrder[] {
    try {
      const stored = localStorage.getItem(this.ORDERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve orders from offline storage:', error);
      return [];
    }
  }

  getLastSyncDate(): Date | null {
    try {
      const stored = localStorage.getItem(this.LAST_SYNC_KEY);
      return stored ? new Date(stored) : null;
    } catch (error) {
      console.error('Failed to retrieve last sync date:', error);
      return null;
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}

export const offlineStorage = new OfflineStorage();