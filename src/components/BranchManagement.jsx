import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function BranchManagement({ branches, users, onEditBranch, onViewBranch, onAddBranch }) {
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeView, setActiveView] = useState('branches');
  const [documentSearchTerm, setDocumentSearchTerm] = useState('');
  const [documentFilter, setDocumentFilter] = useState('all');
  const [documentCurrentPage, setDocumentCurrentPage] = useState(1);
  const [expiringSoonSearchTerm, setExpiringSoonSearchTerm] = useState('');
  const [expiringSoonFilter, setExpiringSoonFilter] = useState('all');
  const [expiringSoonCurrentPage, setExpiringSoonCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const documentItemsPerPage = 5;

  useEffect(() => {
    let filtered = branches || [];
    
    if (locationFilter !== 'all') {
      filtered = filtered.filter(branch => branch.location === locationFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(branch => {
        const searchLower = searchTerm.toLowerCase();
        return (
          branch.name.toLowerCase().includes(searchLower) ||
          (branch.location || '').toLowerCase().includes(searchLower) ||
          (branch.manager || '').toLowerCase().includes(searchLower) ||
          (branch.contactNumber || '').toLowerCase().includes(searchLower)
        );
      });
    }
    
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'employeeCount') {
        aVal = a.assignedUsers?.length || 0;
        bVal = b.assignedUsers?.length || 0;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredBranches(filtered);
    setCurrentPage(1);
  }, [branches, searchTerm, locationFilter, sortField, sortDirection]);

  // Analytics calculations
  const analytics = {
    total: branches?.length || 0,
    totalEmployees: 0,
    totalVehicles: 0,
    totalDocuments: 0,
    byLocation: {},
    avgEmployeesPerBranch: 0,
    activeBranches: 0
  };

  analytics.totalEmployees = users?.length || 0;
  
  branches?.forEach(branch => {
    analytics.totalVehicles += branch.vehicles?.length || 0;
    
    // Count specific branch documents
    let branchDocCount = 0;
    if (branch.crExpiry) branchDocCount++;
    if (branch.ruksaExpiry) branchDocCount++;
    if (branch.computerCardExpiry) branchDocCount++;
    if (branch.certificationExpiry) branchDocCount++;
    analytics.totalDocuments += branchDocCount;
    
    analytics.byLocation[branch.location || 'Unknown'] = (analytics.byLocation[branch.location || 'Unknown'] || 0) + 1;
    
    // Count active branches based on actual employees
    const branchEmployeeCount = users?.filter(user => user.branch === branch.name).length || 0;
    if (branchEmployeeCount > 0) {
      analytics.activeBranches++;
    }
  });

  analytics.avgEmployeesPerBranch = analytics.total > 0 ? Math.round(analytics.totalEmployees / analytics.total) : 0;

  const getFilterOptions = (field) => {
    return [...new Set(branches?.map(branch => branch[field]).filter(Boolean) || [])];
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="responsive-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {analytics.total} Total Branches
          </div>
          <button
            onClick={() => onAddBranch && onAddBranch()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
          >
            + Add Branch
          </button>
        </div>
      </div>
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 p-4 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{analytics.total}</div>
              <div className="text-sm opacity-90">Total Branches</div>
              <div className="text-xs opacity-75 mt-1">{analytics.activeBranches} active</div>
            </div>
            <div className="text-3xl opacity-80">
              🏢
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-4 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{analytics.totalEmployees}</div>
              <div className="text-sm opacity-90">Total Employees</div>
              <div className="text-xs opacity-75 mt-1">Avg {analytics.avgEmployeesPerBranch} per branch</div>
            </div>
            <div className="text-3xl opacity-80">
              👥
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 p-4 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{analytics.totalVehicles}</div>
              <div className="text-sm opacity-90">Total Vehicles</div>
              <div className="text-xs opacity-75 mt-1">Fleet management</div>
            </div>
            <div className="text-3xl opacity-80">
              🚗
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-4 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{analytics.totalDocuments}</div>
              <div className="text-sm opacity-90">Total Documents</div>
              <div className="text-xs opacity-75 mt-1">Compliance tracking</div>
            </div>
            <div className="text-3xl opacity-80">
              📄
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 via-pink-500 to-red-600 p-4 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {(() => {
                  const today = new Date();
                  const thirtyDaysFromNow = new Date(Date.now() + 30*24*60*60*1000);
                  let expiringCount = 0;
                  
                  branches?.forEach(branch => {
                    if (branch.crExpiry && new Date(branch.crExpiry) <= thirtyDaysFromNow) expiringCount++;
                    if (branch.ruksaExpiry && new Date(branch.ruksaExpiry) <= thirtyDaysFromNow) expiringCount++;
                    if (branch.computerCardExpiry && new Date(branch.computerCardExpiry) <= thirtyDaysFromNow) expiringCount++;
                    if (branch.certificationExpiry && new Date(branch.certificationExpiry) <= thirtyDaysFromNow) expiringCount++;
                  });
                  
                  return expiringCount;
                })()
              }</div>
              <div className="text-sm opacity-90">Expiring Docs</div>
              <div className="text-xs opacity-75 mt-1">Need attention</div>
            </div>
            <div className="text-3xl opacity-80">
              ⚠️
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Active Branches</span>
              </div>
              <span className="text-lg font-bold text-green-600">{analytics.activeBranches}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Inactive Branches</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{analytics.total - analytics.activeBranches}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Avg Employees/Branch</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{analytics.avgEmployeesPerBranch}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Total Fleet Size</span>
              </div>
              <span className="text-lg font-bold text-orange-600">{analytics.totalVehicles}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Largest Branch</span>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {(() => {
                  let maxEmployees = 0;
                  let largestBranch = 'N/A';
                  branches?.forEach(branch => {
                    const empCount = users?.filter(user => user.branch === branch.name).length || 0;
                    if (empCount > maxEmployees) {
                      maxEmployees = empCount;
                      largestBranch = branch.name;
                    }
                  });
                  return maxEmployees > 0 ? `${largestBranch} (${maxEmployees})` : 'N/A';
                })()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Document Compliance</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">
                {(() => {
                  let totalPossibleDocs = branches?.length * 4 || 0; // 4 docs per branch
                  let actualDocs = analytics.totalDocuments;
                  return totalPossibleDocs > 0 ? `${Math.round((actualDocs/totalPossibleDocs)*100)}%` : '0%';
                })()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Avg Vehicles/Branch</span>
              </div>
              <span className="text-lg font-bold text-indigo-600">
                {analytics.total > 0 ? Math.round(analytics.totalVehicles / analytics.total) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>



      {/* Search and Filters - Only show for branches tab */}
      {activeView === 'branches' && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Locations</option>
              {getFilterOptions('location').map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
            <span>Showing {filteredBranches.length} of {analytics.total} branches</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('all');
              }}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveView('branches')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'branches'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Branch Management
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                {analytics.total}
              </span>
            </button>
            <button
              onClick={() => setActiveView('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'documents'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Document Expiry
              <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                (() => {
                  const today = new Date();
                  const thirtyDaysFromNow = new Date(Date.now() + 30*24*60*60*1000);
                  let expiringCount = 0;
                  
                  branches?.forEach(branch => {
                    if (branch.crExpiry && new Date(branch.crExpiry) <= thirtyDaysFromNow) expiringCount++;
                    if (branch.ruksaExpiry && new Date(branch.ruksaExpiry) <= thirtyDaysFromNow) expiringCount++;
                    if (branch.computerCardExpiry && new Date(branch.computerCardExpiry) <= thirtyDaysFromNow) expiringCount++;
                    if (branch.certificationExpiry && new Date(branch.certificationExpiry) <= thirtyDaysFromNow) expiringCount++;
                  });
                  
                  return expiringCount > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-900';
                })()
              }`}>
                {(() => {
                  const today = new Date();
                  const thirtyDaysFromNow = new Date(Date.now() + 30*24*60*60*1000);
                  let expiringCount = 0;
                  
                  branches?.forEach(branch => {
                    if (branch.crExpiry && new Date(branch.crExpiry) <= thirtyDaysFromNow) expiringCount++;
                    if (branch.ruksaExpiry && new Date(branch.ruksaExpiry) <= thirtyDaysFromNow) expiringCount++;
                    if (branch.computerCardExpiry && new Date(branch.computerCardExpiry) <= thirtyDaysFromNow) expiringCount++;
                    if (branch.certificationExpiry && new Date(branch.certificationExpiry) <= thirtyDaysFromNow) expiringCount++;
                  });
                  
                  return expiringCount;
                })()
              }</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Branch Management Table */}
      {activeView === 'branches' && filteredBranches.length > 0 ? (
        <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Branch</span>
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Location & Manager</span>
                      <SortIcon field="location" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                    Resources
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedBranches.map((branch, index) => {
                  const colors = [
                    'from-blue-400 to-blue-600',
                    'from-emerald-400 to-green-600', 
                    'from-purple-400 to-purple-600',
                    'from-pink-400 to-pink-600',
                    'from-indigo-400 to-indigo-600',
                    'from-teal-400 to-teal-600',
                    'from-orange-400 to-orange-600'
                  ];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                  <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-14 w-14">
                          {branch.branchDocuments?.logoDocument?.url ? (
                            <img 
                              src={branch.branchDocuments.logoDocument.url} 
                              alt={`${branch.name} logo`}
                              className="h-14 w-14 rounded-full object-cover shadow-lg"
                            />
                          ) : (
                            <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                              <span className="text-xl font-bold text-white">
                                {branch.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{branch.name}</div>
                          <div className="text-sm text-gray-500">{branch.address || 'No address'}</div>
                          <div className="text-xs text-gray-400 mt-1">ID: {branch._id?.slice(-6) || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{branch.location || 'N/A'}</div>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800">
                          {branch.manager || 'No Manager'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        {branch.contactNumber || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        {branch.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                        Visa Added Branch Employees: {users?.filter(user => user.visaAddedBranch === branch.name).length || 0}
                      </div>
                      <div className="text-sm text-gray-900 flex items-center">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                        Working Employees: {users?.filter(user => user.workLocation === branch.name).length || 0}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                        {branch.vehicles?.length || 0} vehicles
                      </div>
                      <div className="text-xs text-gray-400 flex items-center">
                        <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                        {(() => {
                          let docCount = 0;
                          if (branch.branchDocuments?.crDocument?.url) docCount++;
                          if (branch.branchDocuments?.ruksaDocument?.url) docCount++;
                          if (branch.branchDocuments?.computerCardDocument?.url) docCount++;
                          if (branch.branchDocuments?.certificationDocument?.url) docCount++;
                          if (branch.branchDocuments?.taxCardDocument?.url) docCount++;
                          if (branch.branchDocuments?.logoDocument?.url) docCount++;
                          if (branch.branchDocuments?.letterheadDocument?.url) docCount++;
                          return docCount;
                        })()} documents
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        (users?.filter(user => user.branch === branch.name).length || 0) > 0 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' 
                          : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800'
                      }`}>
                        {(users?.filter(user => user.branch === branch.name).length || 0) > 0 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => onViewBranch && onViewBranch(branch)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-emerald-700 bg-gradient-to-r from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-sm"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button 
                          onClick={() => onEditBranch && onEditBranch(branch._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
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
                      <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredBranches.length)}</span> of{' '}
                      <span className="font-medium">{filteredBranches.length}</span> results
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
        ) : activeView === 'branches' && branches?.length > 0 ? (
          <div className="bg-white shadow sm:rounded-lg p-6 text-center">
            <p className="text-gray-500">No branches match your search criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('all');
              }}
              className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : activeView === 'branches' ? (
          <div className="bg-white shadow sm:rounded-lg p-6 text-center">
            <p className="text-gray-500">No branches available</p>
          </div>
        ) : null}



      {/* Document Status Overview */}
      {activeView === 'documents' && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Status Overview</h3>
          <div className="space-y-4">
            {(() => {
              const today = new Date();
              const thirtyDaysFromNow = new Date(Date.now() + 30*24*60*60*1000);
              let expired = 0, critical = 0, warning = 0, total = 0;
              
              const docTypes = { cr: 0, ruksa: 0, computerCard: 0, certification: 0 };
              const expiredTypes = { cr: 0, ruksa: 0, computerCard: 0, certification: 0 };
              const expiringSoonTypes = { cr: 0, ruksa: 0, computerCard: 0, certification: 0 };
              const validTypes = { cr: 0, ruksa: 0, computerCard: 0, certification: 0 };
              
              branches?.forEach(branch => {
                const docs = [
                  { type: 'cr', expiry: branch.crExpiry },
                  { type: 'ruksa', expiry: branch.ruksaExpiry },
                  { type: 'computerCard', expiry: branch.computerCardExpiry },
                  { type: 'certification', expiry: branch.certificationExpiry }
                ];
                
                docs.forEach(doc => {
                  if (doc.expiry) {
                    docTypes[doc.type]++;
                    const expiryDate = new Date(doc.expiry);
                    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                    
                    if (daysLeft < 0) {
                      expired++;
                      expiredTypes[doc.type]++;
                    } else if (daysLeft <= 30) {
                      if (daysLeft <= 7) critical++;
                      else warning++;
                      expiringSoonTypes[doc.type]++;
                    } else {
                      validTypes[doc.type]++;
                    }
                    
                    if (expiryDate <= thirtyDaysFromNow) total++;
                  }
                });
              });
              
              return (
                <>
                  <div className="mb-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">Expired Documents</span>
                      </div>
                      <span className="text-lg font-bold text-red-600">{expired}</span>
                    </div>
                    {expired > 0 && (
                      <div className="ml-6 space-y-1 text-xs">
                        {expiredTypes.cr > 0 && <div className="text-gray-600">Company CR: {expiredTypes.cr}</div>}
                        {expiredTypes.ruksa > 0 && <div className="text-gray-600">Ruksa: {expiredTypes.ruksa}</div>}
                        {expiredTypes.computerCard > 0 && <div className="text-gray-600">Computer Card: {expiredTypes.computerCard}</div>}
                        {expiredTypes.certification > 0 && <div className="text-gray-600">Certification: {expiredTypes.certification}</div>}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">Expiring Soon</span>
                      </div>
                      <span className="text-lg font-bold text-yellow-600">{warning + critical}</span>
                    </div>
                    {(warning + critical) > 0 && (
                      <div className="ml-6 space-y-1 text-xs">
                        {expiringSoonTypes.cr > 0 && <div className="text-gray-600">Company CR: {expiringSoonTypes.cr}</div>}
                        {expiringSoonTypes.ruksa > 0 && <div className="text-gray-600">Ruksa: {expiringSoonTypes.ruksa}</div>}
                        {expiringSoonTypes.computerCard > 0 && <div className="text-gray-600">Computer Card: {expiringSoonTypes.computerCard}</div>}
                        {expiringSoonTypes.certification > 0 && <div className="text-gray-600">Certification: {expiringSoonTypes.certification}</div>}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">Valid Documents</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">{validTypes.cr + validTypes.ruksa + validTypes.computerCard + validTypes.certification}</span>
                    </div>
                    {(validTypes.cr + validTypes.ruksa + validTypes.computerCard + validTypes.certification) > 0 && (
                      <div className="ml-6 space-y-1 text-xs">
                        {validTypes.cr > 0 && <div className="text-gray-600">Company CR: {validTypes.cr}</div>}
                        {validTypes.ruksa > 0 && <div className="text-gray-600">Ruksa: {validTypes.ruksa}</div>}
                        {validTypes.computerCard > 0 && <div className="text-gray-600">Computer Card: {validTypes.computerCard}</div>}
                        {validTypes.certification > 0 && <div className="text-gray-600">Certification: {validTypes.certification}</div>}
                      </div>
                    )}
                  </div>
                </>
              );
            })()
          }
          </div>
        </div>
      )}



      {/* Expired Documents Table */}
      {activeView === 'documents' && (
        <div className="bg-white rounded-xl shadow-xl border border-red-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="ext-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Expired Documents
                </h3>
                <p className="text-red-100 text-sm font-normal">Urgent Action Required</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                {(() => {
                  const today = new Date();
                  let expiredCount = 0;
                  branches?.forEach(branch => {
                    if (branch.crExpiry && new Date(branch.crExpiry) < today) expiredCount++;
                    if (branch.ruksaExpiry && new Date(branch.ruksaExpiry) < today) expiredCount++;
                    if (branch.computerCardExpiry && new Date(branch.computerCardExpiry) < today) expiredCount++;
                    if (branch.certificationExpiry && new Date(branch.certificationExpiry) < today) expiredCount++;
                  });
                  return expiredCount;
                })()} Documents
              </div>
            </div>
            
            {/* Search and Filter for Expired Documents */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search expired documents by branch name..."
                  value={documentSearchTerm}
                  onChange={(e) => setDocumentSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={documentFilter}
                  onChange={(e) => setDocumentFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Document Types</option>
                  <option value="cr">Company CR</option>
                  <option value="ruksa">Ruksa License</option>
                  <option value="computerCard">Computer Card</option>
                  <option value="certification">Certification</option>
                </select>
                <button
                  onClick={() => {
                    setDocumentSearchTerm('');
                    setDocumentFilter('all');
                    setDocumentCurrentPage(1);
                  }}
                  className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Branch Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Document Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Document Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Expired Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Days Overdue
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                const expiredRows = [];
                const today = new Date();
                
                branches?.forEach(branch => {
                  const docs = [
                    { type: 'Company CR', typeKey: 'cr', number: branch.crNumber, expiry: branch.crExpiry },
                    { type: 'Ruksa License', typeKey: 'ruksa', number: branch.ruksaNumber, expiry: branch.ruksaExpiry },
                    { type: 'Computer Card', typeKey: 'computerCard', number: branch.computerCardNumber, expiry: branch.computerCardExpiry },
                    { type: 'Certification', typeKey: 'certification', number: branch.certificationNumber, expiry: branch.certificationExpiry }
                  ];
                  
                  docs.forEach(doc => {
                    if (doc.expiry) {
                      const expiryDate = new Date(doc.expiry);
                      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                      
                      if (daysLeft < 0) {
                        expiredRows.push({ branch, docType: doc.type, typeKey: doc.typeKey, docNumber: doc.number || 'N/A', expiryDate: doc.expiry, daysLeft });
                      }
                    }
                  });
                });
                
                // Filter based on search and filter criteria
                let filteredRows = expiredRows;
                
                if (documentSearchTerm) {
                  filteredRows = filteredRows.filter(row => 
                    row.branch.name.toLowerCase().includes(documentSearchTerm.toLowerCase()) ||
                    row.branch.location?.toLowerCase().includes(documentSearchTerm.toLowerCase())
                  );
                }
                
                if (documentFilter !== 'all') {
                  filteredRows = filteredRows.filter(row => row.typeKey === documentFilter);
                }
                
                // Pagination
                const startIndex = (documentCurrentPage - 1) * documentItemsPerPage;
                const paginatedRows = filteredRows.slice(startIndex, startIndex + documentItemsPerPage);
                
                return paginatedRows.sort((a, b) => a.daysLeft - b.daysLeft).map((row, index) => (
                  <tr key={index} className="hover:bg-red-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {row.branch.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{row.branch.name}</div>
                          <div className="text-sm text-gray-500">{row.branch.location || 'No location'}</div>
                          <div className="text-xs text-gray-400 mt-1">Manager: {row.branch.manager || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded bg-red-100 text-red-800">
                        {row.docType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{row.docNumber}</div>
                      <div className="text-xs text-gray-500">Document ID</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(row.expiryDate).toLocaleDateString()}</div>
                      <div className="text-xs text-red-500">Expired on this date</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                        {Math.abs(row.daysLeft)} days
                      </div>
                      <div className="text-xs text-red-600 mt-1">overdue</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => onEditBranch && onEditBranch(row.branch._id)} 
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Update
                      </button>
                    </td>
                  </tr>
                ));
              })()
            }
            </tbody>
          </table>
          
          {/* Pagination for Expired Documents */}
          {(() => {
            const expiredRows = [];
            const today = new Date();
            
            branches?.forEach(branch => {
              const docs = [
                { typeKey: 'cr', expiry: branch.crExpiry },
                { typeKey: 'ruksa', expiry: branch.ruksaExpiry },
                { typeKey: 'computerCard', expiry: branch.computerCardExpiry },
                { typeKey: 'certification', expiry: branch.certificationExpiry }
              ];
              
              docs.forEach(doc => {
                if (doc.expiry && new Date(doc.expiry) < today) {
                  expiredRows.push({ branch, typeKey: doc.typeKey });
                }
              });
            });
            
            let filteredRows = expiredRows;
            if (documentSearchTerm) {
              filteredRows = filteredRows.filter(row => 
                row.branch.name.toLowerCase().includes(documentSearchTerm.toLowerCase())
              );
            }
            if (documentFilter !== 'all') {
              filteredRows = filteredRows.filter(row => row.typeKey === documentFilter);
            }
            
            const totalPages = Math.ceil(filteredRows.length / documentItemsPerPage);
            
            return totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setDocumentCurrentPage(Math.max(1, documentCurrentPage - 1))}
                    disabled={documentCurrentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setDocumentCurrentPage(Math.min(totalPages, documentCurrentPage + 1))}
                    disabled={documentCurrentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((documentCurrentPage - 1) * documentItemsPerPage) + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(documentCurrentPage * documentItemsPerPage, filteredRows.length)}</span> of{' '}
                      <span className="font-medium">{filteredRows.length}</span> expired documents
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setDocumentCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              documentCurrentPage === pageNum
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
            );
          })()
          }
        </div>
      )}

      {/* Expiring Soon Documents Table */}
      {activeView === 'documents' && (
        <div className="bg-white rounded-xl shadow-xl border border-orange-200 overflow-hidden mt-5">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-orange-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Documents Expiring Soon
                </h3>
                <p className="text-orange-100 text-sm font-normal">Renewal Required Within 30 Days</p>
              </div>
              <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {(() => {
                  const today = new Date();
                  const thirtyDaysFromNow = new Date(Date.now() + 30*24*60*60*1000);
                  let expiringCount = 0;
                  branches?.forEach(branch => {
                    if (branch.crExpiry && new Date(branch.crExpiry) > today && new Date(branch.crExpiry) <= thirtyDaysFromNow) expiringCount++;
                    if (branch.ruksaExpiry && new Date(branch.ruksaExpiry) > today && new Date(branch.ruksaExpiry) <= thirtyDaysFromNow) expiringCount++;
                    if (branch.computerCardExpiry && new Date(branch.computerCardExpiry) > today && new Date(branch.computerCardExpiry) <= thirtyDaysFromNow) expiringCount++;
                    if (branch.certificationExpiry && new Date(branch.certificationExpiry) > today && new Date(branch.certificationExpiry) <= thirtyDaysFromNow) expiringCount++;
                  });
                  return expiringCount;
                })()} Documents
              </div>
            </div>
            
            {/* Search and Filter for Expiring Soon Documents */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search expiring documents by branch name..."
                  value={expiringSoonSearchTerm}
                  onChange={(e) => setExpiringSoonSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={expiringSoonFilter}
                  onChange={(e) => setExpiringSoonFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Document Types</option>
                  <option value="cr">Company CR</option>
                  <option value="ruksa">Ruksa License</option>
                  <option value="computerCard">Computer Card</option>
                  <option value="certification">Certification</option>
                </select>
                <button
                  onClick={() => {
                    setExpiringSoonSearchTerm('');
                    setExpiringSoonFilter('all');
                    setExpiringSoonCurrentPage(1);
                  }}
                  className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                  Branch Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                  Document Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                  Document Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                  Days Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                const expiringRows = [];
                const today = new Date();
                const thirtyDaysFromNow = new Date(Date.now() + 30*24*60*60*1000);
                
                branches?.forEach(branch => {
                  const docs = [
                    { type: 'Company CR', typeKey: 'cr', number: branch.crNumber, expiry: branch.crExpiry },
                    { type: 'Ruksa License', typeKey: 'ruksa', number: branch.ruksaNumber, expiry: branch.ruksaExpiry },
                    { type: 'Computer Card', typeKey: 'computerCard', number: branch.computerCardNumber, expiry: branch.computerCardExpiry },
                    { type: 'Certification', typeKey: 'certification', number: branch.certificationNumber, expiry: branch.certificationExpiry }
                  ];
                  
                  docs.forEach(doc => {
                    if (doc.expiry) {
                      const expiryDate = new Date(doc.expiry);
                      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                      
                      if (daysLeft >= 0 && daysLeft <= 30) {
                        expiringRows.push({ branch, docType: doc.type, typeKey: doc.typeKey, docNumber: doc.number || 'N/A', expiryDate: doc.expiry, daysLeft });
                      }
                    }
                  });
                });
                
                // Filter based on search and filter criteria
                let filteredRows = expiringRows;
                
                if (expiringSoonSearchTerm) {
                  filteredRows = filteredRows.filter(row => 
                    row.branch.name.toLowerCase().includes(expiringSoonSearchTerm.toLowerCase()) ||
                    row.branch.location?.toLowerCase().includes(expiringSoonSearchTerm.toLowerCase())
                  );
                }
                
                if (expiringSoonFilter !== 'all') {
                  filteredRows = filteredRows.filter(row => row.typeKey === expiringSoonFilter);
                }
                
                // Pagination
                const startIndex = (expiringSoonCurrentPage - 1) * documentItemsPerPage;
                const paginatedRows = filteredRows.slice(startIndex, startIndex + documentItemsPerPage);
                
                return paginatedRows.sort((a, b) => a.daysLeft - b.daysLeft).map((row, index) => (
                  <tr key={index} className="hover:bg-orange-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {row.branch.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{row.branch.name}</div>
                          <div className="text-sm text-gray-500">{row.branch.location || 'No location'}</div>
                          <div className="text-xs text-gray-400 mt-1">Manager: {row.branch.manager || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded bg-orange-100 text-orange-800">
                        {row.docType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{row.docNumber}</div>
                      <div className="text-xs text-gray-500">Document ID</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(row.expiryDate).toLocaleDateString()}</div>
                      <div className="text-xs text-orange-500">Expires on this date</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`px-2 py-1 rounded text-sm font-medium ${
                        row.daysLeft <= 7 ? 'bg-red-100 text-red-700' : 
                        row.daysLeft <= 15 ? 'bg-orange-100 text-orange-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {row.daysLeft} days
                      </div>
                      <div className="text-xs text-gray-500 mt-1">remaining</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => onEditBranch && onEditBranch(row.branch._id)} 
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Renew
                      </button>
                    </td>
                  </tr>
                ));
              })()
            }
            </tbody>
          </table>
          
          {/* Pagination for Expiring Soon Documents */}
          {(() => {
            const expiringRows = [];
            const today = new Date();
            
            branches?.forEach(branch => {
              const docs = [
                { typeKey: 'cr', expiry: branch.crExpiry },
                { typeKey: 'ruksa', expiry: branch.ruksaExpiry },
                { typeKey: 'computerCard', expiry: branch.computerCardExpiry },
                { typeKey: 'certification', expiry: branch.certificationExpiry }
              ];
              
              docs.forEach(doc => {
                if (doc.expiry) {
                  const expiryDate = new Date(doc.expiry);
                  const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                  
                  if (daysLeft >= 0 && daysLeft <= 30) {
                    expiringRows.push({ branch, typeKey: doc.typeKey });
                  }
                }
              });
            });
            
            let filteredRows = expiringRows;
            if (expiringSoonSearchTerm) {
              filteredRows = filteredRows.filter(row => 
                row.branch.name.toLowerCase().includes(expiringSoonSearchTerm.toLowerCase())
              );
            }
            if (expiringSoonFilter !== 'all') {
              filteredRows = filteredRows.filter(row => row.typeKey === expiringSoonFilter);
            }
            
            const totalPages = Math.ceil(filteredRows.length / documentItemsPerPage);
            
            return totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setExpiringSoonCurrentPage(Math.max(1, expiringSoonCurrentPage - 1))}
                    disabled={expiringSoonCurrentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setExpiringSoonCurrentPage(Math.min(totalPages, expiringSoonCurrentPage + 1))}
                    disabled={expiringSoonCurrentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((expiringSoonCurrentPage - 1) * documentItemsPerPage) + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(expiringSoonCurrentPage * documentItemsPerPage, filteredRows.length)}</span> of{' '}
                      <span className="font-medium">{filteredRows.length}</span> expiring documents
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setExpiringSoonCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              expiringSoonCurrentPage === pageNum
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
            );
          })()
          }
        </div>
      )}
      </div>
  );
}