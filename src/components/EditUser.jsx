import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/config';

export default function EditUser({ user, onClose, onUpdateUser }) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    branch: '',
    designation: '',
    doj: '',
    qid: '',
    doe: '',
    passportNumber: '',
    workLocation: '',
    status: '',
    bankName: '',
    bankAccountNumber: '',
    emergencyContact: '',
    emergencyContact2: '',
    nativeAddress: '',
    medicalCardNumber: '',
    medicalCardExpiry: '',
    visaNumber: '',
    visaExpiry: '',
    password: '',
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

  useEffect(() => {
    if (user) {
      // Format dates for input fields
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setUserData({
        ...user,
        doj: formatDate(user.doj),
        doe: formatDate(user.doe),
        visaExpiry: formatDate(user.visaExpiry),
        medicalCardExpiry: formatDate(user.medicalCardExpiry),
        qidExpiry: formatDate(user.qidExpiry),
        passportExpiry: formatDate(user.passportExpiry),
        password: '' // Don't populate password field
      });
      
      // Set existing documents
      if (user.documents) {
        setUploadedDocuments(user.documents);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
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
  
  const handleUploadClick = async (documentType) => {
    const fileInput = document.getElementById(`${documentType}Input`);
    const file = fileInput.files[0];
    
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Only send password if it was changed
      const dataToSend = {
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
      
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      
      // Let the Dashboard component handle which API to use
      onUpdateUser(dataToSend);
      onClose();
    } catch (err) {
      console.error('Error updating employee:', err);
      setError(err.response?.data?.message || 'Failed to update employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-h-[95vh] overflow-y-auto w-full">
      <div className="bg-indigo-600 px-6 py-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Edit Employee</h2>
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
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  Salary (QAR)
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
                  Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
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
                ) : uploadedDocuments.profilePicture ? (
                  <img src={uploadedDocuments.profilePicture.url} alt="Current profile" className="w-full h-full object-cover rounded-lg" />
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
                    ✓ Current: {uploadedDocuments.profilePicture.fileName}
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
                    QID Number*
                  </label>
                  <input
                    type="text"
                    id="qid"
                    name="qid"
                    required
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
                      {uploadingStates.qidCopy ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {uploadedDocuments.qidCopy && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ Current: {uploadedDocuments.qidCopy.fileName}
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50">
                  {previews.qidFile ? (
                    <img src={previews.qidFile} alt="QID preview" className="w-full h-full object-cover rounded" />
                  ) : uploadedDocuments.qidCopy ? (
                    <img src={uploadedDocuments.qidCopy.url} alt="Current QID" className="w-full h-full object-cover rounded" />
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
                    Passport Number*
                  </label>
                  <input
                    type="text"
                    id="passportNumber"
                    name="passportNumber"
                    required
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
                      {uploadingStates.passportCopy ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {uploadedDocuments.passportCopy && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ Current: {uploadedDocuments.passportCopy.fileName}
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50">
                  {previews.passportFile ? (
                    <img src={previews.passportFile} alt="Passport preview" className="w-full h-full object-cover rounded" />
                  ) : uploadedDocuments.passportCopy ? (
                    <img src={uploadedDocuments.passportCopy.url} alt="Current passport" className="w-full h-full object-cover rounded" />
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
                      {uploadingStates.visa ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {uploadedDocuments.visa && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ Current: {uploadedDocuments.visa.fileName}
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50">
                  {previews.visaFile ? (
                    <img src={previews.visaFile} alt="Visa preview" className="w-full h-full object-cover rounded" />
                  ) : uploadedDocuments.visa ? (
                    <img src={uploadedDocuments.visa.url} alt="Current visa" className="w-full h-full object-cover rounded" />
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
                    Medical Card Number
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
                      {uploadingStates.medicalCard ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {uploadedDocuments.medicalCard && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ Current: {uploadedDocuments.medicalCard.fileName}
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50">
                  {previews.medicalCardFile ? (
                    <img src={previews.medicalCardFile} alt="Medical card preview" className="w-full h-full object-cover rounded" />
                  ) : uploadedDocuments.medicalCard ? (
                    <img src={uploadedDocuments.medicalCard.url} alt="Current medical card" className="w-full h-full object-cover rounded" />
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
                      {uploadingStates.workAgreement ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {uploadedDocuments.workAgreement && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ Current: {uploadedDocuments.workAgreement.fileName}
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50">
                  {previews.workAgreementFile ? (
                    <img src={previews.workAgreementFile} alt="Work agreement preview" className="w-full h-full object-cover rounded" />
                  ) : uploadedDocuments.workAgreement ? (
                    <img src={uploadedDocuments.workAgreement.url} alt="Current work agreement" className="w-full h-full object-cover rounded" />
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
                  Date of Joining*
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
              </div>
               */}
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
              className="bg-indigo-600 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}