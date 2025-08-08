import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { MedicationForm } from './components/MedicationForm';
import { MedicationList } from './components/MedicationList';
import { PillSplitter } from './components/PillSplitter';
import { ScheduleManager } from './components/ScheduleManager';
import { CanvasVisualizer } from './components/CanvasVisualizer';

type Tab = 'visualizer' | 'dashboard' | 'medications' | 'splitter' | 'schedules';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('visualizer');

  const tabs = [
    { id: 'visualizer' as Tab, name: 'Visualizer', icon: '🧪' },
    { id: 'dashboard' as Tab, name: 'Dashboard', icon: '📊' },
    { id: 'medications' as Tab, name: 'Medications', icon: '💊' },
    { id: 'splitter' as Tab, name: 'Pill Splitter', icon: '✂️' },
    { id: 'schedules' as Tab, name: 'Schedules', icon: '⏰' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'visualizer':
        return <CanvasVisualizer />;
      case 'dashboard':
        return <Dashboard />;
      case 'medications':
        return (
          <div className="space-y-6">
            <MedicationForm />
            <MedicationList />
          </div>
        );
      case 'splitter':
        return <PillSplitter />;
      case 'schedules':
        return <ScheduleManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Pill Splitter Challenge
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Live long and prosper 🖖
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
