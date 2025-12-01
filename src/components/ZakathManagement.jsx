import { useState } from 'react';

export default function ZakathManagement({ branch, onClose, onUpdateZakath }) {
  const [zakathPercentage, setZakathPercentage] = useState(branch?.zakathPercentage || 0);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (zakathPercentage < 0 || zakathPercentage > 100) {
      setError('Zakath percentage must be between 0 and 100');
      return;
    }

    try {
      await onUpdateZakath(branch._id, parseFloat(zakathPercentage));
      onClose();
    } catch (error) {
      console.error('Error updating zakath:', error);
      setError('Failed to update zakath percentage');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Manage Zakath - {branch?.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zakath Percentage
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={zakathPercentage}
            onChange={(e) => setZakathPercentage(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}