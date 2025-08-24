export default function Navbar({ onLogout }) {
  // Get current user to check role
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  };
  
  const currentUser = getCurrentUser();
  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'Manager';

  return (
    <nav className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 shadow-2xl border-b border-gray-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Company Name with Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-xl border border-white/20">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg sm:text-2xl tracking-tight drop-shadow-sm">STAR ZINKER</h1>
              <p className="text-blue-200 text-xs sm:text-sm font-medium opacity-90">Qatar</p>
            </div>
          </div>
          
          {/* User Info & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-6">
            {/* Status Indicator */}
            <div className="hidden lg:flex items-center space-x-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-full px-5 py-2.5 border border-green-400/20">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-green-100 text-sm font-semibold">System Online</span>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 border border-white/20 shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-semibold text-sm drop-shadow-sm">{currentUser?.name || 'User'}</p>
                <p className="text-gray-300 text-xs opacity-90">{isManager ? 'Manager' : 'Administrator'}</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm hover:from-red-500/30 hover:to-red-600/30 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-white font-semibold transition-all duration-300 shadow-lg border border-red-400/20 hover:border-red-300/40 flex items-center space-x-1 sm:space-x-2 hover:scale-105 transform"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}