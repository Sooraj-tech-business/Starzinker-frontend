import { useState, useEffect } from 'react';
import Modal from './Modal';
import WideModal from './WideModal';

export default function BranchesManagement({ branches, users, onAddBranchClick, onEditBranch, selectedBranchId }) {
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  // Set selected branch from props if provided
  useEffect(() => {
    if (selectedBranchId && branches) {
      const branch = branches.find(b => b._id === selectedBranchId);
      if (branch) {
        setSelectedBranch(branch);
      }
    }
  }, [selectedBranchId, branches]);
  
  // Function to create abbreviation
  const getAbbreviation = (name) => {
    if (!name) return "NA";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Handle double click on branch row
  const handleBranchDoubleClick = (branch) => {
    setSelectedBranch(branch);
  };

  // Get users assigned to this branch
  const getUsersForBranch = (branch) => {
    if (!branch || !branch.assignedUsers || !Array.isArray(branch.assignedUsers)) {
      return [];
    }
    return users.filter(user => branch.assignedUsers.includes(user._id?.toString()));
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Branches Management</h1>
        <button
          onClick={onAddBranchClick}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Branch
        </button>
      </div>
      
      {/* Mobile Card View */}
      <div className="block md:hidden mt-6 space-y-4">
        {branches && branches.map((branch) => (
          <div key={branch._id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-800">{getAbbreviation(branch.name)}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                  <p className="text-sm text-gray-600">{branch.location}</p>
                  <p className="text-sm text-gray-500">{branch.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <span className="text-gray-500">Manager:</span>
                  <div className="font-medium">{branch.manager || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Contact:</span>
                  <div className="font-medium">{branch.contactNumber || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Documents:</span>
                  <div className="font-medium">{branch.documents?.length || 0}</div>
                </div>
                <div>
                  <span className="text-gray-500">Vehicles:</span>
                  <div className="font-medium">{branch.vehicles?.length || 0}</div>
                </div>
                <div>
                  <span className="text-gray-500">Employees:</span>
                  <div className="font-medium">
                    {(() => {
                      const count = users?.filter(user => 
                        user.workLocation === branch.name || 
                        user.branch === branch.name
                      ).length || 0;
                      return count;
                    })()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Temp Salary:</span>
                  <div className="font-medium">
                    QAR {branch.totalTempSalary ? branch.totalTempSalary.toLocaleString() : '0'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {branch.tempEmployeeCount || 0} temp emp.
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Address:</span>
                  <div className="font-medium text-xs">{branch.address || 'N/A'}</div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBranchDoubleClick(branch)}
                  className="flex-1 px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                >
                  View
                </button>
                <button
                  onClick={() => onEditBranch(branch._id)}
                  className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Edit
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Manager
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documents
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicles
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employees
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temp Salary
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {branches && branches.map((branch) => (
              <tr 
                key={branch._id} 
                onDoubleClick={() => handleBranchDoubleClick(branch)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-800">{getAbbreviation(branch.name)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{branch.name}</div>
                      <div className="text-xs text-gray-500">{branch.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{branch.location}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">{branch.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{branch.manager}</div>
                  <div className="text-xs text-gray-500">{branch.contactNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {branch.documents?.length || 0} document(s)
                  </div>
                  {branch.documents?.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Next expiry: {
                        new Date(
                          Math.min(
                            ...branch.documents.map(doc => new Date(doc.expiryDate))
                          )
                        ).toLocaleDateString()
                      }
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {branch.vehicles?.length || 0} vehicle(s)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {(() => {
                      const count = users?.filter(user => 
                        user.workLocation === branch.name || 
                        user.branch === branch.name
                      ).length || 0;
                      console.log(`Branch: ${branch.name}, Count: ${count}`, users?.map(u => ({name: u.name, workLocation: u.workLocation, branch: u.branch})));
                      return count;
                    })()} employee(s)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {branch.totalTempSalary ? `QAR ${branch.totalTempSalary.toLocaleString()}` : 'QAR 0'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {branch.tempEmployeeCount || 0} temp employee(s)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                  <button 
                    className="mr-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                    onClick={() => handleBranchDoubleClick(branch)}
                  >
                    View
                  </button>
                  <button 
                    className="mr-2 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    onClick={() => onEditBranch(branch._id)}
                  >
                    Edit
                  </button>
                  <button className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Branch Details Modal */}
      <WideModal isOpen={selectedBranch !== null} onClose={() => setSelectedBranch(null)}>
        {selectedBranch && (
          <div className="max-h-[90vh] overflow-y-auto">
            <div className="bg-indigo-600 px-6 py-4 rounded-t-lg">
              <div className="flex items-center">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-indigo-800">{getAbbreviation(selectedBranch.name)}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedBranch.name}</h2>
                  <p className="text-sm text-gray-100">{selectedBranch.location}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
            
            {/* Tabs for different sections */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <a href="#info" className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                  Branch Info
                </a>
                <a href="#documents" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                  Documents
                </a>
                <a href="#vehicles" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                  Vehicles
                </a>
                <a href="#users" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                  Users
                </a>
              </nav>
            </div>
            
            {/* Branch Info Section */}
            <div id="info" className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Branch Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBranch.address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBranch.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Contact Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBranch.contactNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Manager</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBranch.manager || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Documents Section */}
            <div id="documents" className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
              {selectedBranch.documents?.length > 0 ? (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Number</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {selectedBranch.documents.map((doc, index) => {
                        const expiryDate = new Date(doc.expiryDate);
                        const today = new Date();
                        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                        let status = "Valid";
                        let statusClass = "bg-green-100 text-green-800";
                        
                        if (daysUntilExpiry < 0) {
                          status = "Expired";
                          statusClass = "bg-red-100 text-red-800";
                        } else if (daysUntilExpiry < 30) {
                          status = "Expiring Soon";
                          statusClass = "bg-yellow-100 text-yellow-800";
                        }
                        
                        return (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{doc.type}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doc.number}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{expiryDate.toLocaleDateString()}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusClass}`}>
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No documents available</p>
              )}
            </div>
            
            {/* Vehicles Section */}
            <div id="vehicles" className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicles</h3>
              {selectedBranch.vehicles?.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedBranch.vehicles.map((vehicle, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Vehicle Type</label>
                          <p className="text-sm font-medium text-gray-900">{vehicle.type || 'N/A'}</p>
                          <p className="text-xs text-gray-500">e.g. Sedan, Truck, Van</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">License Number</label>
                          <p className="text-sm font-medium text-gray-900">{vehicle.licenseNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Make</label>
                          <p className="text-sm font-medium text-gray-900">{vehicle.make || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
                          <p className="text-sm font-medium text-gray-900">{vehicle.model || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                          <p className="text-sm font-medium text-gray-900">{vehicle.year || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                          <p className="text-sm font-medium text-gray-900">{vehicle.color || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">License Expiry Date</label>
                          <p className="text-sm font-medium text-gray-900">
                            {vehicle.licenseExpiry ? new Date(vehicle.licenseExpiry).toLocaleDateString('en-GB') : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">dd/mm/yyyy</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Insurance Expiry Date</label>
                          <p className="text-sm font-medium text-gray-900">
                            {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString('en-GB') : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">dd/mm/yyyy</p>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                            vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                            vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            vehicle.status === 'retired' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {vehicle.status ? vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No vehicles available</p>
              )}
            </div>
            
            {/* Users Section */}
            <div id="users" className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Users</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getUsersForBranch(selectedBranch).length > 0 ? (
                  getUsersForBranch(selectedBranch).map(user => (
                    <div key={user._id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-lg">{user.name ? user.name.charAt(0) : '?'}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{user.name}</h4>
                        <p className="text-xs text-gray-500">{user.role}</p>
                        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 col-span-3">No users assigned to this branch</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedBranch(null)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        )}
      </WideModal>
    </div>
  );
}