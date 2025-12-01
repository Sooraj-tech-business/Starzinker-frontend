import { useState, useEffect } from 'react';
import api from '../api/config';
import Modal from './Modal';

export default function VacationManagement({ users }) {
  const [vacations, setVacations] = useState([]);
  const [filteredVacations, setFilteredVacations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingVacation, setEditingVacation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [timePeriodFilter, setTimePeriodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    qid: '',
    startDate: '',
    duration: '',
    reason: ''
  });

  // Fetch vacations on component mount
  useEffect(() => {
    fetchVacations();
  }, []);

  // Filter and search vacations
  useEffect(() => {
    let filtered = vacations;

    if (searchTerm) {
      filtered = filtered.filter(vacation =>
        vacation.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vacation.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vacation => {
        const status = getVacationStatus(vacation.startDate, vacation.endDate);
        return status.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    if (branchFilter !== 'all') {
      filtered = filtered.filter(vacation => {
        const employee = users?.find(user => user._id === vacation.employeeId);
        const employeeBranch = employee?.workLocation || employee?.branch || '';
        return employeeBranch.toLowerCase() === branchFilter.toLowerCase();
      });
    }

    if (timePeriodFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(vacation => {
        const startDate = new Date(vacation.startDate);
        const endDate = new Date(vacation.endDate);
        
        switch (timePeriodFilter) {
          case '1month':
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return startDate >= oneMonthAgo || endDate >= oneMonthAgo;
          case '3months':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            return startDate >= threeMonthsAgo || endDate >= threeMonthsAgo;
          case '6months':
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            return startDate >= sixMonthsAgo || endDate >= sixMonthsAgo;
          case '1year':
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return startDate >= oneYearAgo || endDate >= oneYearAgo;
          default:
            return true;
        }
      });
    }

    setFilteredVacations(filtered);
    setCurrentPage(1);
  }, [vacations, searchTerm, statusFilter, branchFilter, timePeriodFilter, users]);

  const fetchVacations = async () => {
    try {
      const response = await api.get('/api/vacations');
      const data = response.data || [];
      setVacations(data);
      setFilteredVacations(data);
    } catch (error) {
      console.error('Error fetching vacations:', error);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVacations = filteredVacations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVacations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEmployeeSelect = (e) => {
    const selectedUserId = e.target.value;
    const selectedUser = users.find(user => user._id === selectedUserId);
    
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        employeeId: selectedUserId,
        employeeName: selectedUser.name,
        qid: selectedUser.qid || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        employeeId: '',
        employeeName: '',
        qid: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.startDate || !formData.duration) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate end date based on duration (30 days per month)
    const startDate = new Date(formData.startDate);
    let endDate = new Date(startDate);
    let daysToAdd = 0;
    
    switch (formData.duration) {
      case '1week':
        daysToAdd = 6; // 7 days total (including start date)
        break;
      case '2weeks':
        daysToAdd = 13; // 14 days total
        break;
      case '1month':
        daysToAdd = 29; // 30 days total
        break;
      case '2months':
        daysToAdd = 59; // 60 days total (2 * 30)
        break;
      case '3months':
        daysToAdd = 89; // 90 days total (3 * 30)
        break;
      case '6months':
        daysToAdd = 179; // 180 days total (6 * 30)
        break;
      case '1year':
        daysToAdd = 359; // 360 days total (12 * 30)
        break;
    }
    
    endDate.setDate(startDate.getDate() + daysToAdd);

    const vacationData = {
      ...formData,
      endDate: endDate.toISOString().split('T')[0]
    };

    try {
      if (editingVacation) {
        await api.put(`/api/vacations/${editingVacation._id}`, vacationData);
      } else {
        await api.post('/api/vacations', vacationData);
      }
      
      await fetchVacations();
      setShowAddForm(false);
      setShowEditForm(false);
      setEditingVacation(null);
      setFormData({
        employeeId: '',
        employeeName: '',
        qid: '',
        startDate: '',
        duration: '',
        reason: ''
      });
    } catch (error) {
      console.error(`Error ${editingVacation ? 'updating' : 'adding'} vacation:`, error);
      alert(`Error ${editingVacation ? 'updating' : 'adding'} vacation`);
    }
  };

  const handleEdit = (vacation) => {
    setEditingVacation(vacation);
    
    // Calculate duration from start and end dates (30 days per month)
    const startDate = new Date(vacation.startDate);
    const endDate = new Date(vacation.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    let duration = '';
    if (diffDays <= 7) duration = '1week';
    else if (diffDays <= 14) duration = '2weeks';
    else if (diffDays <= 30) duration = '1month';
    else if (diffDays <= 60) duration = '2months';
    else if (diffDays <= 90) duration = '3months';
    else if (diffDays <= 180) duration = '6months';
    else duration = '1year';
    
    setFormData({
      employeeId: vacation.employeeId,
      employeeName: vacation.employeeName,
      qid: vacation.qid || '',
      startDate: vacation.startDate.split('T')[0],
      duration: duration,
      reason: vacation.reason || ''
    });
    setShowEditForm(true);
  };

  const handleDelete = async (vacationId) => {
    if (!window.confirm('Are you sure you want to delete this vacation?')) {
      return;
    }

    try {
      await api.delete(`/api/vacations/${vacationId}`);
      await fetchVacations();
    } catch (error) {
      console.error('Error deleting vacation:', error);
      alert('Error deleting vacation');
    }
  };

  const calculateDaysRemaining = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    // If vacation hasn't started yet, return total days
    if (today < start) {
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    // If vacation is ongoing, return remaining days
    if (today >= start && today <= end) {
      return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    }
    
    // If vacation is over, return 0
    return 0;
  };

  const getTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getVacationStatus = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    if (today < start) return 'Upcoming';
    if (today >= start && today <= end) return 'Active';
    return 'Completed';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Vacation Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Vacation
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by employee name or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Branches</option>
            {[...new Set(users?.map(user => user.workLocation || user.branch).filter(Boolean))].map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={timePeriodFilter}
            onChange={(e) => setTimePeriodFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="1month">Last 1 Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last 1 Year</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 flex items-center">
          Showing {filteredVacations.length} of {vacations.length} vacations
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4 mb-6">
        {currentVacations.map((vacation) => {
          const daysRemaining = calculateDaysRemaining(vacation.startDate, vacation.endDate);
          const totalDays = getTotalDays(vacation.startDate, vacation.endDate);
          const status = getVacationStatus(vacation.startDate, vacation.endDate);
          const employee = users?.find(user => user._id === vacation.employeeId);
          
          return (
            <div key={vacation._id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex-shrink-0">
                    {employee?.documents?.profilePicture?.url ? (
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={employee.documents.profilePicture.url}
                        alt={vacation.employeeName}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{vacation.employeeName}</h3>
                    <p className="text-sm text-gray-600">{employee?.designation || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{employee?.workLocation || employee?.branch || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    status === 'Active' ? 'bg-green-100 text-green-800' :
                    status === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500">Start Date:</span>
                    <div className="font-medium">{new Date(vacation.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">End Date:</span>
                    <div className="font-medium">{new Date(vacation.endDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <div className="font-medium">{totalDays} days</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Remaining:</span>
                    <div className={`font-medium ${
                      daysRemaining > 0 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {daysRemaining > 0 ? `${daysRemaining} days` : 'Completed'}
                    </div>
                  </div>
                </div>
                
                {vacation.reason && (
                  <div className="mb-3">
                    <span className="text-gray-500 text-sm">Reason:</span>
                    <div className="text-sm text-gray-700 mt-1">{vacation.reason}</div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(vacation)}
                    className="flex-1 px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vacation._id)}
                    className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {currentVacations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filteredVacations.length === 0 ? 'No vacation records found' : 'No results match your search'}
          </div>
        )}
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vacation Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentVacations.map((vacation) => {
              const daysRemaining = calculateDaysRemaining(vacation.startDate, vacation.endDate);
              const totalDays = getTotalDays(vacation.startDate, vacation.endDate);
              const status = getVacationStatus(vacation.startDate, vacation.endDate);
              const employee = users?.find(user => user._id === vacation.employeeId);
              
              return (
                <tr key={vacation._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {employee?.documents?.profilePicture?.url ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={employee.documents.profilePicture.url}
                            alt={vacation.employeeName}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{vacation.employeeName}</div>
                        <div className="text-sm text-gray-500">{employee?.designation || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{employee?.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{employee?.phone || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Branch: {employee?.workLocation || employee?.branch || 'N/A'}</div>
                        <div className="text-sm text-gray-500">QID: {employee?.qid || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div>Start: {new Date(vacation.startDate).toLocaleDateString()}</div>
                      <div>End: {new Date(vacation.endDate).toLocaleDateString()}</div>
                      {vacation.reason && (
                        <div className="text-xs text-gray-500 mt-1">Reason: {vacation.reason}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{totalDays} days total</div>
                    <div className={`text-sm font-medium ${
                      daysRemaining > 0 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Completed'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      status === 'Active' ? 'bg-green-100 text-green-800' :
                      status === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => handleEdit(vacation)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vacation._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {currentVacations.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  {filteredVacations.length === 0 ? 'No vacation records found' : 'No results match your search'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredVacations.length)}</span> of{' '}
                <span className="font-medium">{filteredVacations.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === index + 1
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Vacation Modal */}
      <Modal isOpen={showAddForm || showEditForm} onClose={() => {
        setShowAddForm(false);
        setShowEditForm(false);
        setEditingVacation(null);
      }}>
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
          <div className="bg-indigo-600 px-6 py-4 rounded-t-lg">
            <h2 className="text-xl font-bold text-white">
              {editingVacation ? 'Edit Vacation' : 'Add Vacation'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee*
              </label>
              <select
                value={formData.employeeId}
                onChange={handleEmployeeSelect}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Employee</option>
                {users?.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.qid}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QID
              </label>
              <input
                type="text"
                value={formData.qid}
                readOnly
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration*
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Duration</option>
                <option value="1week">1 Week</option>
                <option value="2weeks">2 Weeks</option>
                <option value="1month">1 Month</option>
                <option value="2months">2 Months</option>
                <option value="3months">3 Months</option>
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Optional reason for vacation"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  setEditingVacation(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                {editingVacation ? 'Update Vacation' : 'Add Vacation'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}