import { useState, useEffect } from 'react';
import WideModal from './WideModal';
import AddTempEmployee from './AddTempEmployee';
import ViewTempEmployee from './ViewTempEmployee';
import EditTempEmployee from './EditTempEmployee';

export default function TempEmployeeManagement({ tempEmployees, onAddTempEmployee, onEditTempEmployee, onDeleteTempEmployee, branches }) {
  const [showAddTempEmployee, setShowAddTempEmployee] = useState(false);
  const [showViewTempEmployee, setShowViewTempEmployee] = useState(false);
  const [showEditTempEmployee, setShowEditTempEmployee] = useState(false);
  const [selectedTempEmployee, setSelectedTempEmployee] = useState(null);
  const [filteredTempEmployees, setFilteredTempEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('employees');
  const itemsPerPage = 10;
  
  // Document table states
  const [expiredSearch, setExpiredSearch] = useState('');
  const [expiredFilter, setExpiredFilter] = useState('all');
  const [expiredPage, setExpiredPage] = useState(1);
  const [expiringSearch, setExpiringSearch] = useState('');
  const [expiringFilter, setExpiringFilter] = useState('all');
  const [expiringPage, setExpiringPage] = useState(1);
  const docItemsPerPage = 10;

  useEffect(() => {
    let filtered = tempEmployees || [];
    
    if (searchTerm) {
      filtered = filtered.filter(emp => {
        const searchLower = searchTerm.toLowerCase();
        return (
          emp.name.toLowerCase().includes(searchLower) ||
          emp.email.toLowerCase().includes(searchLower) ||
          emp.role.toLowerCase().includes(searchLower) ||
          (emp.workLocation || '').toLowerCase().includes(searchLower)
        );
      });
    }
    
    setFilteredTempEmployees(filtered);
    setCurrentPage(1);
  }, [tempEmployees, searchTerm]);

  const handleAddTempEmployee = async (tempEmployeeData) => {
    await onAddTempEmployee(tempEmployeeData);
    setShowAddTempEmployee(false);
  };

  const handleViewTempEmployee = (tempEmployee) => {
    setSelectedTempEmployee(tempEmployee);
    setShowViewTempEmployee(true);
  };

  const handleEditTempEmployee = (tempEmployee) => {
    setSelectedTempEmployee(tempEmployee);
    setShowEditTempEmployee(true);
  };

  const handleUpdateTempEmployee = async (tempEmployeeData) => {
    await onEditTempEmployee({ ...tempEmployeeData, _id: selectedTempEmployee._id });
    setShowEditTempEmployee(false);
    setSelectedTempEmployee(null);
  };

  const handleDeleteTempEmployee = async (tempEmployeeId) => {
    if (window.confirm('Are you sure you want to delete this temporary employee?')) {
      await onDeleteTempEmployee(tempEmployeeId);
    }
  };

  // Analytics calculations
  const analytics = {
    total: tempEmployees?.length || 0,
    active: tempEmployees?.filter(u => u.status === 'Working' || u.status === 'Active').length || 0,
    expiredDocs: [],
    expiringDocs: []
  };

  tempEmployees?.forEach(user => {
    // Check for expiring and expired documents
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const today = new Date();
    
    ['qidExpiry', 'passportExpiry', 'visaExpiry', 'medicalCardExpiry'].forEach(field => {
      if (user[field]) {
        const expiryDate = new Date(user[field]);
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (expiryDate < today) {
          // Expired documents
          analytics.expiredDocs.push({
            name: user.name,
            document: field.replace('Expiry', ''),
            expiryDate: expiryDate,
            daysOverdue: Math.abs(daysLeft)
          });
        } else if (expiryDate <= thirtyDaysFromNow) {
          // Expiring documents (within 30 days)
          analytics.expiringDocs.push({
            name: user.name,
            document: field.replace('Expiry', ''),
            expiryDate: expiryDate,
            daysLeft: daysLeft
          });
        }
      }
    });
  });

  const totalPages = Math.ceil(filteredTempEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTempEmployees = filteredTempEmployees.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  return (
    <div className="responsive-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Temporary Employee Management</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {tempEmployees?.length || 0} Total Temporary Employees
          </div>
          <button
            onClick={() => setShowAddTempEmployee(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium"
          >
            + Add Temporary Employee
          </button>
        </div>
      </div>

      {/* Analytics Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{tempEmployees?.length || 0}</div>
              <div className="text-sm opacity-90">Total Temporary</div>
              <div className="text-xs opacity-75 mt-1">Employees</div>
            </div>
            <div className="text-3xl opacity-80">👷</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('employees')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'employees'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Temporary Employee Management
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {analytics.total}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Document Expiry
              {(analytics.expiredDocs.length + analytics.expiringDocs.length) > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 py-0.5 px-2.5 rounded-full text-xs">
                  {analytics.expiredDocs.length + analytics.expiringDocs.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Temporary Employee Management Tab */}
      {activeTab === 'employees' && (
        <>
          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <input
              type="text"
              placeholder="Search temporary employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Table */}
          {filteredTempEmployees.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            <div className="divide-y divide-gray-200">
              {paginatedTempEmployees.map((employee, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-3 mb-3">
                    {employee.documents?.profilePicture?.url ? (
                      <img 
                        src={employee.documents.profilePicture.url} 
                        alt={employee.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {employee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{employee.name}</div>
                      <div className="text-xs text-gray-500">{employee.role}</div>
                      <div className="text-xs text-gray-400">{employee.workLocation}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <div><span className="font-medium">Phone:</span> {employee.phone || 'N/A'}</div>
                    <div><span className="font-medium">Email:</span> {employee.email}</div>
                    <div><span className="font-medium">Nationality:</span> {employee.nationality || 'N/A'}</div>
                    <div>
                      <span className="font-medium">Documents:</span>
                      <div className="flex space-x-1 mt-1">
                        {employee.documents?.qidCopy && (
                          <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">QID</span>
                        )}
                        {employee.documents?.passportCopy && (
                          <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">Passport</span>
                        )}
                        {employee.documents?.medicalCard && (
                          <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">Medical</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewTempEmployee(employee)}
                      className="flex-1 px-3 py-2 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleEditTempEmployee(employee)}
                      className="flex-1 px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteTempEmployee(employee._id)}
                      className="flex-1 px-3 py-2 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTempEmployees.map((employee, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {employee.documents?.profilePicture?.url ? (
                          <img 
                            src={employee.documents.profilePicture.url} 
                            alt={employee.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {employee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.role}</div>
                    <div className="text-sm text-gray-500">{employee.workLocation}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.phone || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{employee.nationality || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {employee.documents?.qidCopy && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">QID</span>
                      )}
                      {employee.documents?.passportCopy && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Passport</span>
                      )}
                      {employee.documents?.medicalCard && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Medical</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewTempEmployee(employee)}
                      className="text-green-600 hover:text-green-900 mr-2"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleEditTempEmployee(employee)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteTempEmployee(employee._id)}
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
        </div>
          ) : (
            <div className="bg-white shadow sm:rounded-lg p-6 text-center">
              <p className="text-gray-500">No temporary employees found</p>
            </div>
          )}
        </>
      )}

      {/* Document Expiry Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {(analytics.expiringDocs.length > 0 || analytics.expiredDocs.length > 0) ? (
            <>
              {/* Document Status Overview */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Document Status Overview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Expired Documents */}
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-900">Expired Documents</span>
                      </div>
                      <span className="text-2xl font-bold text-red-600">{analytics.expiredDocs.length}</span>
                    </div>
                    <div className="space-y-2">
                      {['qid', 'passport', 'visa', 'medicalCard'].map(docType => {
                        const count = analytics.expiredDocs.filter(d => d.document === docType).length;
                        if (count === 0) return null;
                        return (
                          <div key={docType} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 capitalize">{docType === 'medicalCard' ? 'Medical Card' : docType}</span>
                            <span className="font-semibold text-red-700">{count}</span>
                          </div>
                        );
                      })}
                      {analytics.expiredDocs.length === 0 && (
                        <div className="text-sm text-gray-500 italic">No expired documents</div>
                      )}
                    </div>
                  </div>

                  {/* Expiring Soon Documents */}
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-900">Expiring Soon</span>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">{analytics.expiringDocs.length}</span>
                    </div>
                    <div className="space-y-2">
                      {['qid', 'passport', 'visa', 'medicalCard'].map(docType => {
                        const count = analytics.expiringDocs.filter(d => d.document === docType).length;
                        if (count === 0) return null;
                        return (
                          <div key={docType} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 capitalize">{docType === 'medicalCard' ? 'Medical Card' : docType}</span>
                            <span className="font-semibold text-orange-700">{count}</span>
                          </div>
                        );
                      })}
                      {analytics.expiringDocs.length === 0 && (
                        <div className="text-sm text-gray-500 italic">No expiring documents</div>
                      )}
                    </div>
                  </div>

                  {/* Valid Documents */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-900">Valid Documents</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">{analytics.total * 4 - analytics.expiredDocs.length - analytics.expiringDocs.length}</span>
                    </div>
                    <div className="space-y-2">
                      {['qid', 'passport', 'visa', 'medicalCard'].map(docType => {
                        const expired = analytics.expiredDocs.filter(d => d.document === docType).length;
                        const expiring = analytics.expiringDocs.filter(d => d.document === docType).length;
                        const valid = analytics.total - expired - expiring;
                        return (
                          <div key={docType} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 capitalize">{docType === 'medicalCard' ? 'Medical Card' : docType}</span>
                            <span className="font-semibold text-green-700">{valid}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expired Documents */}
              {analytics.expiredDocs.length > 0 && (
                <div className="bg-white rounded-xl shadow-xl border border-red-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div>Expired Documents</div>
                        <div className="text-red-100 text-sm font-normal">Urgent Action Required • {analytics.expiredDocs.length} documents</div>
                      </div>
                    </h3>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="block lg:hidden">
                    <div className="divide-y divide-gray-200">
                      {analytics.expiredDocs.sort((a, b) => b.daysOverdue - a.daysOverdue).map((doc, index) => (
                        <div key={index} className="p-4 hover:bg-red-50">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 font-bold text-sm">{doc.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-900">{doc.name}</div>
                              <div className="text-xs text-red-600 capitalize">{doc.document}</div>
                            </div>
                            <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                              {doc.daysOverdue} days overdue
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mb-3">
                            <span className="font-medium">Expired:</span> {formatDate(doc.expiryDate)}
                          </div>
                          <button
                            onClick={() => {
                              const employee = tempEmployees.find(u => u.name === doc.name);
                              if (employee) {
                                handleEditTempEmployee(employee);
                              }
                            }}
                            className="w-full px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700"
                          >
                            Edit Employee
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Document</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Expired Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Overdue</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {analytics.expiredDocs.sort((a, b) => b.daysOverdue - a.daysOverdue).map((doc, index) => (
                          <tr key={index} className="hover:bg-red-50 transition-colors duration-200">
                            <td className="px-6 py-5">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-red-600 font-bold text-sm">{doc.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="text-sm font-semibold text-gray-900">{doc.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-800 border border-red-200 capitalize">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                {doc.document}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-sm font-medium text-gray-900">{formatDate(doc.expiryDate)}</div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold">
                                {doc.daysOverdue} days
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <button
                                onClick={() => {
                                  const employee = tempEmployees.find(u => u.name === doc.name);
                                  if (employee) {
                                    handleEditTempEmployee(employee);
                                  }
                                }}
                                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-lg hover:bg-orange-700"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Expiring Documents */}
              {analytics.expiringDocs.length > 0 && (
                <div className="bg-white rounded-xl shadow-xl border border-orange-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <div>Documents Expiring Soon</div>
                        <div className="text-orange-100 text-sm font-normal">Renewal Required • {analytics.expiringDocs.length} documents</div>
                      </div>
                    </h3>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="block lg:hidden">
                    <div className="divide-y divide-gray-200">
                      {analytics.expiringDocs.sort((a, b) => a.daysLeft - b.daysLeft).map((doc, index) => (
                        <div key={index} className="p-4 hover:bg-orange-50">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-bold text-sm">{doc.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-900">{doc.name}</div>
                              <div className="text-xs text-orange-600 capitalize">{doc.document}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-bold ${
                              doc.daysLeft <= 7 ? 'bg-red-600 text-white' : 
                              doc.daysLeft <= 15 ? 'bg-orange-600 text-white' : 'bg-yellow-500 text-white'
                            }`}>
                              {doc.daysLeft} days left
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mb-3">
                            <span className="font-medium">Expires:</span> {formatDate(doc.expiryDate)}
                          </div>
                          <button
                            onClick={() => {
                              const employee = tempEmployees.find(u => u.name === doc.name);
                              if (employee) {
                                handleEditTempEmployee(employee);
                              }
                            }}
                            className="w-full px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700"
                          >
                            Edit Employee
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Document</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Expiry Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time Left</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {analytics.expiringDocs.sort((a, b) => a.daysLeft - b.daysLeft).map((doc, index) => (
                          <tr key={index} className="hover:bg-orange-50 transition-colors duration-200">
                            <td className="px-6 py-5">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-orange-600 font-bold text-sm">{doc.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="text-sm font-semibold text-gray-900">{doc.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 capitalize">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                                {doc.document}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-sm font-medium text-gray-900">{formatDate(doc.expiryDate)}</div>
                            </td>
                            <td className="px-6 py-5">
                              <div className={`px-3 py-2 rounded-lg text-xs font-bold ${
                                doc.daysLeft <= 7 ? 'bg-red-600 text-white' : 
                                doc.daysLeft <= 15 ? 'bg-orange-600 text-white' : 'bg-yellow-500 text-white'
                              }`}>
                                {doc.daysLeft} days
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <button
                                onClick={() => {
                                  const employee = tempEmployees.find(u => u.name === doc.name);
                                  if (employee) {
                                    handleEditTempEmployee(employee);
                                  }
                                }}
                                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-lg hover:bg-orange-700"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white shadow sm:rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">All Documents Valid</h3>
              <p className="mt-1 text-sm text-gray-500">No expired or expiring documents found.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      <WideModal isOpen={showAddTempEmployee} onClose={() => setShowAddTempEmployee(false)}>
        <AddTempEmployee 
          onClose={() => setShowAddTempEmployee(false)} 
          onAddTempEmployee={handleAddTempEmployee}
          branches={branches}
        />
      </WideModal>

      {/* View Modal */}
      <WideModal isOpen={showViewTempEmployee} onClose={() => setShowViewTempEmployee(false)}>
        <ViewTempEmployee 
          tempEmployee={selectedTempEmployee}
          onClose={() => setShowViewTempEmployee(false)}
        />
      </WideModal>

      {/* Edit Modal */}
      <WideModal isOpen={showEditTempEmployee} onClose={() => setShowEditTempEmployee(false)}>
        <EditTempEmployee 
          tempEmployee={selectedTempEmployee}
          onClose={() => setShowEditTempEmployee(false)}
          onUpdateTempEmployee={handleUpdateTempEmployee}
          branches={branches}
        />
      </WideModal>
    </div>
  );
}