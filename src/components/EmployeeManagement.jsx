import { useState, useEffect } from 'react';

export default function EmployeeManagement({ users, onEditUser, onDeleteUser, onViewUser, onAddUser }) {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeTab, setActiveTab] = useState('employees');
  const itemsPerPage = 15;
  
  // Document table states
  const [expiredSearch, setExpiredSearch] = useState('');
  const [expiredFilter, setExpiredFilter] = useState('all');
  const [expiredPage, setExpiredPage] = useState(1);
  const [expiringSearch, setExpiringSearch] = useState('');
  const [expiringFilter, setExpiringFilter] = useState('all');
  const [expiringPage, setExpiringPage] = useState(1);
  const docItemsPerPage = 10;

  useEffect(() => {
    let filtered = users || [];
    
    // Apply filters
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    if (branchFilter !== 'all') {
      filtered = filtered.filter(user => user.branch === branchFilter);
    }
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          (user.email || '').toLowerCase().includes(searchLower) ||
          (user.role || '').toLowerCase().includes(searchLower) ||
          (user.branch || '').toLowerCase().includes(searchLower) ||
          (user.qid || '').toLowerCase().includes(searchLower) ||
          (user.passportNumber || '').toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'doj') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, statusFilter, branchFilter, roleFilter, sortField, sortDirection]);

  // Analytics calculations
  const analytics = {
    total: users?.length || 0,
    active: users?.filter(u => u.status === 'Working' || u.status === 'Active').length || 0,
    byBranch: {},
    byRole: {},
    byStatus: {},
    avgTenure: 0,
    newHires: 0,
    expiringDocs: [],
    expiredDocs: []
  };

  users?.forEach(user => {
    // Branch distribution
    analytics.byBranch[user.branch || 'Unassigned'] = (analytics.byBranch[user.branch || 'Unassigned'] || 0) + 1;
    
    // Role distribution
    analytics.byRole[user.role || 'Unassigned'] = (analytics.byRole[user.role || 'Unassigned'] || 0) + 1;
    
    // Status distribution
    analytics.byStatus[user.status || 'Unknown'] = (analytics.byStatus[user.status || 'Unknown'] || 0) + 1;
    
    // Calculate tenure and new hires
    if (user.doj) {
      const joinDate = new Date(user.doj);
      const now = new Date();
      const tenureMonths = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24 * 30));
      analytics.avgTenure += tenureMonths;
      
      // New hires in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (joinDate >= thirtyDaysAgo) {
        analytics.newHires++;
      }
    }
    
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
  
  // Calculate average tenure
  analytics.avgTenure = users?.length > 0 ? Math.floor(analytics.avgTenure / users.length) : 0;

  const getFilterOptions = (field) => {
    return [...new Set(users?.map(user => user[field]).filter(Boolean) || [])];
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {analytics.total} Total Employees
          </div>
          <button
            onClick={() => onAddUser && onAddUser()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-indigo-600">{analytics.total}</div>
          <div className="text-sm text-gray-600">Total Employees</div>
          <div className="text-xs text-gray-400 mt-1">+{analytics.newHires} new this month</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{analytics.active}</div>
          <div className="text-sm text-gray-600">Active Employees</div>
          <div className="text-xs text-gray-400 mt-1">{((analytics.active/analytics.total)*100).toFixed(1)}% active rate</div>
        </div>
      </div>
      {/* Role Distribution Chart */}
      <div className="mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Employee Roles</h3>
            <div className="text-sm text-gray-500">{Object.keys(analytics.byRole).length} different roles</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.byRole)
              .sort(([roleA, countA], [roleB, countB]) => {
                // Define role hierarchy
                const hierarchy = {
                  'Founder': 1,
                  'Co-founder': 2,
                  'Gm manager': 3,
                  'Manager': 4,
                  'Supervisor': 5,
                  'Account': 6,
                  'Cook': 7,
                  'Waiter': 8,
                  'Driver': 9,
                  'Sandwich maker': 10,
                  'Juice maker': 11,
                  'Shawarma maker': 12,
                  'Cleaner': 13
                };
                
                const orderA = hierarchy[roleA] || 999;
                const orderB = hierarchy[roleB] || 999;
                
                // Sort by hierarchy first, then by count if same level
                if (orderA !== orderB) {
                  return orderA - orderB;
                }
                return countB - countA;
              })
              .map(([role, count], index) => {
                const percentage = ((count / analytics.total) * 100).toFixed(1);
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500'];
                const roleIcons = {
                  'Manager': '👨‍💼', 'GM Manager': '🏢', 'Supervisor': '👥',
                  'Cook': '👨‍🍳', 'Waiter': '🍽️', 'Driver': '🚗',
                  'Cleaner': '🧹', 'Account': '💼', 'Founder': '🌟',
                  'Co-founder': '⭐', 'Sandwich maker': '🥪', 'Juice maker': '🥤',
                  'Shawarma maker': '🌯'
                };
                return (
                  <div key={role} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{roleIcons[role] || '👤'}</span>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{role}</div>
                        <div className="text-xs text-gray-500">{count} employee{count > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right mt-2">
                      <span className="text-xs font-medium text-gray-600">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
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
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Employee Management
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {analytics.total}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-indigo-500 text-indigo-600'
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

      {/* Employee Management Tab */}
      {activeTab === 'employees' && (
        <>
          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            {getFilterOptions('status').map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Branches</option>
            {getFilterOptions('branch').map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            {getFilterOptions('role').map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredUsers.length} of {analytics.total} employees</span>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setBranchFilter('all');
              setRoleFilter('all');
            }}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Clear all filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      {filteredUsers.length > 0 ? (
        <div className="bg-white shadow-xl rounded-xl border border-gray-100">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            <div className="divide-y divide-gray-200">
              {paginatedUsers.map((user, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-3 mb-3">
                    {user.documents?.profilePicture?.url ? (
                      <img 
                        src={user.documents.profilePicture.url} 
                        alt={user.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.role || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{user.workLocation || 'No Location'}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'Working' ? 'bg-green-100 text-green-800' : 
                      user.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status || 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <div><span className="font-medium">Phone:</span> {user.phone || 'N/A'}</div>
                    <div><span className="font-medium">QID:</span> {user.qid || 'N/A'}</div>
                    <div><span className="font-medium">Email:</span> {user.email || 'N/A'}</div>
                    <div><span className="font-medium">Joined:</span> {formatDate(user.doj)}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onViewUser && onViewUser(user)}
                      className="flex-1 px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => onEditUser && onEditUser(user._id)}
                      className="flex-1 px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDeleteUser && window.confirm('Are you sure?') && onDeleteUser(user._id)}
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
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Employee</span>
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Role & Work Location</span>
                      <SortIcon field="role" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Documents
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('doj')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Join Date</span>
                      <SortIcon field="doj" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedUsers.map((user, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-14 w-14">
                          {user.documents?.profilePicture?.url ? (
                            <img 
                              src={user.documents.profilePicture.url} 
                              alt={user.name}
                              className="h-14 w-14 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-sm">
                              <span className="text-xl font-bold text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                          <div className="text-xs text-gray-400 mt-1">ID: {user._id?.slice(-6) || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{user.role || 'N/A'}</div>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.workLocation || 'No Location'}
                        </div>
                        {user.visaAddedBranch && (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Visa: {user.visaAddedBranch}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{user.workLocation || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">QID: {user.qid || 'N/A'}</div>
                      <div className="text-sm text-gray-500">Passport: {user.passportNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'Working' ? 'bg-green-100 text-green-800' : 
                        user.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.doj)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => onViewUser && onViewUser(user)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button 
                          onClick={() => onEditUser && onEditUser(user._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => onDeleteUser && window.confirm('Are you sure you want to delete this employee?') && onDeleteUser(user._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> of{' '}
                    <span className="font-medium">{filteredUsers.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {[...Array(Math.min(totalPages, 10))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : users?.length > 0 ? (
        <div className="bg-white shadow sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No employees match your search criteria</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setBranchFilter('all');
              setRoleFilter('all');
            }}
            className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No employees available</p>
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
                <>
                  {/* Expired Documents Search & Filter */}
                  <div className="bg-white rounded-lg shadow mb-4 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Search expired documents..."
                          value={expiredSearch}
                          onChange={(e) => setExpiredSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <select
                        value={expiredFilter}
                        onChange={(e) => setExpiredFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="all">All Documents</option>
                        <option value="qid">QID</option>
                        <option value="passport">Passport</option>
                        <option value="visa">Visa</option>
                        <option value="medicalCard">Medical Card</option>
                      </select>
                      <button
                        onClick={() => {
                          const filtered = analytics.expiredDocs.filter(doc => {
                            const matchesSearch = doc.name.toLowerCase().includes(expiredSearch.toLowerCase());
                            const matchesFilter = expiredFilter === 'all' || doc.document === expiredFilter;
                            return matchesSearch && matchesFilter;
                          });
                          
                          const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Expired Documents Report</title>
    <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 10px; color: #333; line-height: 1.2; font-size: 11px; }
        .header { text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-bottom: 15px; }
        table { border-collapse: collapse; width: 100%; font-size: 10px; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: center; white-space: nowrap; }
        th { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; font-weight: bold; }
        .expired { background: #fef2f2; }
        .overdue { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Expired Documents Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>Total Expired Documents: ${filtered.length}</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Employee Name</th>
                <th>Document Type</th>
                <th>Expiry Date</th>
                <th>Days Overdue</th>
            </tr>
        </thead>
        <tbody>
            ${filtered.sort((a, b) => b.daysOverdue - a.daysOverdue).map((doc, index) => `
                <tr class="expired">
                    <td>${index + 1}</td>
                    <td>${doc.name}</td>
                    <td style="text-transform: capitalize;">${doc.document === 'medicalCard' ? 'Medical Card' : doc.document}</td>
                    <td>${formatDate(doc.expiryDate)}</td>
                    <td class="overdue">${doc.daysOverdue} days</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div style="margin-top: 20px; text-align: center; font-size: 8px; color: #666;">
        <p>Qatar Branch Management System - Employee Document Management</p>
    </div>
</body>
</html>`;
                          
                          const printWindow = window.open('', '_blank');
                          printWindow.document.write(pdfContent);
                          printWindow.document.close();
                          printWindow.focus();
                          
                          setTimeout(() => {
                            printWindow.print();
                            printWindow.close();
                          }, 250);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                  
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
                  
                  {/* Mobile Card View for Expired Documents */}
                  <div className="block lg:hidden">
                    <div className="divide-y divide-gray-200">
                      {(() => {
                        let filtered = analytics.expiredDocs.filter(doc => {
                          const matchesSearch = doc.name.toLowerCase().includes(expiredSearch.toLowerCase());
                          const matchesFilter = expiredFilter === 'all' || doc.document === expiredFilter;
                          return matchesSearch && matchesFilter;
                        });
                        
                        const startIndex = (expiredPage - 1) * docItemsPerPage;
                        const paginatedDocs = filtered.sort((a, b) => b.daysOverdue - a.daysOverdue).slice(startIndex, startIndex + docItemsPerPage);
                        
                        return paginatedDocs.map((doc, index) => (
                          <div key={index} className="p-4 hover:bg-red-50">
                            <div className="flex items-center space-x-3 mb-3">
                              {(() => {
                                const employee = users.find(u => u.name === doc.name);
                                return employee?.documents?.profilePicture?.url ? (
                                  <img 
                                    src={employee.documents.profilePicture.url} 
                                    alt={doc.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-red-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 font-bold text-sm">{doc.name.charAt(0).toUpperCase()}</span>
                                  </div>
                                );
                              })()}
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
                                const employee = users.find(u => u.name === doc.name);
                                if (employee && onEditUser) {
                                  onEditUser(employee._id);
                                }
                              }}
                              className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                            >
                              Edit Employee
                            </button>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                  
                  {/* Desktop Table View for Expired Documents */}
                  <div className="hidden lg:block overflow-x-auto scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-100">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Employee
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Document
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 9a2 2 0 002 2h8a2 2 0 002-2l-2-9" />
                              </svg>
                              Expired Date
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Overdue
                            </div>
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {(() => {
                          let filtered = analytics.expiredDocs.filter(doc => {
                            const matchesSearch = doc.name.toLowerCase().includes(expiredSearch.toLowerCase());
                            const matchesFilter = expiredFilter === 'all' || doc.document === expiredFilter;
                            return matchesSearch && matchesFilter;
                          });
                          
                          const startIndex = (expiredPage - 1) * docItemsPerPage;
                          const paginatedDocs = filtered.sort((a, b) => b.daysOverdue - a.daysOverdue).slice(startIndex, startIndex + docItemsPerPage);
                          
                          return paginatedDocs.map((doc, index) => (
                            <tr key={index} className="hover:bg-red-50 transition-colors duration-200 group">
                              <td className="px-6 py-5">
                                <div className="flex items-center">
                                  {(() => {
                                    const employee = users.find(u => u.name === doc.name);
                                    return employee?.documents?.profilePicture?.url ? (
                                      <img 
                                        src={employee.documents.profilePicture.url} 
                                        alt={doc.name}
                                        className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-red-200"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-red-600 font-bold text-sm">{doc.name.charAt(0).toUpperCase()}</span>
                                      </div>
                                    );
                                  })()}
                                  <div className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">{doc.name}</div>
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
                                <div className="text-xs text-gray-500">Expired on this date</div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center">
                                  <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm">
                                    <div className="flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      </svg>
                                      {doc.daysOverdue} days
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <button
                                  onClick={() => {
                                    const employee = users.find(u => u.name === doc.name);
                                    if (employee && onEditUser) {
                                      onEditUser(employee._id);
                                    }
                                  }}
                                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {(() => {
                    const filtered = analytics.expiredDocs.filter(doc => {
                      const matchesSearch = doc.name.toLowerCase().includes(expiredSearch.toLowerCase());
                      const matchesFilter = expiredFilter === 'all' || doc.document === expiredFilter;
                      return matchesSearch && matchesFilter;
                    });
                    const totalPages = Math.ceil(filtered.length / docItemsPerPage);
                    
                    if (totalPages > 1) {
                      return (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                          <div className="text-sm text-gray-700">
                            Showing {Math.min((expiredPage - 1) * docItemsPerPage + 1, filtered.length)} to {Math.min(expiredPage * docItemsPerPage, filtered.length)} of {filtered.length} results
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setExpiredPage(Math.max(1, expiredPage - 1))}
                              disabled={expiredPage === 1}
                              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => setExpiredPage(Math.min(totalPages, expiredPage + 1))}
                              disabled={expiredPage === totalPages}
                              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                </>
              )}

              {/* Expiring Documents */}
              {analytics.expiringDocs.length > 0 && (
                <>
                  {/* Expiring Documents Search & Filter */}
                  <div className="bg-white rounded-lg shadow mb-4 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Search expiring documents..."
                          value={expiringSearch}
                          onChange={(e) => setExpiringSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <select
                        value={expiringFilter}
                        onChange={(e) => setExpiringFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="all">All Documents</option>
                        <option value="qid">QID</option>
                        <option value="passport">Passport</option>
                        <option value="visa">Visa</option>
                        <option value="medicalCard">Medical Card</option>
                      </select>
                    </div>
                  </div>
                  
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
                  
                  {/* Mobile Card View for Expiring Documents */}
                  <div className="block lg:hidden">
                    <div className="divide-y divide-gray-200">
                      {(() => {
                        let filtered = analytics.expiringDocs.filter(doc => {
                          const matchesSearch = doc.name.toLowerCase().includes(expiringSearch.toLowerCase());
                          const matchesFilter = expiringFilter === 'all' || doc.document === expiringFilter;
                          return matchesSearch && matchesFilter;
                        });
                        
                        const startIndex = (expiringPage - 1) * docItemsPerPage;
                        const paginatedDocs = filtered.sort((a, b) => a.daysLeft - b.daysLeft).slice(startIndex, startIndex + docItemsPerPage);
                        
                        return paginatedDocs.map((doc, index) => (
                          <div key={index} className="p-4 hover:bg-orange-50">
                            <div className="flex items-center space-x-3 mb-3">
                              {(() => {
                                const employee = users.find(u => u.name === doc.name);
                                return employee?.documents?.profilePicture?.url ? (
                                  <img 
                                    src={employee.documents.profilePicture.url} 
                                    alt={doc.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-600 font-bold text-sm">{doc.name.charAt(0).toUpperCase()}</span>
                                  </div>
                                );
                              })()}
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
                                const employee = users.find(u => u.name === doc.name);
                                if (employee && onEditUser) {
                                  onEditUser(employee._id);
                                }
                              }}
                              className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                            >
                              Edit Employee
                            </button>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                  
                  {/* Desktop Table View for Expiring Documents */}
                  <div className="hidden lg:block overflow-x-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Employee
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Document
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 9a2 2 0 002 2h8a2 2 0 002-2l-2-9" />
                              </svg>
                              Expiry Date
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Time Left
                            </div>
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {(() => {
                          let filtered = analytics.expiringDocs.filter(doc => {
                            const matchesSearch = doc.name.toLowerCase().includes(expiringSearch.toLowerCase());
                            const matchesFilter = expiringFilter === 'all' || doc.document === expiringFilter;
                            return matchesSearch && matchesFilter;
                          });
                          
                          const startIndex = (expiringPage - 1) * docItemsPerPage;
                          const paginatedDocs = filtered.sort((a, b) => a.daysLeft - b.daysLeft).slice(startIndex, startIndex + docItemsPerPage);
                          
                          return paginatedDocs.map((doc, index) => (
                            <tr key={index} className="hover:bg-orange-50 transition-colors duration-200 group">
                              <td className="px-6 py-5">
                                <div className="flex items-center">
                                  {(() => {
                                    const employee = users.find(u => u.name === doc.name);
                                    return employee?.documents?.profilePicture?.url ? (
                                      <img 
                                        src={employee.documents.profilePicture.url} 
                                        alt={doc.name}
                                        className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-orange-200"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-orange-600 font-bold text-sm">{doc.name.charAt(0).toUpperCase()}</span>
                                      </div>
                                    );
                                  })()}
                                  <div className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{doc.name}</div>
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
                                <div className="text-xs text-gray-500">Expires on this date</div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center">
                                  <div className={`px-3 py-2 rounded-lg text-xs font-bold shadow-sm ${
                                    doc.daysLeft <= 7 ? 'bg-red-600 text-white' : 
                                    doc.daysLeft <= 15 ? 'bg-orange-600 text-white' : 'bg-yellow-500 text-white'
                                  }`}>
                                    <div className="flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      </svg>
                                      {doc.daysLeft} days
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <button
                                  onClick={() => {
                                    const employee = users.find(u => u.name === doc.name);
                                    if (employee && onEditUser) {
                                      onEditUser(employee._id);
                                    }
                                  }}
                                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {(() => {
                    const filtered = analytics.expiringDocs.filter(doc => {
                      const matchesSearch = doc.name.toLowerCase().includes(expiringSearch.toLowerCase());
                      const matchesFilter = expiringFilter === 'all' || doc.document === expiringFilter;
                      return matchesSearch && matchesFilter;
                    });
                    const totalPages = Math.ceil(filtered.length / docItemsPerPage);
                    
                    if (totalPages > 1) {
                      return (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                          <div className="text-sm text-gray-700">
                            Showing {Math.min((expiringPage - 1) * docItemsPerPage + 1, filtered.length)} to {Math.min(expiringPage * docItemsPerPage, filtered.length)} of {filtered.length} results
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setExpiringPage(Math.max(1, expiringPage - 1))}
                              disabled={expiringPage === 1}
                              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => setExpiringPage(Math.min(totalPages, expiringPage + 1))}
                              disabled={expiringPage === totalPages}
                              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                </>
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
    </div>
  );
}