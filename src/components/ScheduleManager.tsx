import { useState } from 'react';
import { useMedicationStore } from '../store/medicationStore';

export function ScheduleManager() {
  const { medications, schedules, addSchedule, deleteSchedule } = useMedicationStore();
  const [selectedMedication, setSelectedMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'twice-daily' | 'weekly' | 'custom'>('daily');
  const [timeOfDay, setTimeOfDay] = useState<string[]>(['09:00']);
  const [startDate, setStartDate] = useState('');

  const handleAddSchedule = () => {
    if (!selectedMedication || !dosage || !startDate) return;

    addSchedule({
      medicationId: selectedMedication,
      dosage: parseFloat(dosage),
      frequency,
      timeOfDay,
      startDate: new Date(startDate),
      isActive: true,
    });

    // Reset form
    setSelectedMedication('');
    setDosage('');
    setTimeOfDay(['09:00']);
    setStartDate('');
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      deleteSchedule(id);
    }
  };

  const addTimeSlot = () => {
    setTimeOfDay([...timeOfDay, '09:00']);
  };

  const removeTimeSlot = (index: number) => {
    if (timeOfDay.length > 1) {
      setTimeOfDay(timeOfDay.filter((_, i) => i !== index));
    }
  };

  const updateTimeSlot = (index: number, time: string) => {
    const newTimeOfDay = [...timeOfDay];
    newTimeOfDay[index] = time;
    setTimeOfDay(newTimeOfDay);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Medication Schedules</h2>
      
      <div className="space-y-6">
        {/* Add Schedule Form */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Add New Schedule</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="schedule-medication" className="block text-sm font-medium text-gray-700 mb-1">
                Medication
              </label>
              <select
                id="schedule-medication"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="schedule-dosage" className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </label>
                <input
                  type="number"
                  id="schedule-dosage"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                  required
                />
              </div>

              <div>
                <label htmlFor="schedule-frequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  id="schedule-frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="twice-daily">Twice Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time of Day
              </label>
              <div className="space-y-2">
                {timeOfDay.map((time, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => updateTimeSlot(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {timeOfDay.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="px-3 py-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  + Add Time Slot
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="schedule-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="schedule-start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              onClick={handleAddSchedule}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Schedule
            </button>
          </div>
        </div>

        {/* Schedules List */}
        <div>
          <h3 className="text-lg font-medium mb-4">Current Schedules</h3>
          {schedules.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No schedules created yet.</p>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => {
                const medication = medications.find((med) => med.id === schedule.medicationId);
                return (
                  <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {medication?.name || 'Unknown Medication'}
                        </h4>
                        <p className="text-gray-600">
                          {schedule.dosage} {medication?.unit} - {schedule.frequency}
                        </p>
                        <p className="text-sm text-gray-500">
                          Times: {schedule.timeOfDay.join(', ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Start: {new Date(schedule.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="text-red-500 hover:text-red-700"
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 