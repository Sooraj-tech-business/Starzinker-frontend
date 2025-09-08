export default function ViewExpenditure({ expenditure, onClose }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => `${amount.toFixed(2)} QR`;

  return (
    <div className="bg-white rounded-lg shadow-lg max-h-[95vh] overflow-y-auto w-full">
      <div className="bg-red-800 px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-red-800">💰</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Daily Expenditure</h2>
              <p className="text-red-100">{expenditure.branchName} • {formatDate(expenditure.date)}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Financial Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Financial Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-gray-600">Income</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(expenditure.income)}</span>
              </div>

              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-gray-600">Total Expenses</span>
                <span className="text-2xl font-bold text-red-600">{formatCurrency(expenditure.totalExpenses)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-gray-600">Net Earnings</span>
                <span className={`text-2xl font-bold ${expenditure.earnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(expenditure.earnings)}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-medium text-gray-600">Submitted By</span>
                <span className="text-gray-900 font-semibold">{expenditure.submittedBy}</span>
              </div>
            </div>
          </div>

          {/* Delivery Income Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Delivery Income Breakdown
            </h3>
            <div className="space-y-3">
              {/* Online Delivery Platforms */}
              {expenditure.onlineDeliveries?.length > 0 && (
                <>
                  <h4 className="font-medium text-blue-600 text-sm mb-2">Online Delivery (Talabat, Keeta, Snoonu)</h4>
                  {expenditure.onlineDeliveries
                    .filter(delivery => ['Talabat', 'Keeta', 'Snoonu'].includes(delivery.platform))
                    .map((delivery, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <div>
                          <div className="font-medium text-gray-900">{delivery.platform}</div>
                          {delivery.description && (
                            <div className="text-sm text-gray-500">{delivery.description}</div>
                          )}
                        </div>
                        <span className="font-semibold text-blue-600">{formatCurrency(delivery.amount)}</span>
                      </div>
                    ))
                  }
                  <div className="flex justify-between items-center py-3 mt-2 bg-blue-100 rounded-lg px-3">
                    <span className="font-bold text-blue-800">Total Online Delivery</span>
                    <span className="text-xl font-bold text-blue-800">
                      {(() => {
                        const platforms = ['Talabat', 'Keeta', 'Snoonu'];
                        let total = 0;
                        if (expenditure.onlineDeliveries) {
                          expenditure.onlineDeliveries.forEach(delivery => {
                            if (platforms.includes(delivery.platform)) {
                              total += delivery.amount;
                            }
                          });
                        }
                        return formatCurrency(total);
                      })()}
                    </span>
                  </div>
                </>
              )}
              
              {/* ATM Income */}
              {(expenditure.atmIncome > 0 || expenditure.onlineDeliveries?.some(d => d.platform === 'ATM')) && (
                <>
                  <h4 className="font-medium text-orange-600 text-sm mb-2 mt-4">ATM Income</h4>
                  {expenditure.atmIncome > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <div className="font-medium text-gray-900">ATM Income</div>
                      <span className="font-semibold text-orange-600">{formatCurrency(expenditure.atmIncome)}</span>
                    </div>
                  )}
                  {expenditure.onlineDeliveries
                    ?.filter(delivery => delivery.platform === 'ATM')
                    .map((delivery, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <div>
                          <div className="font-medium text-gray-900">ATM</div>
                          {delivery.description && (
                            <div className="text-sm text-gray-500">{delivery.description}</div>
                          )}
                        </div>
                        <span className="font-semibold text-orange-600">{formatCurrency(delivery.amount)}</span>
                      </div>
                    ))
                  }
                </>
              )}
              
              {/* Delivery Money */}
              {expenditure.deliveryMoney > 0 && (
                <>
                  <h4 className="font-medium text-purple-600 text-sm mb-2 mt-4">Delivery Income</h4>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div className="font-medium text-gray-900">Delivery</div>
                    <span className="font-semibold text-purple-600">{formatCurrency(expenditure.deliveryMoney)}</span>
                  </div>
                </>
              )}
              
              {!expenditure.onlineDeliveries?.length && !expenditure.atmIncome && !expenditure.deliveryMoney && (
                <div className="text-gray-500 text-center py-4">No delivery income recorded</div>
              )}
            </div>
          </div>



          {/* Expense Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Expense Breakdown
            </h3>
            <div className="space-y-4">
              {/* Normal Expenses */}
              {expenditure.expenses.filter(exp => (exp.type || 'NORMAL EXPENSE') === 'NORMAL EXPENSE').length > 0 && (
                <>
                  <h4 className="font-medium text-orange-600 text-sm mb-2">Normal Expenses</h4>
                  {expenditure.expenses
                    .filter(exp => (exp.type || 'NORMAL EXPENSE') === 'NORMAL EXPENSE')
                    .map((expense, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <div>
                          <div className="font-medium text-gray-900">{expense.category}</div>
                          {expense.description && (
                            <div className="text-sm text-gray-500">{expense.description}</div>
                          )}
                        </div>
                        <span className="font-semibold text-orange-600">{formatCurrency(expense.amount)}</span>
                      </div>
                    ))
                  }
                  <div className="flex justify-between items-center py-3 mt-2 bg-orange-100 rounded-lg px-3">
                    <span className="font-bold text-orange-800">Total Normal Expenses</span>
                    <span className="text-xl font-bold text-orange-800">
                      {formatCurrency(expenditure.expenses.filter(exp => (exp.type || 'NORMAL EXPENSE') === 'NORMAL EXPENSE').reduce((sum, exp) => sum + exp.amount, 0))}
                    </span>
                  </div>
                </>
              )}
              
              {/* General Expenses */}
              {expenditure.expenses.filter(exp => exp.type === 'GENERAL EXPENSE').length > 0 && (
                <>
                  <h4 className="font-medium text-pink-600 text-sm mb-2 mt-4">General Expenses</h4>
                  {expenditure.expenses
                    .filter(exp => exp.type === 'GENERAL EXPENSE')
                    .map((expense, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <div>
                          <div className="font-medium text-gray-900">{expense.category}</div>
                          {expense.description && (
                            <div className="text-sm text-gray-500">{expense.description}</div>
                          )}
                        </div>
                        <span className="font-semibold text-pink-600">{formatCurrency(expense.amount)}</span>
                      </div>
                    ))
                  }
                  <div className="flex justify-between items-center py-3 mt-2 bg-pink-100 rounded-lg px-3">
                    <span className="font-bold text-pink-800">Total General Expenses</span>
                    <span className="text-xl font-bold text-pink-800">
                      {formatCurrency(expenditure.expenses.filter(exp => exp.type === 'GENERAL EXPENSE').reduce((sum, exp) => sum + exp.amount, 0))}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {expenditure.notes && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4.707 4.707z" />
              </svg>
              Notes
            </h3>
            <p className="text-gray-700">{expenditure.notes}</p>
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}