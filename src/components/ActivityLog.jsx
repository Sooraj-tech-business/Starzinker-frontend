import { useState, useEffect } from 'react';
import api from '../api/config';

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/activities');
        
        if (response.data && Array.isArray(response.data)) {
          setActivities(response.data);
        } else {
          const mockActivities = generateMockActivities(50);
          setActivities(mockActivities);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        const mockActivities = generateMockActivities(50);
        setActivities(mockActivities);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);
  
  // Filter and sort activities
  useEffect(() => {
    let filtered = activities || [];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.entityName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }
    
    // Apply entity filter
    if (entityFilter !== 'all') {
      filtered = filtered.filter(activity => activity.entityType === entityFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(activity => new Date(activity.createdAt) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(activity => new Date(activity.createdAt) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(activity => new Date(activity.createdAt) >= filterDate);
          break;
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredActivities(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [activities, searchTerm, typeFilter, entityFilter, dateFilter, sortField, sortDirection, itemsPerPage]);

  // Generate mock activities for testing
  const generateMockActivities = (count) => {
    const types = ['user_created', 'user_updated', 'user_deleted', 'branch_created', 'branch_updated', 'branch_deleted', 'vehicle_added', 'vehicle_updated', 'vehicle_deleted', 'document_expired', 'login', 'logout'];
    const entities = ['John Doe', 'Jane Smith', 'Main Branch', 'Secondary Branch', 'Toyota Camry', 'Honda Civic', 'QID Document', 'Passport', 'Admin User', 'Manager'];
    const entityTypes = ['user', 'employee', 'branch', 'vehicle', 'document', 'system'];
    
    return Array.from({ length: count }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const entityName = entities[Math.floor(Math.random() * entities.length)];
      const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
      
      return {
        _id: `activity_${i + 1}`,
        type,
        description: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${entityName}`,
        entityName,
        entityType,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
      };
    });
  };
  
  // Analytics calculations
  const analytics = {
    total: activities.length,
    today: activities.filter(a => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(a.createdAt) >= today;
    }).length,
    thisWeek: activities.filter(a => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.createdAt) >= weekAgo;
    }).length,
    thisMonth: activities.filter(a => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(a.createdAt) >= monthAgo;
    }).length,
    byType: {},
    byEntity: {}
  };
  
  activities.forEach(activity => {
    analytics.byType[activity.type] = (analytics.byType[activity.type] || 0) + 1;
    analytics.byEntity[activity.entityType] = (analytics.byEntity[activity.entityType] || 0) + 1;
  });
  
  const getFilterOptions = (field) => {
    return [...new Set(activities?.map(activity => activity[field]).filter(Boolean) || [])];
  };
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_created':
      case 'employee_created':
        return (
          <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
            <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'user_updated':
      case 'employee_updated':
      case 'branch_updated':
      case 'vehicle_updated':
        return (
          <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
            <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'user_deleted':
      case 'employee_deleted':
      case 'branch_deleted':
      case 'vehicle_deleted':
        return (
          <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
            <svg className="h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      case 'login':
        return (
          <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
            <svg className="h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
            <svg className="h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Get current activities for pagination
  const getCurrentActivities = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredActivities.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="responsive-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <div className="text-sm text-gray-500">
          {analytics.total} Total Activities
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-indigo-600">{analytics.total}</div>
          <div className="text-sm text-gray-600">Total Activities</div>
          <div className="text-xs text-gray-400 mt-1">All time</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{analytics.today}</div>
          <div className="text-sm text-gray-600">Today</div>
          <div className="text-xs text-gray-400 mt-1">Last 24 hours</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{analytics.thisWeek}</div>
          <div className="text-sm text-gray-600">This Week</div>
          <div className="text-xs text-gray-400 mt-1">Last 7 days</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{analytics.thisMonth}</div>
          <div className="text-sm text-gray-600">This Month</div>
          <div className="text-xs text-gray-400 mt-1">Last 30 days</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Distribution by Type</h3>
          <div className="space-y-3">
            {Object.entries(analytics.byType).map(([type, count]) => {
              const percentage = ((count / analytics.total) * 100).toFixed(1);
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-indigo-500'];
              const colorIndex = Object.keys(analytics.byType).indexOf(type) % colors.length;
              return (
                <div key={type} className="flex items-center">
                  <div className="w-32 text-sm text-gray-600 truncate">{type.replace('_', ' ')}</div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colors[colorIndex]} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 w-12 text-right">{count}</div>
                  <div className="text-xs text-gray-500 w-12 text-right">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Distribution by Entity</h3>
          <div className="space-y-3">
            {Object.entries(analytics.byEntity).map(([entity, count]) => {
              const percentage = ((count / analytics.total) * 100).toFixed(1);
              return (
                <div key={entity} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600 truncate">{entity}</div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 w-12 text-right">{count}</div>
                  <div className="text-xs text-gray-500 w-12 text-right">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            {getFilterOptions('type').map(type => (
              <option key={type} value={type}>{type.replace('_', ' ')}</option>
            ))}
          </select>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Entities</option>
            {getFilterOptions('entityType').map(entity => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredActivities.length} of {analytics.total} activities</span>
          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setEntityFilter('all');
              setDateFilter('all');
            }}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Clear all filters
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Activities</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSort('createdAt')}
              className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center space-x-1"
            >
              <span>Sort by Date</span>
              <SortIcon field="createdAt" />
            </button>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
              {filteredActivities.length} Activities
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading activities...</p>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            {getCurrentActivities().length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {getCurrentActivities().map((activity) => (
                  <li key={activity._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center">
                      {getActivityIcon(activity.type)}
                      <div className="ml-3 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-medium text-indigo-600 truncate mb-1 sm:mb-0">
                            {activity.description}
                          </p>
                          <div className="sm:ml-2 flex-shrink-0">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {formatDate(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">
                            {activity.entityType} - {activity.entityName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-sm text-gray-500">No activities found</p>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 bg-gray-50 text-gray-500 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:block">
                  <p className="text-sm">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredActivities.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredActivities.length}</span> results
                  </p>
                </div>
                <div className="flex-1 flex justify-between sm:justify-end">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Previous
                  </button>
                  <div className="hidden md:flex mx-2">
                    {[...Array(Math.min(totalPages, 10)).keys()].map(number => (
                      <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`mx-1 relative inline-flex items-center px-4 py-2 border ${
                          currentPage === number + 1
                            ? 'bg-indigo-100 border-indigo-500 text-indigo-600'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        } text-sm font-medium rounded-md`}
                      >
                        {number + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                      currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}