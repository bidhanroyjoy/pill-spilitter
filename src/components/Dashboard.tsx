import { useMedicationStore } from '../store/medicationStore';

export function Dashboard() {
  const { medications, pillSplits, schedules } = useMedicationStore();

  const totalMedications = medications.length;
  const totalSplits = pillSplits.length;
  const activeSchedules = schedules.filter((schedule) => schedule.isActive).length;
  const totalPills = medications.reduce((sum, med) => sum + med.totalPills, 0);

  const recentSplits = pillSplits.slice(-5).reverse();
  const upcomingSchedules = schedules
    .filter((schedule) => schedule.isActive)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Medications</p>
              <p className="text-2xl font-semibold text-gray-900">{totalMedications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pills</p>
              <p className="text-2xl font-semibold text-gray-900">{totalPills}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pill Splits</p>
              <p className="text-2xl font-semibold text-gray-900">{totalSplits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Schedules</p>
              <p className="text-2xl font-semibold text-gray-900">{activeSchedules}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Splits */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Pill Splits</h3>
          {recentSplits.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent splits.</p>
          ) : (
            <div className="space-y-3">
              {recentSplits.map((split) => {
                const medication = medications.find((med) => med.id === split.medicationId);
                return (
                  <div key={split.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {medication?.name || 'Unknown Medication'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Split {split.originalPill} {medication?.unit} into {split.splitPieces} pieces
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(split.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Schedules */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Upcoming Schedules</h3>
          {upcomingSchedules.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming schedules.</p>
          ) : (
            <div className="space-y-3">
              {upcomingSchedules.map((schedule) => {
                const medication = medications.find((med) => med.id === schedule.medicationId);
                return (
                  <div key={schedule.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {medication?.name || 'Unknown Medication'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {schedule.dosage} {medication?.unit} - {schedule.frequency}
                      </p>
                      <p className="text-sm text-gray-500">
                        {schedule.timeOfDay.join(', ')}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(schedule.startDate).toLocaleDateString()}
                    </span>
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