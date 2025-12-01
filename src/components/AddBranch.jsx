import { useState } from 'react';
import { API_BASE_URL } from '../api/config';

export default function AddBranch({ onClose, onAddBranch, users }) {
  const [branchData, setBranchData] = useState({
    name: '',
    location: '',
    address: '',
    manager: '',
    contactNumber: '',
    email: '',
    // New document fields
    crNumber: '',
    crExpiry: '',
    ruksaNumber: '',
    ruksaExpiry: '',
    computerCardNumber: '',
    computerCardExpiry: '',
    certificationNumber: '',
    certificationExpiry: '',
    taxCardNumber: '',
    taxCardExpiry: '',
    baladiyaNumber: '',
    baladiyaExpiry: '',
    // Bank details
    bankName: '',
    bankAccountNumber: '',
    ibanNumber: '',
    branchDocuments: {},
    // ZAKATH percentage
    zakathPercentage: 2.5,

    vehicles: []
  });
  
  const [documentFiles, setDocumentFiles] = useState({
    crDocument: null,
    ruksaDocument: null,
    computerCardDocument: null,
    certificationDocument: null,
    taxCardDocument: null,
    logoDocument: null,
    letterheadDocument: null,
    baladiyaDocument: null
  });
  
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [uploadingStates, setUploadingStates] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBranchData(prev => ({
      ...prev,
      [name]: value
    }));
  };






  
  const handleFileChange = (documentType, file) => {
    setDocumentFiles(prev => ({ ...prev, [documentType]: file }));
  };
  
  const handleUploadClick = async (documentType) => {
    const file = documentFiles[documentType];
    
    if (!file) {
      alert('Please select a file first');
      return;
    }
    
    setUploadingStates(prev => ({ ...prev, [documentType]: true }));
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('branchName', branchData.name || 'New Branch');
    // For new branches, branchId won't exist yet
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/upload/branch/${documentType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        const s3Data = {
          url: result.s3Url,
          fileName: result.document.fileName,
          uploadedAt: result.document.uploadedAt
        };
        
        setUploadedDocuments(prev => ({ ...prev, [documentType]: s3Data }));
        setBranchData(prev => ({
          ...prev,
          branchDocuments: {
            ...prev.branchDocuments,
            [documentType]: s3Data
          }
        }));
        console.log(`✅ Successfully uploaded ${documentType}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(`❌ Error uploading ${documentType}:`, error);
      alert(`Failed to upload ${documentType}: ${error.message}`);
    } finally {
      setUploadingStates(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Make sure all vehicle fields are properly formatted
    const formattedData = {
      ...branchData,
      vehicles: branchData.vehicles.map(vehicle => ({
        type: vehicle.type,
        licenseNumber: vehicle.licenseNumber,
        licenseExpiry: vehicle.licenseExpiry,
        insuranceExpiry: vehicle.insuranceExpiry,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        status: vehicle.status || 'active'
      }))
    };
    
    console.log('Submitting branch data:', formattedData);
    onAddBranch(formattedData);
    onClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-h-[95vh] overflow-y-auto w-full">
      <div className="bg-indigo-600 px-6 py-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Add New Branch</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-6">
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Branch Information */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">Basic Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Branch Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={branchData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                City/Location*
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={branchData.location}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Full Address*
            </label>
            <textarea
              id="address"
              name="address"
              value={branchData.address}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
                Branch Manager*
              </label>
              <input
                type="text"
                id="manager"
                name="manager"
                value={branchData.manager}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                Contact Number*
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={branchData.contactNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={branchData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Branch Documents */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-md font-medium text-gray-700 mb-4">Branch Documents</h3>
          
          {/* Company CR */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Company CR (Commercial Registration)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="crNumber" className="block text-sm font-medium text-gray-700">
                  CR Number
                </label>
                <input
                  type="text"
                  id="crNumber"
                  name="crNumber"
                  value={branchData.crNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="crExpiry" className="block text-sm font-medium text-gray-700">
                  CR Expiry Date
                </label>
                <input
                  type="date"
                  id="crExpiry"
                  name="crExpiry"
                  value={branchData.crExpiry}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload CR Document
                </label>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileChange('crDocument', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleUploadClick('crDocument')}
                    disabled={uploadingStates.crDocument || !documentFiles.crDocument}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {uploadingStates.crDocument ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                {uploadedDocuments.crDocument && (
                  <div className="mt-1 text-xs text-green-600">
                    ✓ Uploaded: {uploadedDocuments.crDocument.fileName}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Ruksa */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Ruksa (License)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="ruksaNumber" className="block text-sm font-medium text-gray-700">
                  Ruksa Number
                </label>
                <input
                  type="text"
                  id="ruksaNumber"
                  name="ruksaNumber"
                  value={branchData.ruksaNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="ruksaExpiry" className="block text-sm font-medium text-gray-700">
                  Ruksa Expiry Date
                </label>
                <input
                  type="date"
                  id="ruksaExpiry"
                  name="ruksaExpiry"
                  value={branchData.ruksaExpiry}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Ruksa Document
                </label>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileChange('ruksaDocument', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleUploadClick('ruksaDocument')}
                    disabled={uploadingStates.ruksaDocument || !documentFiles.ruksaDocument}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {uploadingStates.ruksaDocument ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                {uploadedDocuments.ruksaDocument && (
                  <div className="mt-1 text-xs text-green-600">
                    ✓ Uploaded: {uploadedDocuments.ruksaDocument.fileName}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Computer Card */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Computer Card</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="computerCardNumber" className="block text-sm font-medium text-gray-700">
                  Computer Card Number
                </label>
                <input
                  type="text"
                  id="computerCardNumber"
                  name="computerCardNumber"
                  value={branchData.computerCardNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="computerCardExpiry" className="block text-sm font-medium text-gray-700">
                  Computer Card Expiry Date
                </label>
                <input
                  type="date"
                  id="computerCardExpiry"
                  name="computerCardExpiry"
                  value={branchData.computerCardExpiry}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Computer Card Document
                </label>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileChange('computerCardDocument', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleUploadClick('computerCardDocument')}
                    disabled={uploadingStates.computerCardDocument || !documentFiles.computerCardDocument}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {uploadingStates.computerCardDocument ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                {uploadedDocuments.computerCardDocument && (
                  <div className="mt-1 text-xs text-green-600">
                    ✓ Uploaded: {uploadedDocuments.computerCardDocument.fileName}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Certification */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Certification</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="certificationNumber" className="block text-sm font-medium text-gray-700">
                  Certification Number
                </label>
                <input
                  type="text"
                  id="certificationNumber"
                  name="certificationNumber"
                  value={branchData.certificationNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="certificationExpiry" className="block text-sm font-medium text-gray-700">
                  Certification Expiry Date
                </label>
                <input
                  type="date"
                  id="certificationExpiry"
                  name="certificationExpiry"
                  value={branchData.certificationExpiry}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Certification Document
                </label>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileChange('certificationDocument', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleUploadClick('certificationDocument')}
                    disabled={uploadingStates.certificationDocument || !documentFiles.certificationDocument}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {uploadingStates.certificationDocument ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                {uploadedDocuments.certificationDocument && (
                  <div className="mt-1 text-xs text-green-600">
                    ✓ Uploaded: {uploadedDocuments.certificationDocument.fileName}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tax Card */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Tax Card</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="taxCardNumber" className="block text-sm font-medium text-gray-700">
                  Tax Card Number
                </label>
                <input
                  type="text"
                  id="taxCardNumber"
                  name="taxCardNumber"
                  value={branchData.taxCardNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="taxCardExpiry" className="block text-sm font-medium text-gray-700">
                  Tax Card Expiry Date
                </label>
                <input
                  type="date"
                  id="taxCardExpiry"
                  name="taxCardExpiry"
                  value={branchData.taxCardExpiry}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Tax Card Document
                </label>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileChange('taxCardDocument', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleUploadClick('taxCardDocument')}
                    disabled={uploadingStates.taxCardDocument || !documentFiles.taxCardDocument}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {uploadingStates.taxCardDocument ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                {uploadedDocuments.taxCardDocument && (
                  <div className="mt-1 text-xs text-green-600">
                    ✓ Uploaded: {uploadedDocuments.taxCardDocument.fileName}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Baladiya */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Baladiya</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="baladiyaNumber" className="block text-sm font-medium text-gray-700">
                  Baladiya Number
                </label>
                <input
                  type="text"
                  id="baladiyaNumber"
                  name="baladiyaNumber"
                  value={branchData.baladiyaNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="baladiyaExpiry" className="block text-sm font-medium text-gray-700">
                  Baladiya Expiry Date
                </label>
                <input
                  type="date"
                  id="baladiyaExpiry"
                  name="baladiyaExpiry"
                  value={branchData.baladiyaExpiry}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Baladiya Document</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Baladiya Document</label>
              <div className="flex space-x-2">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('baladiyaDocument', e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                />
                <button
                  type="button"
                  onClick={() => handleUploadClick('baladiyaDocument')}
                  disabled={uploadingStates.baladiyaDocument || !documentFiles.baladiyaDocument}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploadingStates.baladiyaDocument ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {uploadedDocuments.baladiyaDocument && (
                <div className="mt-1 text-xs text-green-600">
                  ✓ Uploaded: {uploadedDocuments.baladiyaDocument.fileName}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Brand Assets */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-md font-medium text-gray-700 mb-4">Brand Assets</h3>
          
          {/* Logo */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Company Logo</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Logo
              </label>
              <div className="flex space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('logoDocument', e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                />
                <button
                  type="button"
                  onClick={() => handleUploadClick('logoDocument')}
                  disabled={uploadingStates.logoDocument || !documentFiles.logoDocument}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploadingStates.logoDocument ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {uploadedDocuments.logoDocument && (
                <div className="mt-1 text-xs text-green-600">
                  ✓ Uploaded: {uploadedDocuments.logoDocument.fileName}
                </div>
              )}
            </div>
          </div>
          
          {/* Letterhead */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Letterhead</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Letterhead
              </label>
              <div className="flex space-x-2">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('letterheadDocument', e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                />
                <button
                  type="button"
                  onClick={() => handleUploadClick('letterheadDocument')}
                  disabled={uploadingStates.letterheadDocument || !documentFiles.letterheadDocument}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploadingStates.letterheadDocument ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {uploadedDocuments.letterheadDocument && (
                <div className="mt-1 text-xs text-green-600">
                  ✓ Uploaded: {uploadedDocuments.letterheadDocument.fileName}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bank Details */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">Bank Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                Bank Name
              </label>
              <input
                type="text"
                id="bankName"
                name="bankName"
                value={branchData.bankName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700">
                Account Number
              </label>
              <input
                type="text"
                id="bankAccountNumber"
                name="bankAccountNumber"
                value={branchData.bankAccountNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="ibanNumber" className="block text-sm font-medium text-gray-700">
                IBAN Number
              </label>
              <input
                type="text"
                id="ibanNumber"
                name="ibanNumber"
                value={branchData.ibanNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        

        

        

        
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 bg-white py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Branch
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}