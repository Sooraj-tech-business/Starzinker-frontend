export default function ViewEmployee({ employee, onClose }) {
  if (!employee) return null;

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-full">
      {/* Header with Employee Info */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6 rounded-t-xl">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
              {employee.documents?.profilePicture?.url ? (
                <img 
                  src={employee.documents.profilePicture.url} 
                  alt={employee.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {employee.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
              <p className="text-indigo-100">{employee.designation || employee.role}</p>
              <div className="flex items-center mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  employee.status === 'Working' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {employee.status || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-indigo-200 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information Card */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Email</span>
                <span className="text-gray-900">{employee.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Phone</span>
                <span className="text-gray-900">{employee.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">QID</span>
                <span className="text-gray-900 font-mono">{employee.qid || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Passport</span>
                <span className="text-gray-900 font-mono">{employee.passportNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-600">Nationality</span>
                <span className="text-gray-900">{employee.nationality || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Job Information Card */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
              </svg>
              Job Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Work Location</span>
                <span className="text-gray-900">{employee.workLocation || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Visa Added Branch</span>
                <span className="text-gray-900">{employee.visaAddedBranch || employee.branch || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Join Date</span>
                <span className="text-gray-900">{formatDate(employee.doj)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Salary</span>
                <span className="text-gray-900 font-semibold">{employee.salary ? `QAR ${employee.salary}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-600">Emergency Contact</span>
                <span className="text-gray-900">{employee.emergencyContact || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Documents Section */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Uploaded Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* QID Document */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">QID Copy</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">ID</span>
              </div>
              {employee.documents?.qidCopy ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Expires: {formatDate(employee.qidExpiry)}</div>
                  <a 
                    href={employee.documents.qidCopy.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </a>
                  <div className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(employee.documents.qidCopy.uploadedAt)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Not uploaded</div>
              )}
            </div>

            {/* Passport Document */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Passport</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Travel</span>
              </div>
              {employee.documents?.passportCopy ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Expires: {formatDate(employee.passportExpiry)}</div>
                  <a 
                    href={employee.documents.passportCopy.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </a>
                  <div className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(employee.documents.passportCopy.uploadedAt)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Not uploaded</div>
              )}
            </div>

            {/* Visa Document */}
            {/* <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Visa</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Legal</span>
              </div>
              {employee.documents?.visa ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Expires: {formatDate(employee.visaExpiry)}</div>
                  <a 
                    href={employee.documents.visa.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </a>
                  <div className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(employee.documents.visa.uploadedAt)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Not uploaded</div>
              )}
            </div> */}
              {/* profilePicture */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700"> Profile picture</span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Profile</span>
              </div>
              {employee.documents?.profilePicture ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Expires: No Expiring</div>
                  <a 
                    href={employee.documents.profilePicture.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </a>
                  <div className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(employee.documents.profilePicture.uploadedAt)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Not uploaded</div>
              )}
            </div>

            {/* Medical Card Document */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Medical Card</span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Health</span>
              </div>
              {employee.documents?.medicalCard ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Expires: {formatDate(employee.medicalCardExpiry)}</div>
                  <a 
                    href={employee.documents.medicalCard.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </a>
                  <div className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(employee.documents.medicalCard.uploadedAt)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Not uploaded</div>
              )}
            </div>

            {/* Work Agreement Document */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Work Agreement</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Contract</span>
              </div>
              {employee.documents?.workAgreement ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2">No Expiry</div>
                  <a 
                    href={employee.documents.workAgreement.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </a>
                  <div className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(employee.documents.workAgreement.uploadedAt)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Not uploaded</div>
              )}
            </div>
          </div>
        </div>

        {/* Document Information */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Document Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">QID Number</span>
                <span className="text-gray-900 font-mono">{employee.qid || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">QID Expiry</span>
                <span className="text-gray-900">{formatDate(employee.qidExpiry)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Passport Number</span>
                <span className="text-gray-900 font-mono">{employee.passportNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-600">Passport Expiry</span>
                <span className="text-gray-900">{formatDate(employee.passportExpiry)}</span>
              </div>
            </div>
            <div className="space-y-3">
              {/* <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Visa Number</span>
                <span className="text-gray-900 font-mono">{employee.visaNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Visa Expiry</span>
                <span className="text-gray-900">{formatDate(employee.visaExpiry)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Visa Added Branch</span>
                <span className="text-gray-900">{employee.visaAddedBranch || 'N/A'}</span>
              </div> */}
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Medical Card Number</span>
                <span className="text-gray-900 font-mono">{employee.medicalCardNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-600">Medical Card Expiry</span>
                <span className="text-gray-900">{formatDate(employee.medicalCardExpiry)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(employee.bankName || employee.nativeAddress) && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {employee.bankName && (
                <div>
                  <span className="font-medium text-gray-600">Banking</span>
                  <div className="mt-1 text-gray-900">
                    <div>{employee.bankName}</div>
                    <div className="text-sm text-gray-500">{employee.bankAccountNumber || 'N/A'}</div>
                  </div>
                </div>
              )}
              {employee.nativeAddress && (
                <div>
                  <span className="font-medium text-gray-600">Native Address</span>
                  <div className="mt-1 text-gray-900">{employee.nativeAddress}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}