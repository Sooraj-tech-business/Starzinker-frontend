import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegistrationSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/employee-register');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Success Icon */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 text-center">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Registration Successful!</h1>
        </div>
        
        {/* Content */}
        <div className="p-8 text-center">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">
              Your employee registration has been submitted successfully. 
              The admin will review your information and contact you soon.
            </p>
          </div>
          
          {/* Success Details */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">Data Recorded</span>
            </div>
            <p className="text-green-700 text-sm">
              Your information has been safely stored in our system.
            </p>
          </div>
          
          {/* Next Steps */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">1.</span>
                Admin will review your registration
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">2.</span>
                You'll receive confirmation via email/phone
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">3.</span>
                Further instructions will be provided
              </li>
            </ul>
          </div>
          
          {/* Auto redirect notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-blue-700 text-sm">
              You will be redirected to the registration form in 5 seconds...
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/employee-register')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Register Another Employee
            </button>
            
            <p className="text-xs text-gray-500">
              Need help? Contact the admin for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}