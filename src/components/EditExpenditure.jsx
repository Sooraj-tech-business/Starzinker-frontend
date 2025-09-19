import { useState, useEffect } from 'react';

export default function EditExpenditure({ expenditure, onClose, onUpdateExpenditure, branches }) {
  const [formData, setFormData] = useState({
    branchId: '',
    branchName: '',
    date: '',
    income: '',
    onlineDeliveries: [{ platform: '', amount: '', description: '' }],
    atmIncome: '',
    deliveryMoney: '',
    expenses: [{ category: '', amount: '', type: 'NORMAL EXPENSE', description: '' }],
    submittedBy: '',
    notes: ''
  });

  useEffect(() => {
    if (expenditure) {
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        ...expenditure,
        date: formatDate(expenditure.date),
        income: expenditure.income.toString(),
        expenses: expenditure.expenses.map(exp => ({
          ...exp,
          amount: exp.amount.toString(),
          type: exp.type || 'NORMAL EXPENSE'
        })),
        onlineDeliveries: expenditure.onlineDeliveries?.length > 0 ? expenditure.onlineDeliveries.map(del => ({
          ...del,
          amount: del.amount.toString()
        })) : [{ platform: '', amount: '', description: '' }],
        atmIncome: (expenditure.atmIncome || 0).toString(),
        deliveryMoney: (expenditure.deliveryMoney || 0).toString()
      });
    }
  }, [expenditure]);

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
    
    console.log('Form expenses before mapping:', formData.expenses);
    
    const expenditureData = {
      ...formData,
      income: parseFloat(formData.income) || 0,
      expenses: formData.expenses.map(exp => ({
        category: exp.category,
        amount: parseFloat(exp.amount) || 0,
        type: exp.type || 'NORMAL EXPENSE',
        description: exp.description || ''
      })),
      onlineDeliveries: formData.onlineDeliveries.map(del => ({
        ...del,
        amount: parseFloat(del.amount) || 0
      })),

      deliveryMoney: parseFloat(formData.deliveryMoney) || 0
    };
    
    await onUpdateExpenditure(expenditureData);
    onClose();
  };

  const totalExpenses = formData.expenses.reduce((total, exp) => total + (parseFloat(exp.amount) || 0), 0);
  const totalOnlineDelivery = formData.onlineDeliveries.reduce((total, del) => total + (parseFloat(del.amount) || 0), 0);

  const totalDeliveryMoney = parseFloat(formData.deliveryMoney) || 0;
  const earnings = (parseFloat(formData.income) || 0) - totalExpenses;

  return (
    <div className="bg-white p-6 rounded-lg max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Edit Daily Expenditure</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Date*</label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
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
            <label className="block text-sm font-medium text-gray-700">Submitted By*</label>
            <input
              type="text"
              name="submittedBy"
              required
              value={formData.submittedBy}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
            />
          </div>
        </div>

        {/* Online Delivery Income */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Online Delivery Income</h3>
            <button
              type="button"
              onClick={addDeliveryItem}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Add Delivery
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.onlineDeliveries.map((delivery, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Platform*</label>
                  <select
                    value={delivery.platform}
                    onChange={(e) => handleDeliveryChange(index, 'platform', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Platform</option>
                    <option value="Talabat">Talabat</option>
                    <option value="Keeta">Keeta</option>
                    <option value="Snoonu">Snoonu</option>
                    <option value="ATM">ATM</option>

                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (QR)*</label>
                  <input
                    type="number"
                    step="0.01"
                    value={delivery.amount}
                    onChange={(e) => handleDeliveryChange(index, 'amount', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeDeliveryItem(index)}
                    disabled={formData.onlineDeliveries.length === 1}
                    className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
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
              className="mt-1 block border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Expenses */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Expenses</h3>
            <button
              type="button"
              onClick={addExpenseItem}
              className="px-3 py-1 bg-red-800 text-white text-sm rounded hover:bg-red-900"
            >
              Add Expense
            </button>
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
        </div>

        {/* Summary */}
         <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 text-center">
            <div className="min-w-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 break-words">{parseFloat(formData.income) || 0} QR</div>
              <div className="text-sm text-gray-600">Income</div>
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 break-words">{(totalOnlineDelivery - (parseFloat(formData.onlineDeliveries.find(d => d.platform === 'ATM')?.amount) || 0)).toFixed(2)} QR</div>
              <div className="text-xs text-gray-500">Online Delivery</div>
              <div className="text-xs text-gray-400">(Talabat + Snoonu + Keeta)</div>
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600 break-words">{(parseFloat(formData.onlineDeliveries.find(d => d.platform === 'ATM')?.amount) || 0).toFixed(2)} QR</div>
              <div className="text-sm text-gray-600">ATM</div>
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 break-words">{totalDeliveryMoney.toFixed(2)} QR</div>
              <div className="text-sm text-gray-600">Delivery Money</div>
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 break-words">{totalExpenses.toFixed(2)} QR</div>
              <div className="text-sm text-gray-600">Total Expenses</div>
            </div>
            <div className="min-w-0">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold break-words ${earnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

        <div className="flex justify-end pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-800 hover:bg-red-900"
          >
            Update Expenditure
          </button>
        </div>
      </form>
    </div>
  );
}