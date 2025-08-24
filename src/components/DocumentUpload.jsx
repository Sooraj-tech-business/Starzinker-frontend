import { useState } from 'react';
import api from '../api/config';

export default function DocumentUpload({ employeeId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState({
    profilePicture: null,
    medicalCard: null,
    visa: null,
    contract: null,
    qidCopy: null,
    passportCopy: null
  });

  const documentTypes = [
    { key: 'profilePicture', label: 'Profile Picture', accept: 'image/*' },
    { key: 'medicalCard', label: 'Medical Card', accept: '.pdf,image/*' },
    { key: 'visa', label: 'Visa Document', accept: '.pdf,image/*' },
    { key: 'contract', label: 'Contract', accept: '.pdf,image/*' },
    { key: 'qidCopy', label: 'QID Copy', accept: '.pdf,image/*' },
    { key: 'passportCopy', label: 'Passport Copy', accept: '.pdf,image/*' }
  ];

  const handleFileChange = (documentType, file) => {
    setFiles(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const handleUpload = async () => {
    if (!employeeId) {
      alert('Employee ID is required');
      return;
    }

    const formData = new FormData();
    formData.append('employeeId', employeeId);

    // Add files to form data
    Object.keys(files).forEach(key => {
      if (files[key]) {
        formData.append(key, files[key]);
      }
    });

    setUploading(true);
    try {
      const response = await api.post(`/api/upload/employee-documents/${employeeId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('Documents uploaded successfully!');
        setFiles({
          profilePicture: null,
          medicalCard: null,
          visa: null,
          contract: null,
          qidCopy: null,
          passportCopy: null
        });
        if (onUploadComplete) {
          onUploadComplete(response.data.documents);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentTypes.map(({ key, label, accept }) => (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type="file"
              accept={accept}
              onChange={(e) => handleFileChange(key, e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {files[key] && (
              <p className="text-xs text-green-600">
                Selected: {files[key].name}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={uploading || !Object.values(files).some(file => file)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Documents'}
        </button>
      </div>
    </div>
  );
}