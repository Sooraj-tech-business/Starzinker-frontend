import { useState, useEffect } from 'react';

export default function ShareholderManagement({ branch, onClose, onUpdateShareholders }) {
  const [shareholders, setShareholders] = useState(branch?.shareholders || []);
  const [newShareholder, setNewShareholder] = useState({
    name: '',
    quid: '',
    sharePercentage: ''
  });
  const [editingIndex, setEditingIndex] = useState(-1);
  const [errors, setErrors] = useState({});

  const validateShareholder = (shareholder) => {
    const errors = {};
    
    if (!shareholder.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!shareholder.quid.trim()) {
      errors.quid = 'QUID is required';
    }
    
    if (!shareholder.sharePercentage || shareholder.sharePercentage <= 0 || shareholder.sharePercentage > 100) {
      errors.sharePercentage = 'Share percentage must be between 1 and 100';
    }
    
    return errors;
  };

  const getTotalPercentage = () => {
    return shareholders.reduce((total, shareholder) => total + parseFloat(shareholder.sharePercentage || 0), 0);
  };

  const handleAddShareholder = () => {
    const validationErrors = validateShareholder(newShareholder);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newTotal = getTotalPercentage() + parseFloat(newShareholder.sharePercentage);
    if (newTotal > 100) {
      setErrors({ sharePercentage: 'Total share percentage cannot exceed 100%' });
      return;
    }

    setShareholders([...shareholders, { ...newShareholder, sharePercentage: parseFloat(newShareholder.sharePercentage) }]);
    setNewShareholder({ name: '', quid: '', sharePercentage: '' });
    setErrors({});
  };

  const handleEditShareholder = (index) => {
    setEditingIndex(index);
    setNewShareholder(shareholders[index]);
  };

  const handleUpdateShareholder = () => {
    const validationErrors = validateShareholder(newShareholder);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const otherShareholdersTotal = shareholders
      .filter((_, index) => index !== editingIndex)
      .reduce((total, shareholder) => total + parseFloat(shareholder.sharePercentage || 0), 0);
    
    const newTotal = otherShareholdersTotal + parseFloat(newShareholder.sharePercentage);
    if (newTotal > 100) {
      setErrors({ sharePercentage: 'Total share percentage cannot exceed 100%' });
      return;
    }

    const updatedShareholders = [...shareholders];
    updatedShareholders[editingIndex] = { ...newShareholder, sharePercentage: parseFloat(newShareholder.sharePercentage) };
    setShareholders(updatedShareholders);
    setEditingIndex(-1);
    setNewShareholder({ name: '', quid: '', sharePercentage: '' });
    setErrors({});
  };

  const handleDeleteShareholder = (index) => {
    if (window.confirm('Are you sure you want to delete this shareholder?')) {
      setShareholders(shareholders.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    try {
      await onUpdateShareholders(branch._id, shareholders);
      onClose();
    } catch (error) {
      console.error('Error updating shareholders:', error);
    }
  };

  const totalPercentage = getTotalPercentage();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Manage Shareholders - {branch?.name}
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

        {/* Add/Edit Shareholder Form */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="text-lg font-semibold mb-4">
            {editingIndex >= 0 ? 'Edit Shareholder' : 'Add New Shareholder'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newShareholder.name}
                onChange={(e) => setNewShareholder({ ...newShareholder, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Shareholder name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">QUID</label>
              <input
                type="text"
                value={newShareholder.quid}
                onChange={(e) => setNewShareholder({ ...newShareholder, quid: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.quid ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="QUID number"
              />
              {errors.quid && <p className="text-red-500 text-xs mt-1">{errors.quid}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Share Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={newShareholder.sharePercentage}
                onChange={(e) => setNewShareholder({ ...newShareholder, sharePercentage: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.sharePercentage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.sharePercentage && <p className="text-red-500 text-xs mt-1">{errors.sharePercentage}</p>}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Total Percentage: <span className={`font-semibold ${totalPercentage > 100 ? 'text-red-600' : 'text-green-600'}`}>
                {totalPercentage.toFixed(2)}%
              </span>
              {totalPercentage > 100 && <span className="text-red-600 ml-2">⚠️ Exceeds 100%</span>}
            </div>
            
            <div className="flex space-x-2">
              {editingIndex >= 0 && (
                <button
                  onClick={() => {
                    setEditingIndex(-1);
                    setNewShareholder({ name: '', quid: '', sharePercentage: '' });
                    setErrors({});
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={editingIndex >= 0 ? handleUpdateShareholder : handleAddShareholder}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                {editingIndex >= 0 ? 'Update' : 'Add'} Shareholder
              </button>
            </div>
          </div>
        </div>

        {/* Shareholders List */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4">Current Shareholders</h4>
          
          {shareholders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No shareholders added yet
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
                      QUID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Share Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shareholders.map((shareholder, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{shareholder.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shareholder.quid}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shareholder.sharePercentage}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditShareholder(index)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteShareholder(index)}
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
            disabled={totalPercentage > 100}
            className={`px-4 py-2 rounded-md text-white ${
              totalPercentage > 100
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}