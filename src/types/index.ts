export interface Medication {
  id: string;
  name: string;
  dosage: number;
  unit: string;
  totalPills: number;
  splitDosages: SplitDosage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SplitDosage {
  id: string;
  originalDosage: number;
  splitDosage: number;
  quantity: number;
  description?: string;
}

export interface PillSplit {
  id: string;
  medicationId: string;
  originalPill: number;
  splitPieces: number;
  resultingDosages: number[];
  createdAt: Date;
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  dosage: number;
  frequency: 'daily' | 'twice-daily' | 'weekly' | 'custom';
  timeOfDay: string[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
} 