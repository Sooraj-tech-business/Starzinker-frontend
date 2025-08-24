import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/config';

export default function AddUser({ onClose, onAddUser }) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'Driver',
    branch: '',
    password: '',
    designation: '',
    doj: '',
    qid: '',
    doe: '',
    passportNumber: '',
    workLocation: '',
    status: 'Working',
    bankName: '',
    bankAccountNumber: '',
    emergencyContact: '',
    emergencyContact2: '',
    nativeAddress: '',
    medicalCardNumber: '',
    medicalCardExpiry: '',
    visaNumber: '',
    visaExpiry: '',
    qidExpiry: '',
    passportExpiry: '',
    phone: '',
    nationality: '',
    salary: '',
    visaAddedBranch: ''
  });
  
  const [documentFiles, setDocumentFiles] = useState({
    qidFile: null,
    passportFile: null,
    visaFile: null,
    medicalCardFile: null,
    workAgreementFile: null,
    profilePictureFile: null
  });
  
  const [previews, setPreviews] = useState({});
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [uploadingStates, setUploadingStates] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [employeeId, setEmployeeId] = useState(null);
  const [branches, setBranches] = useState([]);
  
  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/branches`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setBranches(data || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);
  
  const handleFileChange = (documentType, file) => {
    setDocumentFiles(prev => ({ ...prev, [documentType]: file }));
    
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({ ...prev, [documentType]: e.target.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews(prev => ({ ...prev, [documentType]: null }));
    }
  };

  const uploadToS3 = async (documentType, file, empId) => {
    if (!file || !empId) {
      console.error('Missing file or employee ID:', { file: !!file, empId });
      return null;
    }
    
    console.log(`Starting upload for ${documentType}:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      employeeId: empId
    });
    
    setUploadingStates(prev => ({ ...prev, [documentType]: true }));
    
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      const uploadUrl = `${API_BASE_URL}/api/upload/simple/${empId}/${documentType}`;
      console.log('🌐 Upload URL:', uploadUrl);
      console.log('📦 FormData contents:', file.name, file.type);
      
      const token = localStorage.getItem('token');
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Upload result:', result);
      
      if (result.success) {
        setUploadedDocuments(prev => ({ 
          ...prev, 
          [documentType]: {
            url: result.s3Url,
            fileName: result.document.fileName,
            uploadedAt: result.document.uploadedAt
          }
        }));
        console.log(`✅ Successfully uploaded ${documentType}`);
        return result.s3Url;
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error(`❌ Error uploading ${documentType}:`, error);
      setError(`Failed to upload ${documentType}: ${error.message}`);
      return null;
    } finally {
      setUploadingStates(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleUploadClick = async (documentType) => {
    const fileInput = document.getElementById(`${documentType}Input`);
    const file = fileInput.files[0];
    
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    // Upload directly to S3
    setUploadingStates(prev => ({ ...prev, [documentType]: true }));
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('email', userData.email);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/upload/direct/${documentType}`, {
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
        console.log(`✅ Successfully uploaded ${documentType}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(`❌ Error uploading ${documentType}:`, error);
      setError(`Failed to upload ${documentType}: ${error.message}`);
    } finally {
      setUploadingStates(prev => ({ ...prev, [documentType]: false }));
    }

  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    setError('');
    
    // Validate required fields - only basic information
    if (!userData.name || !userData.email || !userData.role || !userData.workLocation || 
         !userData.password) {
      setError('Please fill in all required fields (Name, Email, Role, Work Location, Password)');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Create payload with S3 URLs included
      const employeePayload = {
        ...userData,
        documents: {
          qidCopy: uploadedDocuments.qidCopy || null,
          passportCopy: uploadedDocuments.passportCopy || null,
          visa: uploadedDocuments.visa || null,
          medicalCard: uploadedDocuments.medicalCard || null,
          workAgreement: uploadedDocuments.workAgreement || null,
          profilePicture: uploadedDocuments.profilePicture || null
        }
      };
      
      console.log('Employee payload with S3 URLs:', employeePayload);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(employeePayload)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('Employee created with documents:', result.employee);
        onAddUser(result.employee);
        onClose();
      } else {
        // Handle error response
        setError(result.message || 'Failed to create employee');
        setIsSubmitting(false);
        return;
      }
      
    } catch (err) {
      console.error('Error adding employee:', err);
      setError(err.message || 'Failed to add employee. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full">
      <div className="bg-indigo-600 px-4 py-3 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Add New Employee</h2>
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
      
      <div className="p-4">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Basic Information</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={userData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={userData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role*
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={userData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Driver">Driver</option>
                  <option value="Sandwich maker">Sandwich maker</option>
                  <option value="Cook">Cook</option>
                  <option value="Manager">Manager</option>
                  <option value="Gm manager">GM Manager</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Juice maker">Juice maker</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Account">Account</option>
                  <option value="Shawarma maker">Shawarma maker</option>
                  <option value="Founder">Founder</option>
                  <option value="Co-founder">Co-founder</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700">
                  Work Location*
                </label>
                <select
                  id="workLocation"
                  name="workLocation"
                  required
                  value={userData.workLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Work Location</option>
                  {branches.map(branch => (
                    <option key={branch._id} value={branch.name}>{branch.name}</option>
                  ))}
                </select>
              </div>
              
              {/* <div>
                <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700">
                  Work Location*
                </label>
                <input
                  type="text"
                  id="workLocation"
                  name="workLocation"
                  required
                  value={userData.workLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div> */}
              <div>
                <label htmlFor="visaAddedBranch" className="block text-sm font-medium text-gray-700">
                  Visa Added Branch
                </label>
                <select
                  id="visaAddedBranch"
                  name="visaAddedBranch"
                  value={userData.visaAddedBranch}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch._id} value={branch.name}>{branch.name}</option>
                  ))}
                </select>
              </div>
              
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={userData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Working">Working</option>
                  <option value="Vacation">Vacation</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                  Nationality
                </label>
                <select
                  id="nationality"
                  name="nationality"
                  value={userData.nationality}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Nationality</option>
                  <option value="Nepal">Nepal</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="India">India</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Pakistan">Pakistan</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                  Salary (QR)
                </label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={userData.salary}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password*
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={userData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Profile Picture */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">Profile Picture</h3>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                {previews.profilePictureFile ? (
                  <img src={previews.profilePictureFile} alt="Profile preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <input
                  id="profilePictureInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('profilePictureFile', e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 mb-2"
                />
                <button
                  type="button"
                  onClick={() => handleUploadClick('profilePicture')}
                  disabled={uploadingStates.profilePicture || !documentFiles.profilePictureFile}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploadingStates.profilePicture ? 'Uploading...' : 'Upload Profile Picture'}
                </button>
                {uploadedDocuments.profilePicture && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ Uploaded: {uploadedDocuments.profilePicture.fileName}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* ID & Documents */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">ID & Documents</h3>
            
            {/* QID Section */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label htmlFor="qid" className="block text-sm font-medium text-gray-700">
                    QID Number
                  </label>
                  <input
                    type="text"
                    id="qid"
                    name="qid"
                    value={userData.qid}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="qidExpiry" className="block text-sm font-medium text-gray-700">
                    QID Expiry Date
                  </label>
                  <input
                    type="date"
                    id="qidExpiry"
                    name="qidExpiry"
                    value={userData.qidExpiry}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload QID Copy
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="qidCopyInput"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange('qidFile', e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleUploadClick('qidCopy')}
                      disabled={uploadingStates.qidCopy || !documentFiles.qidFile}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {uploadingStates.qidCopy ? 'Uploading...' : 'Upload to S3'}
                    </button>
                  </div>
                  {uploadedDocuments.qidCopy && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ Uploaded: {uploadedDocuments.qidCopy.fileName}
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50">
                  {previews.qidFile ? (
                    <img src={previews.qidFile} alt="QID preview" className="w-full h-full object-cover rounded" />
                  ) : documentFiles.qidFile && documentFiles.qidFile.type === 'application/pdf' ? (
                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Passport Section */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    id="passportNumber"
                    name="passportNumber"
                    value={userData.passportNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="passportExpiry" className="block text-sm font-medium text-gray-700">
                    Passport Expiry Date
                  </label>
                  <input
                    type="date"
                    id="passportExpiry"
                    name="passportExpiry"
                    value={userData.passportExpiry}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Passport Copy
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="passportCopyInput"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange('passportFile', e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleUploadClick('passportCopy')}
                      disabled={uploadingStates.passportCopy || !documentFiles.passportFile}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {uploadingStates.passportCopy ? 'Uploading...' : 'Upload to S3'}
                    </button>
                  </div>
                  {uploadedDocuments.passportCopy && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ Uploaded: {uploadedDocuments.passportCopy.fileName}
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50">
                  {previews.passportFile ? (
                    <img src={previews.passportFile} alt="Passport preview" className="w-full h-full object-cover rounded" />
                  ) : documentFiles.passportFile && documentFiles.passportFile.type === 'application/pdf' ? (
                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Visa Section */}
            {/* <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label htmlFor="visaNumber" className="block text-sm font-medium text-gray-700">
                    Visa Number
                  </label>
                  <input
                    type="text"
                    id="visaNumber"
                    name="visaNumber"
                    value={userData.visaNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="visaExpiry" className="block text-sm font-medium text-gray-700">
                    Visa Expiry
                  </label>
                  <input
                    type="date"
                    id="visaExpiry"
                    name="visaExpiry"
                    value={userData.visaExpiry}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="visaAddedBranch" className="block text-sm font-medium text-gray-700">
                    Visa Added Branch
                  </label>
                  <select
                    id="visaAddedBranch"
                    name="visaAddedBranch"
                    value={userData.visaAddedBranch}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch._id} value={branch.name}>{branch.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Visa
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="visaInput"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange('visaFile', e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleUploadClick('visa')}
                      disabled={uploadingStates.visa || !documentFiles.visaFile}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {uploadingStates.visa ? 'Uploading...' : 'Upload to S3'}
                    </button>
                  </div>
                  {uploadedDocuments.visa && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ Uploaded: {uploadedDocuments.visa.fileName}
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50">
                  {previews.visaFile ? (
                    <img src={previews.visaFile} alt="Visa preview" className="w-full h-full object-cover rounded" />
                  ) : documentFiles.visaFile && documentFiles.visaFile.type === 'application/pdf' ? (
                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
              </div>
            </div> */}

            {/* Medical Card Section */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label htmlFor="medicalCardNumber" className="block text-sm font-medium text-gray-700">
                    Medical Card Employee name 
                  </label>
                  <input
                    type="text"
                    id="medicalCardNumber"
                    name="medicalCardNumber"
                    value={userData.medicalCardNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="medicalCardExpiry" className="block text-sm font-medium text-gray-700">
                    Medical Card Expiry
                  </label>
                  <input
                    type="date"
                    id="medicalCardExpiry"
                    name="medicalCardExpiry"
                    value={userData.medicalCardExpiry}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Medical Card
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="medicalCardInput"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange('medicalCardFile', e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleUploadClick('medicalCard')}
                      disabled={uploadingStates.medicalCard || !documentFiles.medicalCardFile}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {uploadingStates.medicalCard ? 'Uploading...' : 'Upload to S3'}
                    </button>
                  </div>
                  {uploadedDocuments.medicalCard && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ Uploaded: {uploadedDocuments.medicalCard.fileName}
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50">
                  {previews.medicalCardFile ? (
                    <img src={previews.medicalCardFile} alt="Medical card preview" className="w-full h-full object-cover rounded" />
                  ) : documentFiles.medicalCardFile && documentFiles.medicalCardFile.type === 'application/pdf' ? (
                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Work Agreement Section */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Work Agreement
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="workAgreementInput"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange('workAgreementFile', e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleUploadClick('workAgreement')}
                      disabled={uploadingStates.workAgreement || !documentFiles.workAgreementFile}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {uploadingStates.workAgreement ? 'Uploading...' : 'Upload to S3'}
                    </button>
                  </div>
                  {uploadedDocuments.workAgreement && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ Uploaded: {uploadedDocuments.workAgreement.fileName}
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50">
                  {previews.workAgreementFile ? (
                    <img src={previews.workAgreementFile} alt="Work agreement preview" className="w-full h-full object-cover rounded" />
                  ) : documentFiles.workAgreementFile && documentFiles.workAgreementFile.type === 'application/pdf' ? (
                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Important Dates */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">Important Dates</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="doj" className="block text-sm font-medium text-gray-700">
                  Date of Joining
                </label>
                <input
                  type="date"
                  id="doj"
                  name="doj"
                  value={userData.doj}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              {/* <div>
                <label htmlFor="doe" className="block text-sm font-medium text-gray-700">
                  Date of Exit
                </label>
                <input
                  type="date"
                  id="doe"
                  name="doe"
                  value={userData.doe}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div> */}
            </div>
          </div>
          
          {/* Contact & Banking */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">Contact & Banking</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={userData.bankName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  value={userData.bankAccountNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={userData.emergencyContact}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              {/* <div>
                <label htmlFor="emergencyContact2" className="block text-sm font-medium text-gray-700">
                  Emergency Contact 2
                </label>
                <input
                  type="text"
                  id="emergencyContact2"
                  name="emergencyContact2"
                  value={userData.emergencyContact2}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div> */}
              
              <div className="sm:col-span-2">
                <label htmlFor="nativeAddress" className="block text-sm font-medium text-gray-700">
                  Native Address
                </label>
                <textarea
                  id="nativeAddress"
                  name="nativeAddress"
                  rows="3"
                  value={userData.nativeAddress}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 bg-white py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding Employee...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}