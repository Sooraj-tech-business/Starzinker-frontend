import React, { useState, useEffect } from 'react';
import WideModal from './WideModal';
import AddVehicle from './AddVehicle';
import axios from 'axios';

export default function VehiclesManagement({ branches, onEditVehicle, onAddVehicle, onDeleteVehicle, selectedBranchId, selectedVehicleId }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('type');
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeView, setActiveView] = useState('vehicles');
  const itemsPerPage = 15;
  const [expiredDocsPage, setExpiredDocsPage] = useState(1);
  const [expiringSoonDocsPage, setExpiringSoonDocsPage] = useState(1);
  const docsPerPage = 10;
  
  // Memoize vehicles to prevent infinite re-renders
  const vehicles = React.useMemo(() => {
    const allVehicles = [];
    if (Array.isArray(branches)) {
      branches.forEach(branch => {
        if (branch.vehicles && Array.isArray(branch.vehicles)) {
          branch.vehicles.forEach(vehicle => {
            allVehicles.push({
              ...vehicle,
              branchId: branch._id,
              branchName: branch.name,
              make: vehicle.make || 'N/A',
              model: vehicle.model || 'N/A',
              year: vehicle.year || new Date().getFullYear(),
              color: vehicle.color || 'N/A',
              status: vehicle.status || 'active'
            });
          });
        }
      });
    }
    return allVehicles;
  }, [branches]);
  
  useEffect(() => {
    let filtered = vehicles || [];
    
    // Apply filters
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => {
        const status = isExpired(vehicle.licenseExpiry) || isExpired(vehicle.insuranceExpiry) ? 'Expired' :
                       isExpiringSoon(vehicle.licenseExpiry) || isExpiringSoon(vehicle.insuranceExpiry) ? 'Expiring Soon' : 'Valid';
        return status === statusFilter;
      });
    }
    if (branchFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.branchName === branchFilter);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.type === typeFilter);
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(vehicle => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (vehicle.type || '').toLowerCase().includes(searchLower) ||
          (vehicle.licenseNumber || '').toLowerCase().includes(searchLower) ||
          (vehicle.branchName || '').toLowerCase().includes(searchLower) ||
          (vehicle.make || '').toLowerCase().includes(searchLower) ||
          (vehicle.model || '').toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'licenseExpiry' || sortField === 'insuranceExpiry') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredVehicles(filtered);
    setCurrentPage(1);
  }, [vehicles, searchTerm, statusFilter, branchFilter, typeFilter, sortField, sortDirection]);
  
  const getFilterOptions = (field) => {
    return [...new Set(vehicles?.map(vehicle => vehicle[field]).filter(Boolean) || [])];
  };
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  
  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };
  
  // Set selected vehicle from URL params
  useEffect(() => {
    if (selectedBranchId && selectedVehicleId) {
      const vehicle = vehicles.find(v => 
        v.branchId === selectedBranchId && 
        v.licenseNumber === selectedVehicleId
      );
      if (vehicle) {
        setSelectedVehicle(vehicle);
      }
    }
  }, [selectedBranchId, selectedVehicleId, vehicles]);
  
  // Function to create abbreviation
  const getAbbreviation = (name) => {
    if (!name) return "NA";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };
  
  // Check if a vehicle's license is expiring soon (within 30 days)
  const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const expiryDate = new Date(dateStr);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };
  
  // Check if a vehicle's license is expired
  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const expiryDate = new Date(dateStr);
    return expiryDate < today;
  };
  
  // Analytics calculations
  const analytics = {
    total: vehicles.length,
    expired: vehicles.filter(v => isExpired(v.licenseExpiry) || isExpired(v.insuranceExpiry)).length,
    expiringSoon: vehicles.filter(v => isExpiringSoon(v.licenseExpiry) || isExpiringSoon(v.insuranceExpiry)).length,
    valid: vehicles.filter(v => !isExpired(v.licenseExpiry) && !isExpired(v.insuranceExpiry) && !isExpiringSoon(v.licenseExpiry) && !isExpiringSoon(v.insuranceExpiry)).length,
    licenseExpired: vehicles.filter(v => isExpired(v.licenseExpiry)).length,
    insuranceExpired: vehicles.filter(v => isExpired(v.insuranceExpiry)).length,
    byBranch: {},
    byType: {},
    byStatus: {}
  };
  
  // Populate analytics distributions
  vehicles.forEach(vehicle => {
    // Branch distribution
    analytics.byBranch[vehicle.branchName || 'Unassigned'] = (analytics.byBranch[vehicle.branchName || 'Unassigned'] || 0) + 1;
    
    // Type distribution
    analytics.byType[vehicle.type || 'Unknown'] = (analytics.byType[vehicle.type || 'Unknown'] || 0) + 1;
    
    // Status distribution
    const status = isExpired(vehicle.licenseExpiry) || isExpired(vehicle.insuranceExpiry) ? 'Expired' :
                   isExpiringSoon(vehicle.licenseExpiry) || isExpiringSoon(vehicle.insuranceExpiry) ? 'Expiring Soon' : 'Valid';
    analytics.byStatus[status] = (analytics.byStatus[status] || 0) + 1;
  });
  
  // Get status badge class based on expiry date
  const getStatusBadgeClass = (dateStr) => {
    if (isExpired(dateStr)) {
      return "bg-red-100 text-red-800";
    } else if (isExpiringSoon(dateStr)) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-green-100 text-green-800";
    }
  };
  
  // Get status text based on expiry date
  const getStatusText = (dateStr) => {
    if (isExpired(dateStr)) {
      return "Expired";
    } else if (isExpiringSoon(dateStr)) {
      return "Expiring Soon";
    } else {
      return "Valid";
    }
  };

  // Use the passed function for adding a vehicle
  const handleAddVehicleLocal = async (vehicleData) => {
    try {
      await onAddVehicle(vehicleData);
      setShowAddVehicle(false);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Failed to add vehicle: ' + error.message);
    }
  };
  
  // Use the passed function for deleting a vehicle
  const handleDeleteVehicleLocal = (licenseNumber, branchId) => {
    onDeleteVehicle(licenseNumber, branchId);
  };

  return (
    <div className="responsive-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {analytics.total} Total Vehicles
          </div>
          <button
            onClick={() => setShowAddVehicle(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Vehicle
          </button>
        </div>
      </div>



      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-indigo-600">{analytics.total}</div>
          <div className="text-sm text-gray-600">Total Vehicles</div>
          <div className="text-xs text-gray-400 mt-1">Fleet size</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{analytics.expired}</div>
          <div className="text-sm text-gray-600">Expired Documents</div>
          <div className="text-xs text-gray-400 mt-1">{((analytics.expired/analytics.total)*100 || 0).toFixed(1)}% of fleet</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{analytics.expiringSoon}</div>
          <div className="text-sm text-gray-600">Expiring Soon</div>
          <div className="text-xs text-gray-400 mt-1">Within 30 days</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{analytics.valid}</div>
          <div className="text-sm text-gray-600">Valid Documents</div>
          <div className="text-xs text-gray-400 mt-1">{((analytics.valid/analytics.total)*100 || 0).toFixed(1)}% compliant</div>
        </div>
      </div>

      {/* Charts Section */}
      {activeView === 'vehicles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Distribution by Branch</h3>
            <div className="space-y-3">
              {Object.entries(analytics.byBranch).map(([branch, count]) => {
                const percentage = ((count / analytics.total) * 100).toFixed(1);
                return (
                  <div key={branch} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600 truncate">{branch}</div>
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

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Distribution by Type</h3>
            <div className="space-y-3">
              {Object.entries(analytics.byType).map(([type, count]) => {
                const percentage = ((count / analytics.total) * 100).toFixed(1);
                const colors = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
                const colorIndex = Object.keys(analytics.byType).indexOf(type) % colors.length;
                return (
                  <div key={type} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600 truncate">{type}</div>
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
        </div>
      )}
      
      {/* Search and Filters - Only show on Vehicles tab */}
      {activeView === 'vehicles' && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search vehicles..."
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
              <option value="Valid">Valid</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Branches</option>
              {getFilterOptions('branchName').map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              {getFilterOptions('type').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
            <span>Showing {filteredVehicles.length} of {analytics.total} vehicles</span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setBranchFilter('all');
                  setTypeFilter('all');
                }}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Clear all filters
              </button>

            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Tabs */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveView('vehicles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'vehicles'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vehicles
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                {vehicles.length}
              </span>
            </button>
            <button
              onClick={() => setActiveView('documents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'documents'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents
              <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                analytics.expired > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-900'
              }`}>
                {(() => {
                  let totalDocs = 0;
                  vehicles.forEach(vehicle => {
                    if (vehicle.licenseExpiry) totalDocs++;
                    if (vehicle.insuranceExpiry) totalDocs++;
                  });
                  return totalDocs;
                })()}
              </span>
            </button>
          </nav>
        </div>
      </div>
      
      {/* Vehicle Documents Analytics */}
      {activeView === 'documents' && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Document Status Overview</h3>
          <div className="space-y-4">
            {(() => {
              const today = new Date();
              let expired = 0, critical = 0, warning = 0, total = 0;
              
              const docTypes = { license: 0, insurance: 0 };
              const expiredTypes = { license: 0, insurance: 0 };
              const expiringSoonTypes = { license: 0, insurance: 0 };
              const validTypes = { license: 0, insurance: 0 };
              
              vehicles?.forEach(vehicle => {
                const docs = [
                  { type: 'license', expiry: vehicle.licenseExpiry },
                  { type: 'insurance', expiry: vehicle.insuranceExpiry }
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
                    
                    total++;
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
                        {expiredTypes.license > 0 && <div className="text-gray-600">License: {expiredTypes.license}</div>}
                        {expiredTypes.insurance > 0 && <div className="text-gray-600">Insurance: {expiredTypes.insurance}</div>}
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
                        {expiringSoonTypes.license > 0 && <div className="text-gray-600">License: {expiringSoonTypes.license}</div>}
                        {expiringSoonTypes.insurance > 0 && <div className="text-gray-600">Insurance: {expiringSoonTypes.insurance}</div>}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">Valid Documents</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">{total - expired - warning - critical}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Expired Documents Table */}
      {activeView === 'documents' && (
        <div className="bg-white rounded-xl shadow-xl border border-red-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
            <h3 className="text-xl font-bold text-white flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div>Expired Vehicle Documents</div>
                <div className="text-red-100 text-sm font-normal">Urgent Action Required • {(() => {
                  const today = new Date();
                  let expired = 0;
                  vehicles.forEach(vehicle => {
                    if (vehicle.licenseExpiry && new Date(vehicle.licenseExpiry) < today) expired++;
                    if (vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) < today) expired++;
                  });
                  return expired;
                })()} documents</div>
              </div>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM7 9l4-4 4 4M7 9v6a2 2 0 002 2h6a2 2 0 002-2V9M7 9H5a2 2 0 00-2 2v6a2 2 0 002 2h2m10-8V9a2 2 0 00-2-2H9a2 2 0 00-2 2v0" />
                      </svg>
                      Vehicle
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Branch
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
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    const today = new Date();
                    const expiredDocs = [];
                    
                    filteredVehicles.forEach(vehicle => {
                      const docs = [
                        { type: 'Istimara', expiry: vehicle.licenseExpiry },
                        { type: 'Insurance', expiry: vehicle.insuranceExpiry }
                      ];
                      
                      docs.forEach(doc => {
                        if (doc.expiry) {
                          const expiryDate = new Date(doc.expiry);
                          const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                          
                          if (daysLeft < 0) {
                            expiredDocs.push({
                              vehicle,
                              documentType: doc.type,
                              expiryDate: doc.expiry,
                              daysLeft
                            });
                          }
                        }
                      });
                    });
                    
                    const expiredStartIndex = (expiredDocsPage - 1) * docsPerPage;
                    const paginatedExpiredDocs = expiredDocs.slice(expiredStartIndex, expiredStartIndex + docsPerPage);
                    const expiredTotalPages = Math.ceil(expiredDocs.length / docsPerPage);
                    
                    return (
                      <>
                        {paginatedExpiredDocs.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-red-800">
                                    {item.vehicle.type ? item.vehicle.type.substring(0, 2).toUpperCase() : 'VE'}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{item.vehicle.type}</div>
                                  <div className="text-sm text-gray-500">{item.vehicle.licenseNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vehicle.branchName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.documentType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.expiryDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{Math.abs(item.daysLeft)} days ago</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                              <button className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200" onClick={() => onEditVehicle(item.vehicle)}>Edit</button>
                            </td>
                          </tr>
                        ))}
                        {expiredTotalPages > 1 && (
                          <tr>
                            <td colSpan="6" className="px-6 py-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                  Showing {expiredStartIndex + 1} to {Math.min(expiredStartIndex + docsPerPage, expiredDocs.length)} of {expiredDocs.length} expired documents
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setExpiredDocsPage(expiredDocsPage - 1)}
                                    disabled={expiredDocsPage === 1}
                                    className="px-3 py-1 border border-gray-300 text-sm rounded disabled:opacity-50"
                                  >
                                    Previous
                                  </button>
                                  <span className="px-3 py-1 text-sm">{expiredDocsPage} of {expiredTotalPages}</span>
                                  <button
                                    onClick={() => setExpiredDocsPage(expiredDocsPage + 1)}
                                    disabled={expiredDocsPage === expiredTotalPages}
                                    className="px-3 py-1 border border-gray-300 text-sm rounded disabled:opacity-50"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Expiring Soon Documents Table */}
      {activeView === 'documents' && (
        <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-4 border-b border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Expiring Soon Vehicle Documents</h3>
            
            {/* Search and Filter for Expiring Soon */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search expiring documents..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Branches</option>
                {getFilterOptions('branchName').map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Types</option>
                {getFilterOptions('type').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Document Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Days Left</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    const today = new Date();
                    const expiringSoonDocs = [];
                    
                    filteredVehicles.forEach(vehicle => {
                      const docs = [
                        { type: 'Istimara', expiry: vehicle.licenseExpiry },
                        { type: 'Insurance', expiry: vehicle.insuranceExpiry }
                      ];
                      
                      docs.forEach(doc => {
                        if (doc.expiry) {
                          const expiryDate = new Date(doc.expiry);
                          const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                          
                          if (daysLeft >= 0 && daysLeft <= 30) {
                            expiringSoonDocs.push({
                              vehicle,
                              documentType: doc.type,
                              expiryDate: doc.expiry,
                              daysLeft
                            });
                          }
                        }
                      });
                    });
                    
                    const expiringSoonStartIndex = (expiringSoonDocsPage - 1) * docsPerPage;
                    const paginatedExpiringSoonDocs = expiringSoonDocs.slice(expiringSoonStartIndex, expiringSoonStartIndex + docsPerPage);
                    const expiringSoonTotalPages = Math.ceil(expiringSoonDocs.length / docsPerPage);
                    
                    return (
                      <>
                        {paginatedExpiringSoonDocs.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-yellow-800">
                                    {item.vehicle.type ? item.vehicle.type.substring(0, 2).toUpperCase() : 'VE'}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{item.vehicle.type}</div>
                                  <div className="text-sm text-gray-500">{item.vehicle.licenseNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vehicle.branchName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.documentType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.expiryDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.daysLeft <= 7 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.daysLeft <= 7 ? 'Critical' : 'Warning'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.daysLeft} days</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                              <button className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200" onClick={() => onEditVehicle(item.vehicle)}>Edit</button>
                            </td>
                          </tr>
                        ))}
                        {expiringSoonTotalPages > 1 && (
                          <tr>
                            <td colSpan="7" className="px-6 py-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                  Showing {expiringSoonStartIndex + 1} to {Math.min(expiringSoonStartIndex + docsPerPage, expiringSoonDocs.length)} of {expiringSoonDocs.length} expiring documents
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setExpiringSoonDocsPage(expiringSoonDocsPage - 1)}
                                    disabled={expiringSoonDocsPage === 1}
                                    className="px-3 py-1 border border-gray-300 text-sm rounded disabled:opacity-50"
                                  >
                                    Previous
                                  </button>
                                  <span className="px-3 py-1 text-sm">{expiringSoonDocsPage} of {expiringSoonTotalPages}</span>
                                  <button
                                    onClick={() => setExpiringSoonDocsPage(expiringSoonDocsPage + 1)}
                                    disabled={expiringSoonDocsPage === expiringSoonTotalPages}
                                    className="px-3 py-1 border border-gray-300 text-sm rounded disabled:opacity-50"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {activeView === 'vehicles' && filteredVehicles.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Vehicle</span>
                      <SortIcon field="type" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('branchName')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Branch</span>
                      <SortIcon field="branchName" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('licenseNumber')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Vehicle Number</span>
                      <SortIcon field="licenseNumber" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Istimara Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insurance Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVehicles.map((vehicle, index) => (
              <tr 
                key={index} 
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-800">
                        {vehicle.type ? vehicle.type.substring(0, 2).toUpperCase() : 'VE'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{vehicle.type || 'Vehicle'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-gray-800">{getAbbreviation(vehicle.branchName)}</span>
                    </div>
                    <div className="text-sm text-gray-500">{vehicle.branchName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{vehicle.licenseNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(vehicle.licenseExpiry)}`}>
                    {getStatusText(vehicle.licenseExpiry)}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    Expires: {vehicle.licenseExpiry ? new Date(vehicle.licenseExpiry).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(vehicle.insuranceExpiry)}`}>
                    {getStatusText(vehicle.insuranceExpiry)}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    Expires: {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                  <button 
                    className="mr-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    View
                  </button>
                  <button 
                    className="mr-2 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    onClick={() => onEditVehicle(vehicle)}
                  >
                    Edit
                  </button>
                  <button 
                    className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    onClick={() => handleDeleteVehicleLocal(vehicle.licenseNumber, vehicle.branchId)}
                  >
                    Delete
                  </button>
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
                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredVehicles.length)}</span> of{' '}
                    <span className="font-medium">{filteredVehicles.length}</span> results
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
      ) : activeView === 'vehicles' && vehicles?.length > 0 ? (
        <div className="bg-white shadow sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No vehicles match your search criteria</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setBranchFilter('all');
              setTypeFilter('all');
            }}
            className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : activeView === 'vehicles' ? (
        <div className="bg-white shadow sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No vehicles available</p>
        </div>
      ) : null}

      {/* Vehicle Details Modal */}
      <WideModal isOpen={selectedVehicle !== null} onClose={() => setSelectedVehicle(null)}>
        {selectedVehicle && (
          <div className="max-h-[90vh] overflow-y-auto">
            <div className="bg-indigo-600 px-6 py-4 rounded-t-lg">
              <div className="flex items-center">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-indigo-800">
                    {selectedVehicle.type ? selectedVehicle.type.substring(0, 2).toUpperCase() : 'VE'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedVehicle.type || 'Vehicle'}</h2>
                  <p className="text-sm text-gray-100">: {selectedVehicle.licenseNumber}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Type</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedVehicle.type || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">License Number</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedVehicle.licenseNumber}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Vehicle Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedVehicle.make || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Model</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedVehicle.model || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Branch</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedVehicle.branchName}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Year</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedVehicle.year || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Color</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedVehicle.color || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Status</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedVehicle.status || 'Active'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">License & Insurance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">License Information</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Expiry Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVehicle.licenseExpiry ? new Date(selectedVehicle.licenseExpiry).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Status</label>
                        <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedVehicle.licenseExpiry)}`}>
                          {getStatusText(selectedVehicle.licenseExpiry)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Document</label>
                        {selectedVehicle.licenseDocument?.url ? (
                          <a 
                            href={selectedVehicle.licenseDocument.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            View License Document
                          </a>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">No document uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Insurance Information</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Expiry Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVehicle.insuranceExpiry ? new Date(selectedVehicle.insuranceExpiry).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Status</label>
                        <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedVehicle.insuranceExpiry)}`}>
                          {getStatusText(selectedVehicle.insuranceExpiry)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Document</label>
                        {selectedVehicle.insuranceDocument?.url ? (
                          <a 
                            href={selectedVehicle.insuranceDocument.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            View Insurance Document
                          </a>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">No document uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </WideModal>
      
      {/* Add Vehicle Modal */}
      <WideModal isOpen={showAddVehicle} onClose={() => setShowAddVehicle(false)}>
        <AddVehicle 
          onClose={() => setShowAddVehicle(false)} 
          onAddVehicle={handleAddVehicleLocal}
          branches={branches}
        />
      </WideModal>
    </div>
  );
}