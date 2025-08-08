import { useMedicationStore } from '../store/medicationStore';
import type { Medication } from '../types';

export function MedicationList() {
  const { medications, deleteMedication } = useMedicationStore();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this medication?')) {
      deleteMedication(id);
    }
  };

  if (medications.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Medications</h2>
        <p className="text-gray-500 text-center py-8">No medications added yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Medications</h2>
      <div className="space-y-4">
        {medications.map((medication) => (
          <MedicationCard key={medication.id} medication={medication} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

interface MedicationCardProps {
  medication: Medication;
  onDelete: (id: string) => void;
}

function MedicationCard({ medication, onDelete }: MedicationCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{medication.name}</h3>
          <p className="text-gray-600">
            {medication.dosage} {medication.unit} - {medication.totalPills} pills remaining
          </p>
          {medication.splitDosages.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Split Dosages:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {medication.splitDosages.map((split) => (
                  <span
                    key={split.id}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {split.splitDosage} {medication.unit} ({split.quantity})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(medication.id)}
          className="text-red-500 hover:text-red-700 ml-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
} 