import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/config';

export default function ExpiringDocuments({ users, branches, onEditUser, onEditBranch, onEditVehicle }) {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const status = searchParams.get('status') || 'expiring';
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState('expiryDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchDocuments();
  }, [users, branches, category, status]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      if (category === 'employee') {
        // For employee documents, fetch full employee details
        const [docsResponse, employeesResponse] = await Promise.all([
          api.get(`/api/documents/${status}?category=${category}`),
          api.get('/api/employees')
        ]);
        
        // Merge document data with full employee details
        const documentsWithEmployeeDetails = docsResponse.data.map(doc => {
          const employee = employeesResponse.data.find(emp => emp.name === doc.entityName || emp._id === doc.entityId);
          return {
            ...doc,
            employeeDetails: employee
          };
        });
        
        setDocuments(documentsWithEmployeeDetails);
        setFilteredDocuments(documentsWithEmployeeDetails);
      } else if (category === 'branch') {
        // For branch documents, fetch from /api/branches and extract expired docs
        const branchesResponse = await api.get('/api/branches');
        const branchDocs = extractBranchDocuments(branchesResponse.data, status);
        setDocuments(branchDocs);
        setFilteredDocuments(branchDocs);
      } else {
        const response = await api.get(`/api/documents/${status}?category=${category}`);
        setDocuments(response.data);
        setFilteredDocuments(response.data);
      }
    } catch (error) {
      console.error(`Error fetching ${status} documents:`, error);
      const localDocs = getLocalDocuments();
      setDocuments(localDocs);
      setFilteredDocuments(localDocs);
    } finally {
      setLoading(false);
    }
  };

  const extractBranchDocuments = (branches, status) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    let docs = [];
    
    branches?.forEach(branch => {
      // Check CR document
      if (branch.crExpiry) {
        const expiryDate = new Date(branch.crExpiry);
        const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
        const isExpired = expiryDate <= today;
        
        if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
          docs.push({
            type: 'Company CR',
            number: branch.crNumber || 'N/A',
            expiryDate: branch.crExpiry,
            entityName: branch.name,
            category: 'branch'
          });
        }
      }
      
      // Check Ruksa document
      if (branch.ruksaExpiry) {
        const expiryDate = new Date(branch.ruksaExpiry);
        const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
        const isExpired = expiryDate <= today;
        
        if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
          docs.push({
            type: 'Ruksa License',
            number: branch.ruksaNumber || 'N/A',
            expiryDate: branch.ruksaExpiry,
            entityName: branch.name,
            category: 'branch'
          });
        }
      }
      
      // Check Computer Card document
      if (branch.computerCardExpiry) {
        const expiryDate = new Date(branch.computerCardExpiry);
        const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
        const isExpired = expiryDate <= today;
        
        if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
          docs.push({
            type: 'Computer Card',
            number: branch.computerCardNumber || 'N/A',
            expiryDate: branch.computerCardExpiry,
            entityName: branch.name,
            category: 'branch'
          });
        }
      }
      
      // Check Certification document
      if (branch.certificationExpiry) {
        const expiryDate = new Date(branch.certificationExpiry);
        const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
        const isExpired = expiryDate <= today;
        
        if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
          docs.push({
            type: 'Certification',
            number: branch.certificationNumber || 'N/A',
            expiryDate: branch.certificationExpiry,
            entityName: branch.name,
            category: 'branch'
          });
        }
      }
    });
    
    return docs.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  };

  // Analytics calculations
  const analytics = {
    total: documents.length,
    expired: documents.filter(doc => new Date(doc.expiryDate) <= new Date()).length,
    expiringSoon: documents.filter(doc => {
      const today = new Date();
      const expiryDate = new Date(doc.expiryDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      return expiryDate > today && expiryDate <= thirtyDaysFromNow;
    }).length,
    byCategory: {},
    byType: {},
    byStatus: {}
  };
  
  documents.forEach(doc => {
    // Category distribution
    analytics.byCategory[doc.category] = (analytics.byCategory[doc.category] || 0) + 1;
    
    // Type distribution
    analytics.byType[doc.type] = (analytics.byType[doc.type] || 0) + 1;
    
    // Status distribution
    const today = new Date();
    const expiryDate = new Date(doc.expiryDate);
    const docStatus = expiryDate <= today ? 'Expired' : 'Expiring Soon';
    analytics.byStatus[docStatus] = (analytics.byStatus[docStatus] || 0) + 1;
  });
  
  // Filter, search, and sort functionality
  useEffect(() => {
    let filtered = documents;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(doc => doc.category === categoryFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(doc => {
        const searchLower = searchTerm.toLowerCase();
        return (
          doc.entityName.toLowerCase().includes(searchLower) ||
          doc.type.toLowerCase().includes(searchLower) ||
          doc.number.toLowerCase().includes(searchLower) ||
          (doc.employeeDetails?.email || '').toLowerCase().includes(searchLower) ||
          (doc.employeeDetails?.role || '').toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'expiryDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredDocuments(filtered);
    setCurrentPage(1);
  }, [documents, searchTerm, filterType, categoryFilter, sortField, sortDirection]);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const getDocumentTypes = () => {
    return [...new Set(documents.map(doc => doc.type))];
  };

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage);

  const getLocalDocuments = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    let docs = [];
    
    if (category === 'employee') {
      users?.forEach(user => {
        if (user.medicalCardExpiry) {
          const medicalExpiry = new Date(user.medicalCardExpiry);
          const isExpiring = medicalExpiry > today && medicalExpiry <= thirtyDaysFromNow;
          const isExpired = medicalExpiry <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({
              type: 'Medical Card',
              number: user.medicalCardNumber || 'N/A',
              expiryDate: user.medicalCardExpiry,
              entityName: user.name,
              category: 'employee'
            });
          }
        }
        
        if (user.visaExpiry) {
          const visaExpiry = new Date(user.visaExpiry);
          const isExpiring = visaExpiry > today && visaExpiry <= thirtyDaysFromNow;
          const isExpired = visaExpiry <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({
              type: 'Visa',
              number: user.visaNumber || 'N/A',
              expiryDate: user.visaExpiry,
              entityName: user.name,
              category: 'employee'
            });
          }
        }
      });
    }
    
    else if (category === 'branch') {
      branches?.forEach(branch => {
        // Check CR document
        if (branch.crExpiry) {
          const expiryDate = new Date(branch.crExpiry);
          const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
          const isExpired = expiryDate <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({
              type: 'Company CR',
              number: branch.crNumber || 'N/A',
              expiryDate: branch.crExpiry,
              entityName: branch.name,
              category: 'branch'
            });
          }
        }
        
        if (branch.ruksaExpiry) {
          const expiryDate = new Date(branch.ruksaExpiry);
          const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
          const isExpired = expiryDate <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({
              type: 'Ruksa License',
              number: branch.ruksaNumber || 'N/A',
              expiryDate: branch.ruksaExpiry,
              entityName: branch.name,
              category: 'branch'
            });
          }
        }
        
        if (branch.computerCardExpiry) {
          const expiryDate = new Date(branch.computerCardExpiry);
          const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
          const isExpired = expiryDate <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({
              type: 'Computer Card',
              number: branch.computerCardNumber || 'N/A',
              expiryDate: branch.computerCardExpiry,
              entityName: branch.name,
              category: 'branch'
            });
          }
        }
        
        if (branch.certificationExpiry) {
          const expiryDate = new Date(branch.certificationExpiry);
          const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
          const isExpired = expiryDate <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({
              type: 'Certification',
              number: branch.certificationNumber || 'N/A',
              expiryDate: branch.certificationExpiry,
              entityName: branch.name,
              category: 'branch'
            });
          }
        }
      });
    }
    
    else if (category === 'vehicle') {
      branches?.forEach(branch => {
        branch.vehicles?.forEach(vehicle => {
          if (vehicle.licenseExpiry) {
            const licenseExpiry = new Date(vehicle.licenseExpiry);
            const isExpiring = licenseExpiry > today && licenseExpiry <= thirtyDaysFromNow;
            const isExpired = licenseExpiry <= today;
            
            if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
              docs.push({
                type: 'Vehicle License',
                number: vehicle.licenseNumber,
                expiryDate: vehicle.licenseExpiry,
                entityName: `${branch.name} - ${vehicle.licenseNumber}`,
                category: 'vehicle'
              });
            }
          }
          
          if (vehicle.insuranceExpiry) {
            const insuranceExpiry = new Date(vehicle.insuranceExpiry);
            const isExpiring = insuranceExpiry > today && insuranceExpiry <= thirtyDaysFromNow;
            const isExpired = insuranceExpiry <= today;
            
            if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
              docs.push({
                type: 'Vehicle Insurance',
                number: vehicle.licenseNumber,
                expiryDate: vehicle.insuranceExpiry,
                entityName: `${branch.name} - ${vehicle.licenseNumber}`,
                category: 'vehicle'
              });
            }
          }
        });
      });
    }
    else if (category === 'all') {
      // All categories logic here if needed
      users?.forEach(user => {
        if (user.medicalCardExpiry) {
          const medicalExpiry = new Date(user.medicalCardExpiry);
          const isExpiring = medicalExpiry > today && medicalExpiry <= thirtyDaysFromNow;
          const isExpired = medicalExpiry <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({
              type: 'Medical Card',
              number: user.medicalCardNumber || 'N/A',
              expiryDate: user.medicalCardExpiry,
              entityName: user.name,
              category: 'employee'
            });
          }
        }
        
        if (user.visaExpiry) {
          const visaExpiry = new Date(user.visaExpiry);
          const isExpiring = visaExpiry > today && visaExpiry <= thirtyDaysFromNow;
          const isExpired = visaExpiry <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({
              type: 'Visa',
              number: user.visaNumber || 'N/A',
              expiryDate: user.visaExpiry,
              entityName: user.name,
              category: 'employee'
            });
          }
        }
      });
      
      branches?.forEach(branch => {
        // Check specific branch documents
        if (branch.crExpiry) {
          const expiryDate = new Date(branch.crExpiry);
          const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
          const isExpired = expiryDate <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({
              type: 'Company CR',
              number: branch.crNumber || 'N/A',
              expiryDate: branch.crExpiry,
              entityName: branch.name,
              category: 'branch'
            });
          }
        }
        
        if (branch.ruksaExpiry) {
          const expiryDate = new Date(branch.ruksaExpiry);
          const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
          const isExpired = expiryDate <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({
              type: 'Ruksa License',
              number: branch.ruksaNumber || 'N/A',
              expiryDate: branch.ruksaExpiry,
              entityName: branch.name,
              category: 'branch'
            });
          }
        }
        
        if (branch.computerCardExpiry) {
          const expiryDate = new Date(branch.computerCardExpiry);
          const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
          const isExpired = expiryDate <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({
              type: 'Computer Card',
              number: branch.computerCardNumber || 'N/A',
              expiryDate: branch.computerCardExpiry,
              entityName: branch.name,
              category: 'branch'
            });
          }
        }
        
        if (branch.certificationExpiry) {
          const expiryDate = new Date(branch.certificationExpiry);
          const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
          const isExpired = expiryDate <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({
              type: 'Certification',
              number: branch.certificationNumber || 'N/A',
              expiryDate: branch.certificationExpiry,
              entityName: branch.name,
              category: 'branch'
            });
          }
        }
      });
      
      branches?.forEach(branch => {
        branch.vehicles?.forEach(vehicle => {
          if (vehicle.licenseExpiry) {
            const licenseExpiry = new Date(vehicle.licenseExpiry);
            const isExpiring = licenseExpiry > today && licenseExpiry <= thirtyDaysFromNow;
            const isExpired = licenseExpiry <= today;
            
            if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
              docs.push({
                type: 'Vehicle License',
                number: vehicle.licenseNumber,
                expiryDate: vehicle.licenseExpiry,
                entityName: `${branch.name} - ${vehicle.licenseNumber}`,
                category: 'vehicle'
              });
            }
          }
          
          if (vehicle.insuranceExpiry) {
            const insuranceExpiry = new Date(vehicle.insuranceExpiry);
            const isExpiring = insuranceExpiry > today && insuranceExpiry <= thirtyDaysFromNow;
            const isExpired = insuranceExpiry <= today;
            
            if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
              docs.push({
                type: 'Vehicle Insurance',
                number: vehicle.licenseNumber,
                expiryDate: vehicle.insuranceExpiry,
                entityName: `${branch.name} - ${vehicle.licenseNumber}`,
                category: 'vehicle'
              });
            }
          }
        });
      });
    }
    
    return docs.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryTitle = () => {
    const statusText = status === 'expired' ? 'Expired' : 'Expiring Soon';
    switch (category) {
      case 'employee': return `Employee Documents ${statusText}`;
      case 'branch': return `Branch Documents ${statusText}`;
      case 'vehicle': return `Vehicle Documents ${statusText}`;
      default: return `All Documents ${statusText}`;
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'employee': return 'bg-red-100 text-red-800';
      case 'branch': return 'bg-orange-100 text-orange-800';
      case 'vehicle': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading {status} documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="responsive-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{getCategoryTitle()}</h1>
        <div className="text-sm text-gray-500">
          {analytics.total} Total Documents
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-indigo-600">{analytics.total}</div>
          <div className="text-sm text-gray-600">Total Documents</div>
          <div className="text-xs text-gray-400 mt-1">All categories</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{analytics.expired}</div>
          <div className="text-sm text-gray-600">Expired</div>
          <div className="text-xs text-gray-400 mt-1">{((analytics.expired/analytics.total)*100 || 0).toFixed(1)}% of total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{analytics.expiringSoon}</div>
          <div className="text-sm text-gray-600">Expiring Soon</div>
          <div className="text-xs text-gray-400 mt-1">Within 30 days</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{analytics.total - analytics.expired}</div>
          <div className="text-sm text-gray-600">Action Required</div>
          <div className="text-xs text-gray-400 mt-1">Needs attention</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents by Category</h3>
          <div className="space-y-3">
            {Object.entries(analytics.byCategory).map(([category, count]) => {
              const percentage = ((count / analytics.total) * 100).toFixed(1);
              const colors = {
                'employee': 'bg-blue-500',
                'branch': 'bg-green-500',
                'vehicle': 'bg-orange-500'
              };
              return (
                <div key={category} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600 truncate capitalize">{category}</div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colors[category] || 'bg-gray-500'} h-2 rounded-full transition-all duration-300`}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents by Type</h3>
          <div className="space-y-3">
            {Object.entries(analytics.byType).map(([type, count]) => {
              const percentage = ((count / analytics.total) * 100).toFixed(1);
              const colors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
              const colorIndex = Object.keys(analytics.byType).indexOf(type) % colors.length;
              return (
                <div key={type} className="flex items-center">
                  <div className="w-32 text-sm text-gray-600 truncate">{type}</div>
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
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Document Types</option>
            {getDocumentTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredDocuments.length} of {analytics.total} documents</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleSort('expiryDate')}
              className="text-indigo-600 hover:text-indigo-500 flex items-center space-x-1"
            >
              <span>Sort by Date</span>
              <SortIcon field="expiryDate" />
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setCategoryFilter('all');
              }}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Clear all filters
            </button>
          </div>
        </div>
      </div>
      
      {filteredDocuments.length > 0 ? (
        category === 'employee' ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document & ID Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDocuments.map((doc, index) => {
                  const employee = doc.employeeDetails || users?.find(u => u.name === doc.entityName);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-lg font-medium text-indigo-800">
                                {(employee?.name || doc.entityName).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee?.name || doc.entityName}</div>
                            <div className="text-sm text-gray-500">{employee?.email || 'N/A'}</div>
                            <div className="text-xs text-gray-400">Role: {employee?.role || 'N/A'}</div>
                            <div className="text-xs text-gray-400">Branch: {employee?.branch || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {doc.type}
                        </span>
                        <div className="text-sm text-gray-900 mt-1">{doc.number}</div>
                        <div className="text-xs text-gray-500">QID: {employee?.qid || 'N/A'}</div>
                        <div className="text-xs text-gray-500">Passport: {employee?.passportNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-sm text-gray-900">Designation: {employee?.designation || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Location: {employee?.workLocation || 'N/A'}</div>
                        <div className="text-xs text-gray-400">DOJ: {employee?.doj ? formatDate(employee.doj) : 'N/A'}</div>
                        <div className="text-xs text-gray-400">Status: {employee?.status || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(doc.expiryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {status === 'expired' ? 'Expired' : 'Expiring'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                        <button 
                          onClick={() => onEditUser && onEditUser(employee?._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                      <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredDocuments.length)}</span> of{' '}
                      <span className="font-medium">{filteredDocuments.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : category === 'branch' ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDocuments.map((doc, index) => {
                  const branch = branches?.find(b => b.name === doc.entityName);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                              <span className="text-lg font-medium text-yellow-800">
                                {doc.entityName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{doc.entityName}</div>
                            <div className="text-sm text-gray-500">{branch?.location || 'N/A'}</div>
                            <div className="text-xs text-gray-400">Manager: {branch?.manager || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                          {doc.type}
                        </span>
                        <div className="text-sm text-gray-900 mt-1">{doc.number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Contact: {branch?.contactNumber || branch?.contact || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Email: {branch?.email || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Address: {branch?.address || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Users: {branch?.assignedUsers?.length || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(doc.expiryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {status === 'expired' ? 'Expired' : 'Expiring'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                        <button 
                          onClick={() => onEditBranch && onEditBranch(branch?._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                      <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredDocuments.length)}</span> of{' '}
                      <span className="font-medium">{filteredDocuments.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : category === 'vehicle' ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDocuments.map((doc, index) => {
                  const branchName = doc.entityName.split(' - ')[0];
                  const licenseNumber = doc.number;
                  const branch = branches?.find(b => b.name === branchName);
                  const vehicle = branch?.vehicles?.find(v => v.licenseNumber === licenseNumber);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center">
                              <span className="text-lg font-medium text-pink-800">
                                {licenseNumber.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">License: {licenseNumber}</div>
                            <div className="text-sm text-gray-500">{vehicle?.make || 'N/A'} {vehicle?.model || ''}</div>
                            <div className="text-xs text-gray-400">Type: {vehicle?.type || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-pink-100 text-pink-800">
                          {doc.type}
                        </span>
                        <div className="text-sm text-gray-900 mt-1">{doc.number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Year: {vehicle?.year || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Color: {vehicle?.color || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Status: {vehicle?.status || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{branchName}</div>
                        <div className="text-sm text-gray-500">{branch?.location || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Manager: {branch?.manager || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(doc.expiryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {status === 'expired' ? 'Expired' : 'Expiring'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                        <button 
                          onClick={() => onEditVehicle && onEditVehicle(vehicle)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                      <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredDocuments.length)}</span> of{' '}
                      <span className="font-medium">{filteredDocuments.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {documents.map((doc, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {doc.type} - {doc.number}
                        </p>
                        <div className="ml-2 flex-shrink-0">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(doc.category)}`}>
                            {doc.category}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Entity: {doc.entityName}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Expires: {formatDate(doc.expiryDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      ) : documents.length > 0 ? (
        <div className="bg-white shadow sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No documents match your search criteria</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No {category === 'all' ? '' : category} documents {status === 'expired' ? 'expired' : 'expiring in the next 30 days'}</p>
        </div>
      )}
    </div>
  );
}