export type MedicineCategory = 
  | 'Antibiotics'
  | 'Analgesics'
  | 'Cardiovascular'
  | 'Pediatrics'
  | 'Supplements'
  | 'Respiratory';

export type PrescriptionStatus = 'dispensed' | 'ready' | 'pending' | 'review';

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  category: MedicineCategory;
  form: 'Capsules' | 'Tablets' | 'Syrup' | 'Suspension' | 'Inhaler';
  dosage: string;
  stock: number;
  minStock: number;
  unitPrice: number;
  expiryDate: string; // YYYY-MM-DD
  batchNumber: string;
  colorTheme: string;
  imageAlt: string;
}

export interface Prescription {
  id: string;
  rxNumber: string;
  patientName: string;
  age: number;
  doctorName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribedTime: string;
  status: PrescriptionStatus;
  amount: number;
  priority: 'normal' | 'urgent';
  notes?: string;
}

export interface PharmacyMetrics {
  dailyRevenue: number;
  activePrescriptions: number;
  inStockItems: number;
  lowStockItems: number;
  expiringItems: number;
  dispensedToday: number;
  periodSales: number;
  monthlyExpenses: number;
}
