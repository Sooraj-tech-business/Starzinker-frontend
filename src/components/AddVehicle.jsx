import { useState } from 'react';
import { API_BASE_URL } from '../api/config';

export default function AddVehicle({ onClose, onAddVehicle, branches }) {
  const [formData, setFormData] = useState({
    type: '',
    licenseNumber: '',
    licenseExpiry: '',
    insuranceExpiry: '',
    branchId: branches && branches.length > 0 ? branches[0]._id : '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    status: 'active'
  });
  
  const [errors, setErrors] = useState({});
  const [documentFiles, setDocumentFiles] = useState({
    licenseDocument: null,
    insuranceDocument: null
  });
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [uploadingStates, setUploadingStates] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
    formDataUpload.append('vehicleId', 'temp-upload'); // Temporary ID for upload
    formDataUpload.append('branchId', formData.branchId);
    
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
        console.log('Document uploaded:', documentType, s3Data);
        return s3Data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert(`Failed to upload ${documentType}: ${error.message}`);
      throw error;
    } finally {
      setUploadingStates(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const validateForm = () => {
    return true; // Remove all validation
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Create vehicle first
        const vehicleData = {
          ...formData,
          branch: formData.branchId,
          licenseDocument: uploadedDocuments.licenseDocument || null,
          insuranceDocument: uploadedDocuments.insuranceDocument || null
        };
        
        await onAddVehicle(vehicleData);
        onClose();
      } catch (error) {
        alert('Failed to create vehicle: ' + error.message);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Add New Vehicle</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Vehicle Type
            </label>
            <select
              name="type"
              id="type"
              value={formData.type}
              onChange={handleChange}
              className={`mt-1 block w-full border ${errors.type ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            >
              <option value="">Select vehicle type</option>
              <option value="Car">Car</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Bike">Bike</option>
              <option value="Scooty">Scooty</option>
              <option value="Cycle">Cycle</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
              Vehicle Number
            </label>
            <input
              type="text"
              name="licenseNumber"
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              className={`mt-1 block w-full border ${errors.licenseNumber ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.licenseNumber && <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>}
          </div>

          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700">
              Make
            </label>
            <input
              type="text"
              name="make"
              id="make"
              value={formData.make}
              onChange={handleChange}
              className={`mt-1 block w-full border ${errors.make ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make}</p>}
          </div>

          {/* <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Model
            </label>
            <input
              type="text"
              name="model"
              id="model"
              value={formData.model}
              onChange={handleChange}
              className={`mt-1 block w-full border ${errors.model ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
          </div> */}

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <input
              type="number"
              name="year"
              id="year"
              value={formData.year}
              onChange={handleChange}
              className={`mt-1 block w-full border ${errors.year ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <input
              type="text"
              name="color"
              id="color"
              value={formData.color}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="licenseExpiry" className="block text-sm font-medium text-gray-700">
              Istimara Expiry Date (Optional)
            </label>
            <input
              type="date"
              name="licenseExpiry"
              id="licenseExpiry"
              value={formData.licenseExpiry}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Istimara Document
            </label>
            <div className="flex space-x-2">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange('licenseDocument', e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
              />
              <button
                type="button"
                onClick={() => handleUploadClick('licenseDocument')}
                disabled={uploadingStates.licenseDocument || !documentFiles.licenseDocument}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploadingStates.licenseDocument ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            {uploadedDocuments.licenseDocument && (
              <div className="mt-1 text-xs text-green-600">
                ✓ Uploaded: {uploadedDocuments.licenseDocument.fileName}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="insuranceExpiry" className="block text-sm font-medium text-gray-700">
              Insurance Expiry Date (Optional)
            </label>
            <input
              type="date"
              name="insuranceExpiry"
              id="insuranceExpiry"
              value={formData.insuranceExpiry}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Insurance Document
            </label>
            <div className="flex space-x-2">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange('insuranceDocument', e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700"
              />
              <button
                type="button"
                onClick={() => handleUploadClick('insuranceDocument')}
                disabled={uploadingStates.insuranceDocument || !documentFiles.insuranceDocument}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploadingStates.insuranceDocument ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            {uploadedDocuments.insuranceDocument && (
              <div className="mt-1 text-xs text-green-600">
                ✓ Uploaded: {uploadedDocuments.insuranceDocument.fileName}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>

          <div>
            <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">
              Branch
            </label>
            <select
              name="branchId"
              id="branchId"
              value={formData.branchId}
              onChange={handleChange}
              className={`mt-1 block w-full border ${errors.branchId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            >
              {branches && branches.map(branch => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
            {errors.branchId && <p className="mt-1 text-sm text-red-600">{errors.branchId}</p>}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Vehicle
          </button>
        </div>
      </form>
    </div>
  );
}