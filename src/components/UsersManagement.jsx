import React, { useState } from 'react';

export default function UsersManagement({ users, onAddUserClick, onEditUser, onDeleteUser }) {
  const [expandedUser, setExpandedUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toggleUserDetails = (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };
  
  const handleDeleteClick = (userId) => {
    setConfirmDelete(userId);
  };
  
  const confirmDeleteUser = () => {
    if (confirmDelete) {
      onDeleteUser(confirmDelete);
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Employees Management</h1>
        <button
          onClick={onAddUserClick}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Employee
        </button>
      </div>
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        {users.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No employees found. Click "Add Employee" to create one.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <React.Fragment key={user._id}>
                  <tr className="cursor-pointer hover:bg-gray-50" onClick={() => toggleUserDetails(user._id)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.designation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.workLocation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'Working' ? 'bg-green-100 text-green-800' : 
                        user.status === 'Vacation' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                      <button 
                        className="mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditUser(user._id);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(user._id);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedUser === user._id && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Personal Details</h4>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600"><span className="font-medium">QID:</span> {user.qid}</p>
                              <p className="text-sm text-gray-600"><span className="font-medium">Passport:</span> {user.passportNumber}</p>
                              <p className="text-sm text-gray-600"><span className="font-medium">Role:</span> {user.role}</p>
                              <p className="text-sm text-gray-600"><span className="font-medium">Branch:</span> {user.branch}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Important Dates</h4>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600"><span className="font-medium">Joined:</span> {new Date(user.doj).toLocaleDateString()}</p>
                              {user.doe && <p className="text-sm text-gray-600"><span className="font-medium">Exit:</span> {new Date(user.doe).toLocaleDateString()}</p>}
                              {user.visaExpiry && <p className="text-sm text-gray-600"><span className="font-medium">Visa Expiry:</span> {new Date(user.visaExpiry).toLocaleDateString()}</p>}
                              {user.medicalCardExpiry && <p className="text-sm text-gray-600"><span className="font-medium">Medical Card Expiry:</span> {new Date(user.medicalCardExpiry).toLocaleDateString()}</p>}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Contact Information</h4>
                            <div className="mt-2 space-y-1">
                              {user.emergencyContact && <p className="text-sm text-gray-600"><span className="font-medium">Emergency Contact:</span> {user.emergencyContact}</p>}
                              {user.emergencyContact2 && <p className="text-sm text-gray-600"><span className="font-medium">Emergency Contact 2:</span> {user.emergencyContact2}</p>}
                              {user.nativeAddress && <p className="text-sm text-gray-600"><span className="font-medium">Native Address:</span> {user.nativeAddress}</p>}
                            </div>
                          </div>
                          
                          {(user.bankName || user.bankAccountNumber || user.medicalCardNumber || user.visaNumber) && (
                            <div className="md:col-span-3">
                              <h4 className="text-sm font-medium text-gray-700">Additional Information</h4>
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                {user.bankName && <p className="text-sm text-gray-600"><span className="font-medium">Bank:</span> {user.bankName}</p>}
                                {user.bankAccountNumber && <p className="text-sm text-gray-600"><span className="font-medium">Account Number:</span> {user.bankAccountNumber}</p>}
                                {user.medicalCardNumber && <p className="text-sm text-gray-600"><span className="font-medium">Medical Card:</span> {user.medicalCardNumber}</p>}
                                {user.visaNumber && <p className="text-sm text-gray-600"><span className="font-medium">Visa Number:</span> {user.visaNumber}</p>}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this employee? This action cannot be undone.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}