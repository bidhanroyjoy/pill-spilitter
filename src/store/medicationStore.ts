import { create } from 'zustand';
import type { Medication, SplitDosage, PillSplit, MedicationSchedule } from '../types';

interface MedicationState {
  medications: Medication[];
  pillSplits: PillSplit[];
  schedules: MedicationSchedule[];
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  addSplitDosage: (medicationId: string, splitDosage: Omit<SplitDosage, 'id'>) => void;
  removeSplitDosage: (medicationId: string, splitDosageId: string) => void;
  addPillSplit: (pillSplit: Omit<PillSplit, 'id' | 'createdAt'>) => void;
  addSchedule: (schedule: Omit<MedicationSchedule, 'id'>) => void;
  updateSchedule: (id: string, updates: Partial<MedicationSchedule>) => void;
  deleteSchedule: (id: string) => void;
}

export const useMedicationStore = create<MedicationState>((set) => ({
  medications: [],
  pillSplits: [],
  schedules: [],

  addMedication: (medication) => set((state) => ({
    medications: [...state.medications, {
      ...medication,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }],
  })),

  updateMedication: (id, updates) => set((state) => ({
    medications: state.medications.map((med) =>
      med.id === id ? { ...med, ...updates, updatedAt: new Date() } : med
    ),
  })),

  deleteMedication: (id) => set((state) => ({
    medications: state.medications.filter((med) => med.id !== id),
    schedules: state.schedules.filter((schedule) => schedule.medicationId !== id),
  })),

  addSplitDosage: (medicationId, splitDosage) => set((state) => ({
    medications: state.medications.map((med) =>
      med.id === medicationId
        ? {
            ...med,
            splitDosages: [...med.splitDosages, { ...splitDosage, id: crypto.randomUUID() }],
            updatedAt: new Date(),
          }
        : med
    ),
  })),

  removeSplitDosage: (medicationId, splitDosageId) => set((state) => ({
    medications: state.medications.map((med) =>
      med.id === medicationId
        ? {
            ...med,
            splitDosages: med.splitDosages.filter((split) => split.id !== splitDosageId),
            updatedAt: new Date(),
          }
        : med
    ),
  })),

  addPillSplit: (pillSplit) => set((state) => ({
    pillSplits: [...state.pillSplits, {
      ...pillSplit,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }],
  })),

  addSchedule: (schedule) => set((state) => ({
    schedules: [...state.schedules, {
      ...schedule,
      id: crypto.randomUUID(),
    }],
  })),

  updateSchedule: (id, updates) => set((state) => ({
    schedules: state.schedules.map((schedule) =>
      schedule.id === id ? { ...schedule, ...updates } : schedule
    ),
  })),

  deleteSchedule: (id) => set((state) => ({
    schedules: state.schedules.filter((schedule) => schedule.id !== id),
  })),
})); 