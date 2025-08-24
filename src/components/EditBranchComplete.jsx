import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/config';

export default function EditBranchComplete({ branch, onClose, onUpdateBranch, users }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    manager: '',
    contactNumber: '',
    email: '',
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
    bankName: '',
    bankAccountNumber: '',
    ibanNumber: '',
    branchDocuments: {},
    documents: [],
    vehicles: [],
    assignedUsers: []
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

  // Initialize form with branch data
  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name || '',
        location: branch.location || '',
        address: branch.address || '',
        manager: branch.manager || '',
        contactNumber: branch.contactNumber || '',
        email: branch.email || '',
        crNumber: branch.crNumber || '',
        crExpiry: branch.crExpiry ? new Date(branch.crExpiry).toISOString().split('T')[0] : '',
        ruksaNumber: branch.ruksaNumber || '',
        ruksaExpiry: branch.ruksaExpiry ? new Date(branch.ruksaExpiry).toISOString().split('T')[0] : '',
        computerCardNumber: branch.computerCardNumber || '',
        computerCardExpiry: branch.computerCardExpiry ? new Date(branch.computerCardExpiry).toISOString().split('T')[0] : '',
        certificationNumber: branch.certificationNumber || '',
        certificationExpiry: branch.certificationExpiry ? new Date(branch.certificationExpiry).toISOString().split('T')[0] : '',
        taxCardNumber: branch.taxCardNumber || '',
        taxCardExpiry: branch.taxCardExpiry ? new Date(branch.taxCardExpiry).toISOString().split('T')[0] : '',
        baladiyaNumber: branch.baladiyaNumber || '',
        baladiyaExpiry: branch.baladiyaExpiry ? new Date(branch.baladiyaExpiry).toISOString().split('T')[0] : '',
        bankName: branch.bankName || '',
        bankAccountNumber: branch.bankAccountNumber || '',
        ibanNumber: branch.ibanNumber || '',
        branchDocuments: branch.branchDocuments || {},
        documents: Array.isArray(branch.documents) ? [...branch.documents] : [],
        vehicles: Array.isArray(branch.vehicles) ? [...branch.vehicles] : [],
        assignedUsers: Array.isArray(branch.assignedUsers) ? [...branch.assignedUsers] : []
      });
      setUploadedDocuments(branch.branchDocuments || {});
    }
  }, [branch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };





  // Vehicle handling
  const handleAddVehicle = () => {
    const newVehicle = {
      type: '',
      licenseNumber: '',
      licenseExpiry: new Date().toISOString().split('T')[0],
      insuranceExpiry: new Date().toISOString().split('T')[0],
      make: '',
      model: '',
      year: 2025,
      color: '',
      status: 'active'
    };
    setFormData({
      ...formData,
      vehicles: [...formData.vehicles, newVehicle]
    });
  };

  const handleVehicleChange = (index, field, value) => {
    const updatedVehicles = [...formData.vehicles];
    updatedVehicles[index] = {
      ...updatedVehicles[index],
      [field]: value
    };
    setFormData({
      ...formData,
      vehicles: updatedVehicles
    });
  };

  const handleRemoveVehicle = (index) => {
    const updatedVehicles = formData.vehicles.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      vehicles: updatedVehicles
    });
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
    
    const formDataUpload = new FormData();
    formDataUpload.append('document', file);
    formDataUpload.append('branchName', formData.name || 'Branch');
    formDataUpload.append('branchId', branch._id);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/upload/branch/${documentType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });
      
      const result = await response.json();
      
      if (result.success) {
        const s3Data = {
          url: result.s3Url,
          fileName: result.document.fileName,
          uploadedAt: result.document.uploadedAt
        };
        
        setUploadedDocuments(prev => ({ ...prev, [documentType]: s3Data }));
        setFormData(prev => ({
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
    
    // Create updated branch object with all fields
    const updatedBranch = {
      _id: branch._id,
      ...formData
    };
    
    onUpdateBranch(updatedBranch);
    onClose();
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="bg-indigo-600 px-6 py-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Edit Branch: {branch.name}</h2>
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
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Branch Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              
              <div>
                <label htmlFor="manager" className="block text-sm font-medium text-gray-700">Manager</label>
                <input
                  type="text"
                  id="manager"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Branch Documents */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Branch Documents</h3>
            
            {/* Company CR */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Company CR (Commercial Registration)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="crNumber" className="block text-sm font-medium text-gray-700">CR Number</label>
                  <input
                    type="text"
                    id="crNumber"
                    name="crNumber"
                    value={formData.crNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="crExpiry" className="block text-sm font-medium text-gray-700">CR Expiry Date</label>
                  <input
                    type="date"
                    id="crExpiry"
                    name="crExpiry"
                    value={formData.crExpiry}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload CR Document</label>
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
                  <label htmlFor="ruksaNumber" className="block text-sm font-medium text-gray-700">Ruksa Number</label>
                  <input
                    type="text"
                    id="ruksaNumber"
                    name="ruksaNumber"
                    value={formData.ruksaNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="ruksaExpiry" className="block text-sm font-medium text-gray-700">Ruksa Expiry Date</label>
                  <input
                    type="date"
                    id="ruksaExpiry"
                    name="ruksaExpiry"
                    value={formData.ruksaExpiry}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Ruksa Document</label>
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
                  <label htmlFor="computerCardNumber" className="block text-sm font-medium text-gray-700">Computer Card Number</label>
                  <input
                    type="text"
                    id="computerCardNumber"
                    name="computerCardNumber"
                    value={formData.computerCardNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="computerCardExpiry" className="block text-sm font-medium text-gray-700">Computer Card Expiry Date</label>
                  <input
                    type="date"
                    id="computerCardExpiry"
                    name="computerCardExpiry"
                    value={formData.computerCardExpiry}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Computer Card Document</label>
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
                  <label htmlFor="certificationNumber" className="block text-sm font-medium text-gray-700">Certification Number</label>
                  <input
                    type="text"
                    id="certificationNumber"
                    name="certificationNumber"
                    value={formData.certificationNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="certificationExpiry" className="block text-sm font-medium text-gray-700">Certification Expiry Date</label>
                  <input
                    type="date"
                    id="certificationExpiry"
                    name="certificationExpiry"
                    value={formData.certificationExpiry}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Certification Document</label>
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
          </div>
          
          {/* Tax Card */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Tax Card</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="taxCardNumber" className="block text-sm font-medium text-gray-700">Tax Card Number</label>
                <input
                  type="text"
                  id="taxCardNumber"
                  name="taxCardNumber"
                  value={formData.taxCardNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="taxCardExpiry" className="block text-sm font-medium text-gray-700">Tax Card Expiry Date</label>
                <input
                  type="date"
                  id="taxCardExpiry"
                  name="taxCardExpiry"
                  value={formData.taxCardExpiry}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Tax Card Document</label>
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
                <label htmlFor="baladiyaNumber" className="block text-sm font-medium text-gray-700">Baladiya Number</label>
                <input
                  type="text"
                  id="baladiyaNumber"
                  name="baladiyaNumber"
                  value={formData.baladiyaNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="baladiyaExpiry" className="block text-sm font-medium text-gray-700">Baladiya Expiry Date</label>
                <input
                  type="date"
                  id="baladiyaExpiry"
                  name="baladiyaExpiry"
                  value={formData.baladiyaExpiry}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Brand Assets */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Assets</h3>
          
          {/* Logo */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Company Logo</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Logo</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Letterhead</label>
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
        
        {/* Bank Details */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Bank Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input
                type="text"
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
              <input
                type="text"
                id="bankAccountNumber"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="ibanNumber" className="block text-sm font-medium text-gray-700">IBAN Number</label>
              <input
                type="text"
                id="ibanNumber"
                name="ibanNumber"
                value={formData.ibanNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
          
          {/* Vehicles Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Vehicles</h3>
              <button
                type="button"
                onClick={handleAddVehicle}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Vehicle
              </button>
            </div>
            
            {formData.vehicles.length === 0 ? (
              <p className="text-sm text-gray-500">No vehicles added yet.</p>
            ) : (
              <div className="space-y-4">
                {formData.vehicles.map((vehicle, index) => (
                  <div key={index} className="flex flex-wrap items-end gap-4 p-4 border border-gray-200 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                        <select
                          value={vehicle.type || ''}
                          onChange={(e) => handleVehicleChange(index, 'type', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">Select a type</option>
                          <option value="Sedan">Sedan</option>
                          <option value="SUV">SUV</option>
                          <option value="Van">Van</option>
                          <option value="Truck">Truck</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">e.g. Sedan, Truck, Van</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Istimara</label>
                        <input
                          type="text"
                          value={vehicle.istimara || ''}
                          onChange={(e) => handleVehicleChange(index, 'istimara', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                        <input
                          type="text"
                          value={vehicle.vehicleNumber || ''}
                          onChange={(e) => handleVehicleChange(index, 'vehicleNumber', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Make</label>
                        <input
                          type="text"
                          value={vehicle.make || ''}
                          onChange={(e) => handleVehicleChange(index, 'make', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Model</label>
                        <input
                          type="text"
                          value={vehicle.model || ''}
                          onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Year (Optional)</label>
                        <input
                          type="number"
                          value={vehicle.year || ''}
                          onChange={(e) => handleVehicleChange(index, 'year', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Color</label>
                        <input
                          type="text"
                          value={vehicle.color || ''}
                          onChange={(e) => handleVehicleChange(index, 'color', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">License Expiry Date</label>
                        <input
                          type="date"
                          value={vehicle.licenseExpiry ? new Date(vehicle.licenseExpiry).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleVehicleChange(index, 'licenseExpiry', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="dd/mm/yyyy"
                        />
                        <p className="mt-1 text-xs text-gray-500">dd/mm/yyyy</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Insurance Expiry Date</label>
                        <input
                          type="date"
                          value={vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleVehicleChange(index, 'insuranceExpiry', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="dd/mm/yyyy"
                        />
                        <p className="mt-1 text-xs text-gray-500">dd/mm/yyyy</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          value={vehicle.status || 'active'}
                          onChange={(e) => handleVehicleChange(index, 'status', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="retired">Retired</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Vehicle Documents */}
                    <div className="w-full mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Vehicle Documents</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* License Document */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">License Document</label>
                          {vehicle.licenseDocument?.url ? (
                            <div className="mb-2">
                              <a 
                                href={vehicle.licenseDocument.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                              >
                                📄 View Current License Document
                              </a>
                              <div className="text-xs text-gray-500 mt-1">
                                Uploaded: {vehicle.licenseDocument.fileName}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 mb-2">No license document uploaded</div>
                          )}
                        </div>
                        
                        {/* Insurance Document */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Document</label>
                          {vehicle.insuranceDocument?.url ? (
                            <div className="mb-2">
                              <a 
                                href={vehicle.insuranceDocument.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                              >
                                📄 View Current Insurance Document
                              </a>
                              <div className="text-xs text-gray-500 mt-1">
                                Uploaded: {vehicle.insuranceDocument.fileName}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 mb-2">No insurance document uploaded</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600">
                        💡 To upload/update vehicle documents, use the Vehicle Management section
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVehicle(index)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove Vehicle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          

          
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}