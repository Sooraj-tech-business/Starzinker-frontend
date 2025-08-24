import { useState, useEffect } from 'react';
import api from '../api/config';
import { useNavigate } from 'react-router-dom';

export default function ExpiredDocuments() {
  const navigate = useNavigate();
  const [expiredDocuments, setExpiredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchExpiredDocuments = async () => {
      setLoading(true);
      try {
        // First try to get from API
        try {
          const response = await api.get('/api/documents/expired');
          if (response.data && response.data.length > 0) {
            console.log('Got expired documents from API:', response.data);
            setExpiredDocuments(response.data);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('API error for expired documents:', apiError);
        }
        
        // If API fails, extract from branches
        console.log('Fetching branches to extract expired documents...');
        const branchesResponse = await api.get('/api/branches');
        console.log('Branches response for expired docs:', branchesResponse);
        
        if (branchesResponse.data && branchesResponse.data.length > 0) {
          const branches = branchesResponse.data;
          console.log('Processing branches for expired documents:', branches);
          const expiredDocs = [];
          
          // Process branch documents
          branches.forEach(branch => {
            console.log(`Processing branch ${branch.name}, documents:`, branch.documents);
            if (branch.documents && branch.documents.length > 0) {
              branch.documents.forEach(doc => {
                if (!doc.expiryDate) return;
                
                const expiryDate = new Date(doc.expiryDate);
                const today = new Date();
                
                if (expiryDate < today) {
                  expiredDocs.push({
                    type: doc.type || 'Document',
                    number: doc.number || 'N/A',
                    expiryDate: doc.expiryDate,
                    category: 'branch',
                    entityId: branch._id,
                    entityName: branch.name
                  });
                }
              });
            }
            
            // Process vehicle documents
            console.log(`Processing branch ${branch.name}, vehicles:`, branch.vehicles);
            if (branch.vehicles && branch.vehicles.length > 0) {
              branch.vehicles.forEach(vehicle => {
                const today = new Date();
                
                // Check license expiry
                if (vehicle.licenseExpiry) {
                  const licenseExpiry = new Date(vehicle.licenseExpiry);
                  if (licenseExpiry < today) {
                    expiredDocs.push({
                      type: 'Vehicle License',
                      number: vehicle.licenseNumber || 'N/A',
                      expiryDate: vehicle.licenseExpiry,
                      category: 'vehicle',
                      entityId: branch._id,
                      vehicleId: vehicle.licenseNumber,
                      entityName: `${vehicle.make || ''} ${vehicle.model || ''} (${vehicle.licenseNumber || 'Unknown'})`
                    });
                  }
                }
                
                // Check insurance expiry
                if (vehicle.insuranceExpiry) {
                  const insuranceExpiry = new Date(vehicle.insuranceExpiry);
                  if (insuranceExpiry < today) {
                    expiredDocs.push({
                      type: 'Vehicle Insurance',
                      number: vehicle.licenseNumber || 'N/A',
                      expiryDate: vehicle.insuranceExpiry,
                      category: 'vehicle',
                      entityId: branch._id,
                      vehicleId: vehicle.licenseNumber,
                      entityName: `${vehicle.make || ''} ${vehicle.model || ''} (${vehicle.licenseNumber || 'Unknown'})`
                    });
                  }
                }
              });
            }
          });
          
          console.log('Found expired documents:', expiredDocs);
          setExpiredDocuments(expiredDocs);
        } else {
          console.log('No branches found for expired documents');
        }
      } catch (error) {
        console.error('Error fetching expired documents:', error);
        setExpiredDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpiredDocuments();
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Navigate to document details
  const navigateToDocument = (doc) => {
    const { category, entityId, vehicleId } = doc;
    
    switch (category) {
      case 'employee':
        navigate('/dashboard', { state: { tab: 'users', id: entityId } });
        break;
      case 'branch':
        navigate('/dashboard', { state: { tab: 'branches', id: entityId } });
        break;
      case 'vehicle':
        navigate('/dashboard', { state: { tab: 'vehicles', branchId: entityId, vehicleId: vehicleId } });
        break;
      default:
        // Do nothing
        break;
    }
  };
  
  // Get category badge color
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'employee':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Employee
          </span>
        );
      case 'branch':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Branch
          </span>
        );
      case 'vehicle':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            Vehicle
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            Other
          </span>
        );
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Expired Documents</h3>
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          {expiredDocuments.length} Documents
        </span>
      </div>
      
      {loading ? (
        <div className="px-4 py-5 sm:p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading expired documents...</p>
        </div>
      ) : (
        <div className="border-t border-gray-200">
          <div className="h-96 overflow-y-auto">
            {expiredDocuments.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {expiredDocuments.map((doc, index) => (
                  <li 
                    key={index} 
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" 
                    onClick={() => navigateToDocument(doc)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <p className="text-sm font-medium text-red-600 truncate mr-2">
                          {doc.type}
                        </p>
                        {getCategoryBadge(doc.category)}
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Expired: {formatDate(doc.expiryDate)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {doc.entityName} - {doc.number}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-sm text-gray-500">No expired documents found</p>
              </div>
            )}
          </div>
          {/* {expiredDocuments.length > 5 && (
            <div className="px-4 py-3 bg-gray-50 text-center">
              <span 
                onClick={() => navigate('/dashboard', { state: { tab: 'documents', filter: 'expired' } })}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
              >
                View all {expiredDocuments.length} expired documents
              </span>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
}