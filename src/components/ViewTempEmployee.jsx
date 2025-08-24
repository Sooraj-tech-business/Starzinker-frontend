export default function ViewTempEmployee({ tempEmployee, onClose }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-h-[95vh] overflow-y-auto w-full">
      <div className="bg-orange-600 px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mr-4">
              {tempEmployee.documents?.profilePicture?.url ? (
                <img 
                  src={tempEmployee.documents.profilePicture.url} 
                  alt={tempEmployee.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-2xl font-bold text-orange-800">
                  {tempEmployee.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{tempEmployee.name}</h2>
              <p className="text-orange-100">{tempEmployee.role}</p>
              <div className="flex items-center mt-1">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500 text-white">
                  Temporary Employee
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-orange-200 transition-colors"
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
              <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Email</span>
                <span className="text-gray-900">{tempEmployee.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Phone</span>
                <span className="text-gray-900">{tempEmployee.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">QID</span>
                <span className="text-gray-900 font-mono">{tempEmployee.qid || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Passport</span>
                <span className="text-gray-900 font-mono">{tempEmployee.passportNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-600">Nationality</span>
                <span className="text-gray-900">{tempEmployee.nationality || 'N/A'}</span>
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
                <span className="text-gray-900">{tempEmployee.workLocation || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Join Date</span>
                <span className="text-gray-900">{formatDate(tempEmployee.doj)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Salary</span>
                <span className="text-gray-900 font-semibold">{tempEmployee.salary ? `QAR ${tempEmployee.salary}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-600">Status</span>
                <span className="text-gray-900">{tempEmployee.status || 'Working'}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Profile Picture */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Profile Picture</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Photo</span>
              </div>
              {tempEmployee.documents?.profilePicture ? (
                <div>
                  <a 
                    href={tempEmployee.documents.profilePicture.url} 
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
                  <div className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(tempEmployee.documents.profilePicture.uploadedAt)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Not uploaded</div>
              )}
            </div>

            {/* QID Document */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">QID Copy</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">ID</span>
              </div>
              {tempEmployee.documents?.qidCopy ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Expires: {formatDate(tempEmployee.qidExpiry)}</div>
                  <a 
                    href={tempEmployee.documents.qidCopy.url} 
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
                  <div className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(tempEmployee.documents.qidCopy.uploadedAt)}</div>
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
              {tempEmployee.documents?.passportCopy ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Expires: {formatDate(tempEmployee.passportExpiry)}</div>
                  <a 
                    href={tempEmployee.documents.passportCopy.url} 
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
                  <div className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(tempEmployee.documents.passportCopy.uploadedAt)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Not uploaded</div>
              )}
            </div>

            {/* Medical Card Document */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Medical Card</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Health</span>
              </div>
              {tempEmployee.documents?.medicalCard ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Expires: {formatDate(tempEmployee.medicalCardExpiry)}</div>
                  <a 
                    href={tempEmployee.documents.medicalCard.url} 
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
                  <div className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(tempEmployee.documents.medicalCard.uploadedAt)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Not uploaded</div>
              )}
            </div>

            {/* Work Agreement Document */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Work Agreement</span>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Contract</span>
              </div>
              {tempEmployee.documents?.workAgreement ? (
                <div>
                  <a 
                    href={tempEmployee.documents.workAgreement.url} 
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
                  <div className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(tempEmployee.documents.workAgreement.uploadedAt)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Not uploaded</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}