import { useState, useEffect } from 'react';
import api from '../api/config';

export default function MonthlySavingsManagement({ branch, month, year, onClose }) {
  const [savings, setSavings] = useState([]);
  const [newSaving, setNewSaving] = useState({
    name: '',
    amount: '',
    description: ''
  });
  const [editingIndex, setEditingIndex] = useState(-1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlySavings();
  }, [branch, month, year]);

  const fetchMonthlySavings = async () => {
    try {
      const response = await api.get(`/api/monthly-savings/${branch._id}/${month}/${year}`);
      setSavings(response.data.savings || []);
    } catch (error) {
      console.error('Error fetching monthly savings:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateSaving = (saving) => {
    const errors = {};
    
    if (!saving.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!saving.amount || saving.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    
    return errors;
  };

  const handleAddSaving = () => {
    const validationErrors = validateSaving(newSaving);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSavings([...savings, { ...newSaving, amount: parseFloat(newSaving.amount) }]);
    setNewSaving({ name: '', amount: '', description: '' });
    setErrors({});
  };

  const handleEditSaving = (index) => {
    setEditingIndex(index);
    setNewSaving(savings[index]);
  };

  const handleUpdateSaving = () => {
    const validationErrors = validateSaving(newSaving);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const updatedSavings = [...savings];
    updatedSavings[editingIndex] = { ...newSaving, amount: parseFloat(newSaving.amount) };
    setSavings(updatedSavings);
    setEditingIndex(-1);
    setNewSaving({ name: '', amount: '', description: '' });
    setErrors({});
  };

  const handleDeleteSaving = (index) => {
    if (window.confirm('Are you sure you want to delete this saving?')) {
      setSavings(savings.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/monthly-savings/${branch._id}/${month}/${year}`, { savings });
      alert('Monthly savings updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating monthly savings:', error);
      alert('Failed to update monthly savings');
    }
  };

  const totalSavings = savings.reduce((total, saving) => total + parseFloat(saving.amount || 0), 0);
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Monthly Savings - {branch?.name}
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

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">
            Managing savings for {monthNames[month]} {year}
          </p>
        </div>

        {/* Add/Edit Saving Form */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="text-lg font-semibold mb-4">
            {editingIndex >= 0 ? 'Edit Saving' : 'Add New Saving'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newSaving.name}
                onChange={(e) => setNewSaving({ ...newSaving, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Kuri Chitti, Fixed Deposit"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (QR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newSaving.amount}
                onChange={(e) => setNewSaving({ ...newSaving, amount: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newSaving.description}
                onChange={(e) => setNewSaving({ ...newSaving, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Optional description"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Total Savings: <span className="font-semibold text-green-600">{totalSavings.toFixed(2)} QR</span>
            </div>
            
            <div className="flex space-x-2">
              {editingIndex >= 0 && (
                <button
                  onClick={() => {
                    setEditingIndex(-1);
                    setNewSaving({ name: '', amount: '', description: '' });
                    setErrors({});
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={editingIndex >= 0 ? handleUpdateSaving : handleAddSaving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                {editingIndex >= 0 ? 'Update' : 'Add'} Saving
              </button>
            </div>
          </div>
        </div>

        {/* Savings List */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4">Current Savings</h4>
          
          {savings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No savings added for {monthNames[month]} {year}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount (QR)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {savings.map((saving, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{saving.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{saving.amount.toFixed(2)} QR</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{saving.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditSaving(index)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSaving(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Buttons */}
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
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}