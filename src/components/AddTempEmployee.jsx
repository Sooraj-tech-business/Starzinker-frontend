import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/config';

export default function AddTempEmployee({ onClose, onAddTempEmployee, branches }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    workLocation: '',
    designation: '',
    doj: '',
    qid: '',
    qidExpiry: '',
    passportNumber: '',
    passportExpiry: '',
    phone: '',
    nationality: '',
    salary: '',
    medicalCardNumber: '',
    medicalCardExpiry: '',
    status: 'Working'
  });
  
  const [documentFiles, setDocumentFiles] = useState({
    qidFile: null,
    passportFile: null,
    medicalCardFile: null,
    workAgreementFile: null,
    profilePictureFile: null
  });
  
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [uploadingStates, setUploadingStates] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    formDataUpload.append('email', formData.email || 'temp-employee');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/upload/direct/${documentType}`, {
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
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert(`Failed to upload ${documentType}: ${error.message}`);
    } finally {
      setUploadingStates(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const tempEmployeeData = {
      ...formData,
      documents: {
        qidCopy: uploadedDocuments.qidFile || null,
        passportCopy: uploadedDocuments.passportFile || null,
        medicalCard: uploadedDocuments.medicalCardFile || null,
        workAgreement: uploadedDocuments.workAgreementFile || null,
        profilePicture: uploadedDocuments.profilePictureFile || null
      }
    };
    
    await onAddTempEmployee(tempEmployeeData);
    onClose();
  };

  return (
    <div className="bg-white p-6 rounded-lg max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Add Temporary Employee</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name*</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email*</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role*</label>
            <select
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Role</option>
              <option value="Driver">Driver</option>
              <option value="Cook">Cook</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Waiter">Waiter</option>
              <option value="Helper">Helper</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Work Location*</label>
            <select
              name="workLocation"
              required
              value={formData.workLocation}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Work Location</option>
              {branches?.map(branch => (
                <option key={branch._id} value={branch.name}>{branch.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Nationality</label>
            <select
              name="nationality"
              value={formData.nationality}
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
            <label className="block text-sm font-medium text-gray-700">Salary (QAR)</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Profile Picture */}
        <div className="border-t pt-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">Profile Picture</h3>
          <div className="flex space-x-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('profilePictureFile', e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
            />
            <button
              type="button"
              onClick={() => handleUploadClick('profilePictureFile')}
              disabled={uploadingStates.profilePictureFile || !documentFiles.profilePictureFile}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {uploadingStates.profilePictureFile ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {uploadedDocuments.profilePictureFile && (
            <div className="mt-1 text-xs text-green-600">
              ✓ Uploaded: {uploadedDocuments.profilePictureFile.fileName}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="border-t pt-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">Documents</h3>
          
          {/* QID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">QID Number</label>
              <input
                type="text"
                name="qid"
                value={formData.qid}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">QID Expiry Date</label>
              <input
                type="date"
                name="qidExpiry"
                value={formData.qidExpiry}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload QID Copy</label>
              <div className="flex space-x-2">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('qidFile', e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                />
                <button
                  type="button"
                  onClick={() => handleUploadClick('qidFile')}
                  disabled={uploadingStates.qidFile || !documentFiles.qidFile}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {uploadingStates.qidFile ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {uploadedDocuments.qidFile && (
                <div className="mt-1 text-xs text-green-600">
                  ✓ Uploaded: {uploadedDocuments.qidFile.fileName}
                </div>
              )}
            </div>
          </div>

          {/* Passport */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Passport Number</label>
              <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Passport Expiry Date</label>
              <input
                type="date"
                name="passportExpiry"
                value={formData.passportExpiry}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Passport Copy</label>
              <div className="flex space-x-2">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('passportFile', e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                />
                <button
                  type="button"
                  onClick={() => handleUploadClick('passportFile')}
                  disabled={uploadingStates.passportFile || !documentFiles.passportFile}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {uploadingStates.passportFile ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {uploadedDocuments.passportFile && (
                <div className="mt-1 text-xs text-green-600">
                  ✓ Uploaded: {uploadedDocuments.passportFile.fileName}
                </div>
              )}
            </div>
          </div>

          {/* Medical Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Medical Card Number</label>
              <input
                type="text"
                name="medicalCardNumber"
                value={formData.medicalCardNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Medical Card Expiry</label>
              <input
                type="date"
                name="medicalCardExpiry"
                value={formData.medicalCardExpiry}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Medical Card</label>
              <div className="flex space-x-2">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('medicalCardFile', e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
                />
                <button
                  type="button"
                  onClick={() => handleUploadClick('medicalCardFile')}
                  disabled={uploadingStates.medicalCardFile || !documentFiles.medicalCardFile}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {uploadingStates.medicalCardFile ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {uploadedDocuments.medicalCardFile && (
                <div className="mt-1 text-xs text-green-600">
                  ✓ Uploaded: {uploadedDocuments.medicalCardFile.fileName}
                </div>
              )}
            </div>
          </div>

          {/* Work Agreement */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Work Agreement</label>
            <div className="flex space-x-2">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange('workAgreementFile', e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
              />
              <button
                type="button"
                onClick={() => handleUploadClick('workAgreementFile')}
                disabled={uploadingStates.workAgreementFile || !documentFiles.workAgreementFile}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {uploadingStates.workAgreementFile ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            {uploadedDocuments.workAgreementFile && (
              <div className="mt-1 text-xs text-green-600">
                ✓ Uploaded: {uploadedDocuments.workAgreementFile.fileName}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Temporary Employee
          </button>
        </div>
      </form>
    </div>
  );
}