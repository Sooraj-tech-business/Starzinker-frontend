export default function ViewBranch({ branch, users, onClose }) {
  if (!branch) return null;

  // Get employees assigned to this branch
  const branchEmployees = users?.filter(user => user.workLocation === branch.name) || [];

  return (
    <div className="bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6 rounded-t-xl">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
              {branch.branchDocuments?.logoDocument?.url ? (
                <img 
                  src={branch.branchDocuments.logoDocument.url} 
                  alt={`${branch.name} logo`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {branch.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{branch.name}</h2>
              <p className="text-indigo-100">{branch.location}</p>
              <div className="flex items-center mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  branchEmployees.length > 0 ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {branchEmployees.length > 0 ? 'Active' : 'Inactive'}
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
          {/* Branch Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Branch Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Location</span>
                <span className="text-gray-900">{branch.location || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Manager</span>
                <span className="text-gray-900">{branch.manager || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Contact</span>
                <span className="text-gray-900">{branch.contactNumber || branch.contact || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Email</span>
                <span className="text-gray-900">{branch.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-600">Address</span>
                <span className="text-gray-900">{branch.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Resources
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Employees</span>
                <span className="text-gray-900 font-semibold">{branchEmployees.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Vehicles</span>
                <span className="text-gray-900 font-semibold">{branch.vehicles?.length || 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-600">Documents</span>
                <span className="text-gray-900 font-semibold">
                  {branch.branchDocuments ? Object.keys(branch.branchDocuments).filter(key => branch.branchDocuments[key]?.url).length : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Employees List */}
        {branchEmployees.length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Branch Employees ({branchEmployees.length})
            </h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Designation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {branchEmployees.map((employee, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-800">
                              {employee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.designation || employee.role || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {employee.salary ? `${employee.salary.toLocaleString()} QR` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.status === 'Working' ? 'bg-green-100 text-green-800' :
                          employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                          employee.status === 'Vacation' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-3 text-sm font-medium text-gray-700">Total Salary:</td>
                    <td className="px-6 py-3 text-sm font-bold text-green-600">
                      {branchEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0).toLocaleString()} QR
                    </td>
                    <td className="px-6 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Branch Documents */}
        {branch.branchDocuments && Object.keys(branch.branchDocuments).some(key => branch.branchDocuments[key]?.url) && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Branch Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branch.branchDocuments.crDocument?.url && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Company CR</div>
                      <div className="text-xs text-gray-500">{branch.branchDocuments.crDocument.fileName}</div>
                      <div className="text-xs text-gray-400">
                        Uploaded: {new Date(branch.branchDocuments.crDocument.uploadedAt).toLocaleDateString()}
                      </div>
                      {branch.crExpiry && (
                        <div className={`text-xs font-medium mt-1 ${
                          new Date(branch.crExpiry) < new Date() ? 'text-red-600' :
                          new Date(branch.crExpiry) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          Expires: {new Date(branch.crExpiry).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <a 
                      href={branch.branchDocuments.crDocument.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              )}
              {branch.branchDocuments.ruksaDocument?.url && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Ruksa License</div>
                      <div className="text-xs text-gray-500">{branch.branchDocuments.ruksaDocument.fileName}</div>
                      <div className="text-xs text-gray-400">
                        Uploaded: {new Date(branch.branchDocuments.ruksaDocument.uploadedAt).toLocaleDateString()}
                      </div>
                      {branch.ruksaExpiry && (
                        <div className={`text-xs font-medium mt-1 ${
                          new Date(branch.ruksaExpiry) < new Date() ? 'text-red-600' :
                          new Date(branch.ruksaExpiry) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          Expires: {new Date(branch.ruksaExpiry).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <a 
                      href={branch.branchDocuments.ruksaDocument.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              )}
              {branch.branchDocuments.computerCardDocument?.url && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Computer Card</div>
                      <div className="text-xs text-gray-500">{branch.branchDocuments.computerCardDocument.fileName}</div>
                      <div className="text-xs text-gray-400">
                        Uploaded: {new Date(branch.branchDocuments.computerCardDocument.uploadedAt).toLocaleDateString()}
                      </div>
                      {branch.computerCardExpiry && (
                        <div className={`text-xs font-medium mt-1 ${
                          new Date(branch.computerCardExpiry) < new Date() ? 'text-red-600' :
                          new Date(branch.computerCardExpiry) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          Expires: {new Date(branch.computerCardExpiry).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <a 
                      href={branch.branchDocuments.computerCardDocument.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              )}
              {branch.branchDocuments.certificationDocument?.url && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Certification</div>
                      <div className="text-xs text-gray-500">{branch.branchDocuments.certificationDocument.fileName}</div>
                      <div className="text-xs text-gray-400">
                        Uploaded: {new Date(branch.branchDocuments.certificationDocument.uploadedAt).toLocaleDateString()}
                      </div>
                      {branch.certificationExpiry && (
                        <div className={`text-xs font-medium mt-1 ${
                          new Date(branch.certificationExpiry) < new Date() ? 'text-red-600' :
                          new Date(branch.certificationExpiry) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          Expires: {new Date(branch.certificationExpiry).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <a 
                      href={branch.branchDocuments.certificationDocument.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              )}
              {branch.branchDocuments.taxCardDocument?.url && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Tax Card</div>
                      <div className="text-xs text-gray-500">{branch.branchDocuments.taxCardDocument.fileName}</div>
                      <div className="text-xs text-gray-400">
                        Uploaded: {new Date(branch.branchDocuments.taxCardDocument.uploadedAt).toLocaleDateString()}
                      </div>
                      {branch.taxCardExpiry && (
                        <div className={`text-xs font-medium mt-1 ${
                          new Date(branch.taxCardExpiry) < new Date() ? 'text-red-600' :
                          new Date(branch.taxCardExpiry) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          Expires: {new Date(branch.taxCardExpiry).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <a 
                      href={branch.branchDocuments.taxCardDocument.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              )}
              {branch.branchDocuments.logoDocument?.url && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Company Logo</div>
                      <div className="text-xs text-gray-500">{branch.branchDocuments.logoDocument.fileName}</div>
                      <div className="text-xs text-gray-400">
                        Uploaded: {new Date(branch.branchDocuments.logoDocument.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <a 
                      href={branch.branchDocuments.logoDocument.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              )}
              {branch.branchDocuments.letterheadDocument?.url && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Letterhead</div>
                      <div className="text-xs text-gray-500">{branch.branchDocuments.letterheadDocument.fileName}</div>
                      <div className="text-xs text-gray-400">
                        Uploaded: {new Date(branch.branchDocuments.letterheadDocument.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <a 
                      href={branch.branchDocuments.letterheadDocument.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              )}
              {branch.branchDocuments.baladiyaDocument?.url && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Baladiya Document</div>
                      <div className="text-xs text-gray-500">{branch.branchDocuments.baladiyaDocument.fileName}</div>
                      <div className="text-xs text-gray-400">
                        Uploaded: {new Date(branch.branchDocuments.baladiyaDocument.uploadedAt).toLocaleDateString()}
                      </div>
                      {branch.baladiyaExpiry && (
                        <div className={`text-xs font-medium mt-1 ${
                          new Date(branch.baladiyaExpiry) < new Date() ? 'text-red-600' :
                          new Date(branch.baladiyaExpiry) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          Expires: {new Date(branch.baladiyaExpiry).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <a 
                      href={branch.branchDocuments.baladiyaDocument.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bank Details */}
        {(branch.bankName || branch.bankAccountNumber || branch.ibanNumber) && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Bank Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {branch.bankName && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-900">Bank Name</div>
                  <div className="text-sm text-gray-600">{branch.bankName}</div>
                </div>
              )}
              {branch.bankAccountNumber && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-900">Account Number</div>
                  <div className="text-sm text-gray-600 font-mono">{branch.bankAccountNumber}</div>
                </div>
              )}
              {branch.ibanNumber && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-900">IBAN Number</div>
                  <div className="text-sm text-gray-600 font-mono">{branch.ibanNumber}</div>
                </div>
              )}
            </div>
            {(branch.baladiyaNumber || branch.baladiyaExpiry) && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-800 mb-2">Baladiya Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {branch.baladiyaNumber && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-sm font-medium text-gray-900">Baladiya Number</div>
                      <div className="text-sm text-gray-600">{branch.baladiyaNumber}</div>
                    </div>
                  )}
                  {branch.baladiyaExpiry && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-sm font-medium text-gray-900">Baladiya Expiry</div>
                      <div className={`text-sm font-medium ${
                        new Date(branch.baladiyaExpiry) < new Date() ? 'text-red-600' :
                        new Date(branch.baladiyaExpiry) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {new Date(branch.baladiyaExpiry).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vehicles List */}
        {branch.vehicles && branch.vehicles.length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Vehicles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branch.vehicles.map((vehicle, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-900">{vehicle.make} {vehicle.model}</div>
                  <div className="text-sm text-gray-500">License: {vehicle.licenseNumber}</div>
                  <div className="text-xs text-gray-400">Type: {vehicle.type}</div>
                </div>
              ))}
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