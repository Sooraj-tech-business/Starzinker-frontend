import { useState ,useEffect} from 'react';

// Utility function to get business date with 6-hour grace period
const getBusinessDate = () => {
  const now = new Date();
  // Subtract 6 hours to get the effective business time
  const businessTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
  return businessTime.toISOString().split('T')[0];
};

export default function AddDailyExpenditure({ onClose, onAddExpenditure, onSaveDraft, branches, currentUser, isManagerMode, existingDraft }) {
  const [formData, setFormData] = useState({
    branchId: isManagerMode ? branches[0]?._id || '' : '',
    branchName: isManagerMode ? branches[0]?.name || '' : '',
    date: getBusinessDate(),
    income: '',
    onlineDeliveries: [
      { platform: 'Talabat', amount: '', description: '' },
      { platform: 'Snoonu', amount: '', description: '' },
      { platform: 'Keeta', amount: '', description: '' },
      { platform: 'ATM', amount: '', description: '' }
    ],
    deliveryMoney: '',
    expenses: [{ category: '', amount: '', type: 'NORMAL EXPENSE', description: '' }],
    submittedBy: isManagerMode ? currentUser?.name || '' : '',
    notes: ''
  });

  // Load existing draft data
  useEffect(() => {
    if (existingDraft && isManagerMode) {
      setFormData({
        ...existingDraft,
        expenses: existingDraft.expenses?.length > 0 ? existingDraft.expenses : [{ category: '', amount: '', type: 'NORMAL EXPENSE', description: '' }],
        onlineDeliveries: existingDraft.onlineDeliveries?.length > 0 ? existingDraft.onlineDeliveries : [
          { platform: 'Talabat', amount: '', description: '' },
          { platform: 'Snoonu', amount: '', description: '' },
          { platform: 'Keeta', amount: '', description: '' },
          { platform: 'ATM', amount: '', description: '' }
        ],
        deliveryMoney: existingDraft.deliveryMoney || ''
      });
    }
  }, [existingDraft, isManagerMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'branchId') {
      const selectedBranch = branches.find(b => b._id === value);
      setFormData({ 
        ...formData, 
        branchId: value,
        branchName: selectedBranch ? selectedBranch.name : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleExpenseChange = (index, field, value) => {
    const updatedExpenses = [...formData.expenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };
    setFormData({ ...formData, expenses: updatedExpenses });
  };

  const addExpenseItem = () => {
    setFormData({
      ...formData,
      expenses: [...formData.expenses, { category: '', amount: '', type: 'NORMAL EXPENSE', description: '' }]
    });
  };

  const removeExpenseItem = (index) => {
    const updatedExpenses = formData.expenses.filter((_, i) => i !== index);
    setFormData({ ...formData, expenses: updatedExpenses });
  };

  const handleDeliveryChange = (index, field, value) => {
    const updatedDeliveries = [...formData.onlineDeliveries];
    updatedDeliveries[index] = { ...updatedDeliveries[index], [field]: value };
    setFormData({ ...formData, onlineDeliveries: updatedDeliveries });
  };

  const addDeliveryItem = () => {
    setFormData({
      ...formData,
      onlineDeliveries: [...formData.onlineDeliveries, { platform: '', amount: '', description: '' }]
    });
  };

  const removeDeliveryItem = (index) => {
    const updatedDeliveries = formData.onlineDeliveries.filter((_, i) => i !== index);
    setFormData({ ...formData, onlineDeliveries: updatedDeliveries });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const expenditureData = {
      ...formData,
      income: parseFloat(formData.income) || 0,
      expenses: formData.expenses.map(exp => ({
        ...exp,
        amount: parseFloat(exp.amount) || 0,
        type: exp.type || 'NORMAL EXPENSE'
      })),
      onlineDeliveries: formData.onlineDeliveries.map(del => ({
        ...del,
        amount: parseFloat(del.amount) || 0
      })),

      deliveryMoney: parseFloat(formData.deliveryMoney) || 0
    };
    
    console.log('Final expenditure data:', JSON.stringify(expenditureData, null, 2));
    console.log('Expenses with types:', expenditureData.expenses);
    
    await onAddExpenditure(expenditureData);
    onClose();
  };

  const totalExpenses = formData.expenses.reduce((total, exp) => total + (parseFloat(exp.amount) || 0), 0);
  const totalOnlineDelivery = formData.onlineDeliveries.reduce((total, del) => total + (parseFloat(del.amount) || 0), 0);
  const totalDeliveryMoney = parseFloat(formData.deliveryMoney) || 0;
  const earnings = (parseFloat(formData.income) || 0) - totalExpenses;

  return (
    <div className="bg-white p-6 rounded-lg max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Add Daily Expenditure</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!isManagerMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch*</label>
              <select
                name="branchId"
                required
                value={formData.branchId}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
              >
                <option value="">Select Branch</option>
                {branches?.map(branch => (
                  <option key={branch._id} value={branch._id}>{branch.name}</option>
                ))}
              </select>
            </div>
          )}
          
          {isManagerMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch</label>
              <input
                type="text"
                value={formData.branchName}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-600 sm:text-sm"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              disabled={isManagerMode}
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm ${isManagerMode ? 'bg-gray-100 text-gray-600' : ''}`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Income (QR)*</label>
            <input
              type="number"
              name="income"
              required
              step="0.01"
              value={formData.income}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Submitted By</label>
            <input
              type="text"
              name="submittedBy"
              required
              value={formData.submittedBy}
              onChange={handleChange}
              disabled={isManagerMode}
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm ${isManagerMode ? 'bg-gray-100 text-gray-600' : ''}`}
            />
          </div>
        </div>

        {/* Online Delivery Income */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Online Delivery Income</h3>
          </div>
          
          <div className="space-y-4">
            {formData.onlineDeliveries.map((delivery, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Platform*</label>
                  <input
                    type="text"
                    value={delivery.platform}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-700 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (QR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={delivery.amount}
                    onChange={(e) => handleDeliveryChange(index, 'amount', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter amount if applicable"
                  />
                </div>
{/*                 
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={delivery.description}
                    onChange={(e) => handleDeliveryChange(index, 'description', e.target.value)}
                    placeholder="e.g., Daily delivery earnings"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div> */}
                

              </div>
            ))}
          </div>
        </div>



        {/* Delivery Money */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Money</h3>
          <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
            <label className="block text-sm font-medium text-gray-700">Total Delivery Money (QR)</label>
            <input
              type="number"
              name="deliveryMoney"
              step="0.01"
              value={formData.deliveryMoney}
              onChange={handleChange}
              placeholder="Enter total delivery money"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Expenses */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Expenses</h3>
          </div>
          
          <div className="space-y-4">
            {formData.expenses.map((expense, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category*</label>
                  <input
                    type="text"
                    value={expense.category}
                    onChange={(e) => handleExpenseChange(index, 'category', e.target.value)}
                    placeholder="e.g., Vegetables, Petrol, Meat"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (QR)*</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expense.amount}
                    onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type*</label>
                  <select
                    value={expense.type || 'NORMAL EXPENSE'}
                    onChange={(e) => handleExpenseChange(index, 'type', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
                    required
                  >
                    <option value="NORMAL EXPENSE">NORMAL EXPENSE</option>
                    <option value="GENERAL EXPENSE">GENERAL EXPENSE</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={expense.description}
                    onChange={(e) => handleExpenseChange(index, 'description', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeExpenseItem(index)}
                    disabled={formData.expenses.length === 1}
                    className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              onClick={addExpenseItem}
              className="px-3 py-1 bg-red-800 text-white text-sm rounded hover:bg-red-900"
            >
              Add Expense
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{parseFloat(formData.income) || 0} QR</div>
              <div className="text-sm text-gray-600">Income</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalOnlineDelivery.toFixed(2)} QR</div>
              <div className="text-sm text-gray-600">Online Delivery</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{totalDeliveryMoney.toFixed(2)} QR</div>
              <div className="text-sm text-gray-600">Delivery Money</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{totalExpenses.toFixed(2)} QR</div>
              <div className="text-sm text-gray-600">Total Expenses</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${earnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {earnings.toFixed(2)} QR
              </div>
              <div className="text-sm text-gray-600">Earnings</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
          />
        </div>

        <div className="flex justify-end pt-6 border-t space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          {isManagerMode && onSaveDraft && (
            <button
              type="button"
              onClick={() => {
                const expenditureData = {
                  ...formData,
                  income: parseFloat(formData.income) || 0,
                  expenses: formData.expenses.map(exp => ({
                    ...exp,
                    amount: parseFloat(exp.amount) || 0
                  })),
                  onlineDeliveries: formData.onlineDeliveries.map(del => ({
                    ...del,
                    amount: parseFloat(del.amount) || 0
                  })),
                  deliveryMoney: parseFloat(formData.deliveryMoney) || 0
                };
                onSaveDraft(expenditureData);
              }}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
            >
              Save Draft
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-800 hover:bg-red-900"
          >
            {isManagerMode ? 'Submit Final' : 'Submit Expenditure'}
          </button>
        </div>
      </form>
    </div>
  );
}