import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';

export default function PublicEmployeeForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Driver',
    branch: '',
    workLocation: '',
    status: 'Working',
    phone: '',
    nationality: '',
    salary: '',
    password: '',
    qid: '',
    qidExpiry: '',
    passportNumber: '',
    passportExpiry: '',
    visaNumber: '',
    visaExpiry: '',
    visaAddedBranch: '',
    medicalCardNumber: '',
    medicalCardExpiry: '',
    doj: '',
    doe: '',
    bankName: '',
    bankAccountNumber: '',
    emergencyContact: '',
    emergencyContact2: '',
    nativeAddress: ''
  });
  
  const [branches, setBranches] = useState([]);
  const [documentFiles, setDocumentFiles] = useState({});
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [uploadingStates, setUploadingStates] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get('/api/branches');
        setBranches(response.data || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (documentType, file) => {
    setDocumentFiles(prev => ({ ...prev, [documentType]: file }));
  };

  const uploadToS3 = async (documentType) => {
    const file = documentFiles[documentType];
    if (!file) {
      alert('Please select a file first');
      return;
    }
    
    setUploadingStates(prev => ({ ...prev, [documentType]: true }));
    
    const uploadFormData = new FormData();
    uploadFormData.append('document', file);
    uploadFormData.append('email', formData.email || 'temp@example.com');
    
    try {
      const response = await api.post(`/api/upload/direct/${documentType}`, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        const s3Data = {
          url: response.data.s3Url,
          fileName: response.data.document.fileName,
          uploadedAt: response.data.document.uploadedAt
        };
        
        setUploadedDocuments(prev => ({ ...prev, [documentType]: s3Data }));
        alert(`Successfully uploaded ${documentType}`);
      }
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      alert(`Failed to upload ${documentType}: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploadingStates(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email Address is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
    if (!formData.workLocation.trim()) newErrors.workLocation = 'Work Location is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const employeePayload = {
        ...formData,
        documents: uploadedDocuments
      };
      
      const response = await api.post('/api/employees/public-register', employeePayload);
      
      if (response.data.success) {
        // Redirect to success page
        navigate('/registration-success');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadSection = ({ documentType, label, accept = "image/*,application/pdf" }) => (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(documentType, e.target.files[0])}
          className="hidden"
          id={`${documentType}Input`}
        />
        <label
          htmlFor={`${documentType}Input`}
          className="cursor-pointer bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          {documentFiles[documentType] ? documentFiles[documentType].name : 'No file chosen'}
        </label>
        <button
          type="button"
          onClick={() => uploadToS3(documentType)}
          disabled={!documentFiles[documentType] || uploadingStates[documentType]}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadingStates[documentType] ? 'Uploading...' : 'Upload to S3'}
        </button>
        {uploadedDocuments[documentType] && (
          <span className="text-green-600 text-sm">✓ Uploaded</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">Employee Registarion</h1>
            <p className="text-indigo-100 text-center mt-2">Please fill in your details accurately</p>
          </div>
          
          {/* Status Messages */}
          {submitStatus && (
            <div className={`mx-8 mt-6 p-4 rounded-lg ${
              submitStatus.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {submitStatus.message}
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.role ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
                  {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch *
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.branch ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  {errors.branch && <p className="text-red-500 text-sm mt-1">{errors.branch}</p>}
                </div>
                
                   <div>
                <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700">
                  Work Location*
                </label>
                <select
                  id="workLocation"
                  name="workLocation"
                  required
                  value={formData.workLocation}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Working">Working</option>
                    <option value="On Leave">Veccation</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                
             <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                  Nationality
                </label>
                <select
                  id="nationality"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary (QAR)
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter salary amount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="Enter password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                
                <FileUploadSection documentType="profilePicture" label="Profile Picture" accept="image/*" />
              </div>
            </div>

            {/* ID & Documents */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                ID & Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QID Number
                  </label>
                  <input
                    type="text"
                    name="qid"
                    value={formData.qid}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter QID number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QID Expiry Date
                  </label>
                  <input
                    type="date"
                    name="qidExpiry"
                    value={formData.qidExpiry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <FileUploadSection documentType="qidCopy" label="Upload QID Copy" />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter passport number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport Expiry Date
                  </label>
                  <input
                    type="date"
                    name="passportExpiry"
                    value={formData.passportExpiry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <FileUploadSection documentType="passportCopy" label="Upload Passport Copy" />
                
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visa Number
                  </label>
                  <input
                    type="text"
                    name="visaNumber"
                    value={formData.visaNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter visa number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visa Expiry
                  </label>
                  <input
                    type="date"
                    name="visaExpiry"
                    value={formData.visaExpiry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visa Added Branch
                  </label>
                  <select
                    name="visaAddedBranch"
                    value={formData.visaAddedBranch}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div> */}
                
                {/* <FileUploadSection documentType="visa" label="Upload Visa" /> */}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Card Number
                  </label>
                  <input
                    type="text"
                    name="medicalCardNumber"
                    value={formData.medicalCardNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter medical card number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Card Expiry
                  </label>
                  <input
                    type="date"
                    name="medicalCardExpiry"
                    value={formData.medicalCardExpiry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <FileUploadSection documentType="medicalCard" label="Upload Medical Card" />
              </div>
            </div>

            {/* Important Dates */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Important Dates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    name="doj"
                    value={formData.doj}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Exit
                  </label>
                  <input
                    type="date"
                    name="doe"
                    value={formData.doe}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div> */}
              </div>
            </div>

            {/* Contact & Banking */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Contact & Banking
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter bank name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter account number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter emergency contact"
                  />
                </div>
                
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact 2
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact2"
                    value={formData.emergencyContact2}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter second emergency contact"
                  />
                </div> */}
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Native Address
                  </label>
                  <textarea
                    name="nativeAddress"
                    value={formData.nativeAddress}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your native address"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Submitting...
                  </div>
                ) : (
                  'Add Employee'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}