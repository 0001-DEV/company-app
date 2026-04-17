import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    // Check if this is the first app load (sessionStorage flag)
    const isFirstLoad = !sessionStorage.getItem('app_initialized');
    
    if (isFirstLoad) {
      // First app load: Clear localStorage and show login page
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.setItem('app_initialized', 'true');
      console.log('🔄 First app load: Cleared cached authentication, showing login');
      setLoading(false);
      return;
    }

    // Not first load: Restore session from localStorage (page refresh)
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        // Validate token is not expired or corrupted
        const userData = JSON.parse(storedUser);
        if (userData && userData.email) {
          setToken(storedToken);
          setUser(userData);
          console.log('✅ Session restored from localStorage');
        } else {
          // Invalid user data, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials, loginType = 'admin') => {
    try {
      // Use local backend for development, Vercel API for production
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const endpoint = isLocalhost 
        ? (loginType === 'admin' ? 'http://localhost:5000/api/admin/login' : 'http://localhost:5000/api/staff/login')
        : (loginType === 'admin' ? '/api/admin/login' : '/api/staff/login');

      console.log('🔄 Attempting login to:', endpoint);
      console.log('📝 Login type:', loginType);
      console.log('📝 Credentials:', { email: credentials.email, password: '***' });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', response.headers);

      const text = await response.text();
      console.log('📝 Response text:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      const userToken = data.token;
      const userData = data.user || data.admin || data.staff;

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Logout API call is optional - just clear local session
      if (token) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (error) {
          // API call failed, but that's okay - we'll still logout locally
          console.log('Logout API not available, clearing local session');
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Always clear local state regardless of API response
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!(token && user);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check specific permissions based on role
    const permissions = {
      staff: ['staff_access', 'chat_access', 'workbank_access'],
      admin: ['admin_access', 'staff_management', 'system_config', 'chat_access', 'workbank_access']
    };
    
    return permissions[user.role]?.includes(permission) || false;
  };

  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    hasPermission,
    getAuthHeader,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
