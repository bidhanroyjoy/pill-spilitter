import { useState } from 'react';
import { useMedicationStore } from '../store/medicationStore';

export function PillSplitter() {
  const { medications, addSplitDosage, addPillSplit } = useMedicationStore();
  const [selectedMedication, setSelectedMedication] = useState('');
  const [splitPieces, setSplitPieces] = useState(2);
  const [splitDosage, setSplitDosage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const selectedMed = medications.find((med) => med.id === selectedMedication);

  const handleSplit = () => {
    if (!selectedMed || !splitDosage) return;

    const splitDosageValue = parseFloat(splitDosage);
    const originalDosage = selectedMed.dosage;

    // Add split dosage to medication
    addSplitDosage(selectedMed.id, {
      originalDosage,
      splitDosage: splitDosageValue,
      quantity: parseInt(quantity.toString()),
    });

    // Record the pill split
    addPillSplit({
      medicationId: selectedMed.id,
      originalPill: originalDosage,
      splitPieces: parseInt(splitPieces.toString()),
      resultingDosages: Array(parseInt(splitPieces.toString())).fill(splitDosageValue),
    });

    // Reset form
    setSplitDosage('');
    setQuantity(1);
  };

  const calculateSplitDosage = () => {
    if (!selectedMed || splitPieces < 2) return 0;
    return selectedMed.dosage / splitPieces;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Pill Splitter</h2>
      
      {medications.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No medications available. Please add a medication first.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">
              Select Medication
            </label>
            <select
              id="medication"
              value={selectedMedication}
              onChange={(e) => setSelectedMedication(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a medication</option>
              {medications.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name} ({med.dosage} {med.unit})
                </option>
              ))}
            </select>
          </div>

          {selectedMed && (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Selected Medication</h3>
                <p className="text-blue-800">
                  {selectedMed.name} - {selectedMed.dosage} {selectedMed.unit} per pill
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="splitPieces" className="block text-sm font-medium text-gray-700 mb-1">
                    Split into pieces
                  </label>
                  <input
                    type="number"
                    id="splitPieces"
                    value={splitPieces}
                    onChange={(e) => setSplitPieces(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="2"
                    max="8"
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity to split
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max={selectedMed.totalPills}
                  />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Split Result</h3>
                <p className="text-green-800">
                  Each piece will be: {calculateSplitDosage().toFixed(2)} {selectedMed.unit}
                </p>
              </div>

              <div>
                <label htmlFor="splitDosage" className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Split Dosage (optional)
                </label>
                <input
                  type="number"
                  id="splitDosage"
                  value={splitDosage}
                  onChange={(e) => setSplitDosage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`${calculateSplitDosage().toFixed(2)}`}
                  step="0.1"
                />
              </div>

              <button
                onClick={handleSplit}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Split Pill
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
} 