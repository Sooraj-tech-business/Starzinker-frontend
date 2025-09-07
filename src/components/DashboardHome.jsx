import { useState, useEffect } from 'react';
import api from '../api/config';
import { Link } from 'react-router-dom';
import ExpiredDocuments from './ExpiredDocuments';

import { useNavigate } from 'react-router-dom';

export default function DashboardHome({ users, branches, tempEmployees, expenditures, setActiveTab }) {
  const [vacations, setVacations] = useState([]);
  
  useEffect(() => {
    const fetchVacations = async () => {
      try {
        const response = await api.get('/api/vacations');
        setVacations(response.data || []);
      } catch (error) {
        console.error('Error fetching vacations:', error);
        setVacations([]);
      }
    };
    fetchVacations();
  }, []);
  const navigate = useNavigate();

  // Helper function for dashboard cards
  const getLocalDocuments = (category, status) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    let docs = [];
    
    // Employee documents
    if (category === 'employee') {
      users?.forEach(user => {
        // Check QID expiry
        if (user.qidExpiry) {
          const qidExpiry = new Date(user.qidExpiry);
          const isExpiring = qidExpiry > today && qidExpiry <= thirtyDaysFromNow;
          const isExpired = qidExpiry <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({ type: 'QID', category: 'employee' });
          }
        }
        
        // Check Passport expiry
        if (user.passportExpiry) {
          const passportExpiry = new Date(user.passportExpiry);
          const isExpiring = passportExpiry > today && passportExpiry <= thirtyDaysFromNow;
          const isExpired = passportExpiry <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({ type: 'Passport', category: 'employee' });
          }
        }
        
        // Check Visa expiry
        if (user.visaExpiry) {
          const visaExpiry = new Date(user.visaExpiry);
          const isExpiring = visaExpiry > today && visaExpiry <= thirtyDaysFromNow;
          const isExpired = visaExpiry <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({ type: 'Visa', category: 'employee' });
          }
        }
        
        // Check Medical Card expiry
        if (user.medicalCardExpiry) {
          const medicalExpiry = new Date(user.medicalCardExpiry);
          const isExpiring = medicalExpiry > today && medicalExpiry <= thirtyDaysFromNow;
          const isExpired = medicalExpiry <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({ type: 'Medical Card', category: 'employee' });
          }
        }
      });
    }
    
    // Branch documents
    if (category === 'branch') {
      branches?.forEach(branch => {
        // Check CR document
        if (branch.crExpiry) {
          const expiryDate = new Date(branch.crExpiry);
          const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
          const isExpired = expiryDate <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({ type: 'Company CR', category: 'branch' });
          }
        }
        
        // Check Ruksa document
        if (branch.ruksaExpiry) {
          const expiryDate = new Date(branch.ruksaExpiry);
          const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
          const isExpired = expiryDate <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({ type: 'Ruksa License', category: 'branch' });
          }
        }
        
        // Check Computer Card document
        if (branch.computerCardExpiry) {
          const expiryDate = new Date(branch.computerCardExpiry);
          const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
          const isExpired = expiryDate <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({ type: 'Computer Card', category: 'branch' });
          }
        }
        
        // Check Certification document
        if (branch.certificationExpiry) {
          const expiryDate = new Date(branch.certificationExpiry);
          const isExpiring = expiryDate > today && expiryDate <= thirtyDaysFromNow;
          const isExpired = expiryDate <= today;
          
          if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
            docs.push({ type: 'Certification', category: 'branch' });
          }
        }
      });
    }
    
    // Vehicle documents
    if (category === 'vehicle') {
      branches?.forEach(branch => {
        branch.vehicles?.forEach(vehicle => {
          // Check License expiry
          if (vehicle.licenseExpiry) {
            const licenseExpiry = new Date(vehicle.licenseExpiry);
            const isExpiring = licenseExpiry > today && licenseExpiry <= thirtyDaysFromNow;
            const isExpired = licenseExpiry <= today;
            
            if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
              docs.push({ type: 'Vehicle License', category: 'vehicle' });
            }
          }
          
          // Check Insurance expiry
          if (vehicle.insuranceExpiry) {
            const insuranceExpiry = new Date(vehicle.insuranceExpiry);
            const isExpiring = insuranceExpiry > today && insuranceExpiry <= thirtyDaysFromNow;
            const isExpired = insuranceExpiry <= today;
            
            
            if ((status === 'expiring' && isExpiring) || (status === 'expired' && isExpired)) {
              docs.push({ type: 'Vehicle Insurance', category: 'vehicle' });
            }
          }
        });
      });
    }
    
    return docs;
  };
  const [activities, setActivities] = useState([]);
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  
  // Set mock activities without API call
  useEffect(() => {
    setActivities([]);
    setLoading(false);
  }, []);

  // Calculate expiring documents locally without API call
  useEffect(() => {
    if (branches && users) {
      setExpiringDocuments(getLocalExpiringDocuments());
      setDocLoading(false);
    }
  }, [branches, users]);

  // Calculate documents expiring soon locally (within 30 days)
  const getLocalExpiringDocuments = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    let expiringDocs = [];
    
    // Check branch documents
    if (Array.isArray(branches)) {
      branches.forEach(branch => {
        // Branch documents
        if (branch && Array.isArray(branch.documents)) {
          branch.documents.forEach(doc => {
            const expiryDate = new Date(doc.expiryDate);
            if (expiryDate > today && expiryDate <= thirtyDaysFromNow) {
              expiringDocs.push({
                type: doc.type,
                number: doc.number,
                expiryDate: doc.expiryDate,
                entityId: branch._id,
                entityName: branch.name,
                entityType: 'branch',
                category: 'branch'
              });
            }
          });
        }
        
        // Vehicle documents
        if (branch && Array.isArray(branch.vehicles)) {
          branch.vehicles.forEach(vehicle => {
            // License expiry
            if (vehicle.licenseExpiry) {
              const licenseExpiry = new Date(vehicle.licenseExpiry);
              if (licenseExpiry > today && licenseExpiry <= thirtyDaysFromNow) {
                expiringDocs.push({
                  type: 'Vehicle License',
                  number: vehicle.licenseNumber,
                  expiryDate: vehicle.licenseExpiry,
                  entityId: branch._id,
                  entityName: branch.name,
                  vehicleId: vehicle.licenseNumber,
                  entityType: 'branch',
                  category: 'vehicle'
                });
              }
            }
            
            // Insurance expiry
            if (vehicle.insuranceExpiry) {
              const insuranceExpiry = new Date(vehicle.insuranceExpiry);
              if (insuranceExpiry > today && insuranceExpiry <= thirtyDaysFromNow) {
                expiringDocs.push({
                  type: 'Vehicle Insurance',
                  number: vehicle.licenseNumber,
                  expiryDate: vehicle.insuranceExpiry,
                  entityId: branch._id,
                  entityName: branch.name,
                  vehicleId: vehicle.licenseNumber,
                  entityType: 'branch',
                  category: 'vehicle'
                });
              }
            }
          });
        }
      });
    }
    
    // Check employee documents
    if (Array.isArray(users)) {
      users.forEach(user => {
        // Medical card expiry
        if (user.medicalCardExpiry) {
          const medicalExpiry = new Date(user.medicalCardExpiry);
          if (medicalExpiry > today && medicalExpiry <= thirtyDaysFromNow) {
            expiringDocs.push({
              type: 'Medical Card',
              number: user.medicalCardNumber || 'N/A',
              expiryDate: user.medicalCardExpiry,
              entityId: user._id,
              entityName: user.name,
              entityType: 'employee',
              category: 'employee'
            });
          }
        }
        
        // Visa expiry
        if (user.visaExpiry) {
          const visaExpiry = new Date(user.visaExpiry);
          if (visaExpiry > today && visaExpiry <= thirtyDaysFromNow) {
            expiringDocs.push({
              type: 'Visa',
              number: user.visaNumber || 'N/A',
              expiryDate: user.visaExpiry,
              entityId: user._id,
              entityName: user.name,
              entityType: 'employee',
              category: 'employee'
            });
          }
        }
      });
    }
    
    // Sort by expiry date (closest first)
    return expiringDocs.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  };

  // Get branch abbreviations
  const getAbbreviation = (name) => {
    if (!name) return "NA";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
  
  // Get link for entity
  const getEntityLink = (activity) => {
    const { entityType, entityId } = activity;
    
    switch (entityType) {
      case 'user':
      case 'employee':
        return `/dashboard?tab=users&id=${entityId}`;
      case 'branch':
        return `/dashboard?tab=branches&id=${entityId}`;
      case 'vehicle':
        return `/dashboard?tab=vehicles&id=${entityId}`;
      default:
        return '#';
    }
  };
  
  // Get document link based on category
  const getDocumentLink = (doc) => {
    const { category, entityId, vehicleId } = doc;
    
    switch (category) {
      case 'employee':
        return `/dashboard?tab=users&id=${entityId}`;
      case 'branch':
        return `/dashboard?tab=branches&id=${entityId}`;
      case 'vehicle':
        return `/dashboard?tab=vehicles&branchId=${entityId}&vehicleId=${vehicleId}`;
      default:
        return '#';
    }
  };

  return (
    <div className="responsive-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Users Card with Growth Indicator */}
        <div onClick={() => navigate('/dashboard?tab=users')} className="bg-gradient-to-br from-blue-50 to-sky-100 overflow-hidden shadow-md rounded-lg border border-blue-200 cursor-pointer hover:shadow-lg transition-all duration-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 shadow-sm">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-600">Total Employees</dt>
                  <dd className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{Array.isArray(users) ? users.length : 0}</dd>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="flex items-center text-green-600 justify-start sm:justify-end">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold">+12%</span>
                </div>
                <span className="text-xs text-gray-500 block">vs last month</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50/50 px-4 py-3 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-700">View all employees</span>
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Branches Card with Performance Indicator */}
        <div onClick={() => navigate('/dashboard?tab=branches')} className="bg-gradient-to-br from-blue-50 to-sky-100 overflow-hidden shadow-md rounded-lg border border-blue-200 cursor-pointer hover:shadow-lg transition-all duration-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-3 shadow-sm">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-600">Active Branches</dt>
                  <dd className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{Array.isArray(branches) ? branches.length : 0}</dd>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm sm:text-lg font-bold text-blue-700">100%</span>
                </div>
                <span className="text-xs text-gray-500 mt-1 block">Operational</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50/50 px-4 py-3 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-700">Manage branches</span>
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Vehicles Card with Fleet Status */}
        <div onClick={() => navigate('/dashboard?tab=vehicles')} className="bg-gradient-to-br from-blue-50 to-sky-100 overflow-hidden shadow-md rounded-lg border border-blue-200 cursor-pointer hover:shadow-lg transition-all duration-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-3 shadow-sm">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-600">Total Vehicles</dt>
                  <dd className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {Array.isArray(branches) ? branches.reduce((total, branch) => total + (Array.isArray(branch.vehicles) ? branch.vehicles.length : 0), 0) : 0}
                  </dd>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="flex items-center space-x-1 justify-start sm:justify-end">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-600">Active</span>
                </div>
                <span className="text-xs text-gray-500 block">Fleet status</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50/50 px-4 py-3 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-700">Fleet management</span>
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Vacations Card */}
        <div onClick={() => navigate('/dashboard?tab=vacations')} className="bg-gradient-to-br from-blue-50 to-sky-100 overflow-hidden shadow-md rounded-lg border border-blue-200 cursor-pointer hover:shadow-lg transition-all duration-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-3 shadow-sm">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-600">Employee Vacations</dt>
                  <dd className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{vacations?.length || 0}</dd>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="flex items-center space-x-1 justify-start sm:justify-end">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-600">Active</span>
                </div>
                <span className="text-xs text-gray-500 block">Vacation tracking</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50/50 px-4 py-3 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-700">Manage vacations</span>
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Temporary Employees Card */}
        <div onClick={() => navigate('/dashboard?tab=temp-employees')} className="bg-gradient-to-br from-orange-50 to-red-100 overflow-hidden shadow-md rounded-lg border border-orange-200 cursor-pointer hover:shadow-lg transition-all duration-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-orange-600 to-red-700 rounded-lg p-3 shadow-sm">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-600">Temporary Employees</dt>
                  <dd className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{tempEmployees?.length || 0}</dd>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="flex items-center space-x-1 justify-start sm:justify-end">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-orange-600">Active</span>
                </div>
                <span className="text-xs text-gray-500 block">Temp workforce</span>
              </div>
            </div>
          </div>
          <div className="bg-orange-50/50 px-4 py-3 border-t border-orange-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-orange-700">Manage temp staff</span>
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Accounting Card */}
        <div onClick={() => navigate('/dashboard?tab=accounting')} className="bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shadow-md rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-red-800 to-red-900 rounded-lg p-3 shadow-sm">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-600">Daily Expenditures</dt>
                  <dd className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{expenditures?.length || 0}</dd>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="flex items-center space-x-1 justify-start sm:justify-end">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-red-800">Active</span>
                </div>
                <span className="text-xs text-gray-500 block">Financial tracking</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50/50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-red-800">Manage accounting</span>
              <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>


      </div>

      {/* <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"> */}
        {/* Expired Employee Documents */}
        {/* <div onClick={() => navigate('/dashboard?tab=expiring-documents&category=employee&status=expired')} className="bg-gradient-to-br from-blue-50 to-sky-100 overflow-hidden shadow-md rounded-lg border border-blue-200 cursor-pointer hover:shadow-lg transition-all duration-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-3 shadow-sm">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-600">Expired Employee Docs</dt>
                  <dd className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {getLocalDocuments('employee', 'expired').length}
                  </dd>
                </div>
              </div>
              <div className="flex-shrink-0 text-left sm:text-right">
                <div className="flex items-center space-x-1 justify-start sm:justify-end">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-700">Expired</span>
                </div>
                <span className="text-xs text-gray-500 block">Needs attention</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50/50 px-4 py-3 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-700">View expired docs</span>
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div> */}

        {/* Expired Branch Documents */}
        {/* <div onClick={() => navigate('/dashboard?tab=expiring-documents&category=branch&status=expired')} className="bg-gradient-to-br from-blue-50 to-sky-100 overflow-hidden shadow-md rounded-lg border border-blue-200 cursor-pointer hover:shadow-lg transition-all duration-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 shadow-sm">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-600">Expired Branch Docs</dt>
                  <dd className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {getLocalDocuments('branch', 'expired').length}
                  </dd>
                </div>
              </div>
              <div className="flex-shrink-0 text-left sm:text-right">
                <div className="flex items-center space-x-1 justify-start sm:justify-end">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-700">Expired</span>
                </div>
                <span className="text-xs text-gray-500 block">Action required</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50/50 px-4 py-3 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-700">View expired docs</span>
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div> */}

        {/* Expired Vehicle Documents */}
        {/* <div onClick={() => navigate('/dashboard?tab=expiring-documents&category=vehicle&status=expired')} className="bg-gradient-to-br from-blue-50 to-sky-100 overflow-hidden shadow-md rounded-lg border border-blue-200 cursor-pointer hover:shadow-lg transition-all duration-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 shadow-sm">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-600">Expired Vehicle Docs</dt>
                  <dd className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {getLocalDocuments('vehicle', 'expired').length}
                  </dd>
                </div>
              </div>
              <div className="flex-shrink-0 text-left sm:text-right">
                <div className="flex items-center space-x-1 justify-start sm:justify-end">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-700">Expired</span>
                </div>
                <span className="text-xs text-gray-500 block">Fleet alert</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50/50 px-4 py-3 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-700">View expired docs</span>
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div> */}




      {/* </div> */}




    </div>
  );
}