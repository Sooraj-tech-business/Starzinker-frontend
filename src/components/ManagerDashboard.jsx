import { useState, useEffect } from 'react';
import WideModal from './WideModal';
import AddDailyExpenditure from './AddDailyExpenditure';

// Utility function to get business date with 6-hour grace period
const getBusinessDate = () => {
  const now = new Date();
  // Subtract 6 hours to get the effective business time
  const businessTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
  return businessTime.toISOString().split('T')[0];
};

export default function ManagerDashboard({ expenditures, onAddExpenditure, branches, currentUser }) {
  const [showAddExpenditure, setShowAddExpenditure] = useState(false);
  const [showViewExpenditure, setShowViewExpenditure] = useState(false);
  const [todaySubmission, setTodaySubmission] = useState(null);
  const [todayDraft, setTodayDraft] = useState(null);

  // Find manager's branch
  const userBranch = branches?.find(b => b.name === currentUser?.branch);

  // Check if manager has already submitted today
  useEffect(() => {
    const today = getBusinessDate();
    
    if (userBranch && expenditures && currentUser) {
      const todayEntry = expenditures.find(exp => {
        const expDate = new Date(exp.date).toISOString().split('T')[0];
        return expDate === today && 
               exp.branchId === userBranch._id && 
               exp.submittedBy === currentUser.name;
      });
      setTodaySubmission(todayEntry);
      
      // Check for draft in localStorage
      const draftKey = `draft_${userBranch._id}_${currentUser.name}_${today}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft && !todayEntry) {
        setTodayDraft(JSON.parse(savedDraft));
      }
    }
  }, [expenditures, userBranch, currentUser]);

  const handleSaveDraft = (expenditureData) => {
    const today = getBusinessDate();
    const draftKey = `draft_${userBranch._id}_${currentUser.name}_${today}`;
    
    const draftData = {
      ...expenditureData,
      branchId: userBranch?._id,
      branchName: userBranch?.name,
      date: today,
      submittedBy: currentUser?.name,
      isDraft: true
    };
    
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    setTodayDraft(draftData);
    setShowAddExpenditure(false);
    alert('Draft saved successfully!');
  };

  const handleSubmitExpenditure = async (expenditureData) => {
    const today = getBusinessDate();
    
    // Confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to submit this expenditure? Once submitted, you cannot edit or add new entries for today.'
    );
    
    if (!confirmed) return;
    
    const finalData = {
      ...expenditureData,
      branchId: userBranch?._id,
      branchName: userBranch?.name,
      date: today,
      submittedBy: currentUser?.name
    };
    
    await onAddExpenditure(finalData);
    
    // Clear draft after successful submission
    const draftKey = `draft_${userBranch._id}_${currentUser.name}_${today}`;
    localStorage.removeItem(draftKey);
    setTodayDraft(null);
    setShowAddExpenditure(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-800 to-red-900 px-6 py-4 text-center">
            <h2 className="text-xl font-bold text-white">Daily Expenditure</h2>
            <p className="text-red-100 text-sm">{userBranch?.name}</p>
            <p className="text-red-100 text-xs">{new Date(getBusinessDate()).toLocaleDateString('en-GB')}</p>
          </div>
          
          <div className="p-6">
            {todaySubmission ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Already Submitted</h3>
                <p className="text-gray-600 mb-4">You have submitted today's expenditure.</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{todaySubmission.income} QR</div>
                      <div className="text-xs text-gray-600">Income</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">{todaySubmission.totalExpenses} QR</div>
                      <div className="text-xs text-gray-600">Expenses</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${todaySubmission.earnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {todaySubmission.earnings} QR
                      </div>
                      <div className="text-xs text-gray-600">Earnings</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewExpenditure(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  View Details
                </button>
              </div>
            ) : todayDraft ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Draft Saved</h3>
                <p className="text-gray-600 mb-4">You have a draft expenditure for today.</p>
                <button
                  onClick={() => setShowAddExpenditure(true)}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Continue Editing
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Add Today's Expenditure</h3>
                <p className="text-gray-600 mb-6">Create your daily expenditure entry.</p>
                <button
                  onClick={() => setShowAddExpenditure(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-800 to-red-900 text-white rounded-lg hover:from-red-900 hover:to-red-800 font-medium"
                >
                  Add Expenditure
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <WideModal isOpen={showAddExpenditure} onClose={() => setShowAddExpenditure(false)}>
        <AddDailyExpenditure 
          onClose={() => setShowAddExpenditure(false)} 
          onAddExpenditure={handleSubmitExpenditure}
          onSaveDraft={handleSaveDraft}
          branches={[userBranch].filter(Boolean)}
          currentUser={currentUser}
          isManagerMode={true}
          existingDraft={todayDraft}
        />
      </WideModal>

      {/* View Modal */}
      <WideModal isOpen={showViewExpenditure} onClose={() => setShowViewExpenditure(false)}>
        {todaySubmission && (
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Today's Expenditure Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{todaySubmission.income} QR</div>
                  <div className="text-sm text-gray-600">Income</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{todaySubmission.totalExpenses} QR</div>
                  <div className="text-sm text-gray-600">Total Expenses</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${todaySubmission.earnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {todaySubmission.earnings} QR
                  </div>
                  <div className="text-sm text-gray-600">Earnings</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Expense Breakdown:</h3>
                <div className="space-y-2">
                  {todaySubmission.expenses?.map((exp, index) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{exp.category}</span>
                      <span className="font-semibold">{exp.amount} QR</span>
                    </div>
                  ))}
                </div>
              </div>
              {todaySubmission.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes:</h3>
                  <p className="text-gray-700">{todaySubmission.notes}</p>
                </div>
              )}
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowViewExpenditure(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </WideModal>
    </div>
  );
}