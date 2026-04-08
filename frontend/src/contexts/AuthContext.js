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
    // DEVELOPMENT MODE: Set to true to always start with fresh login
    const DEVELOPMENT_MODE = true; // Change to false to enable auto-login
    
    if (DEVELOPMENT_MODE) {
      // Clear localStorage on app startup for fresh login each time
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('🔄 Development mode: Cleared cached authentication');
      setLoading(false);
      return;
    }

    // Production mode: Load cached authentication
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        // Validate token is not expired or corrupted
        const userData = JSON.parse(storedUser);
        if (userData && userData.email) {
          setToken(storedToken);
          setUser(userData);
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
      const endpoint = loginType === 'admin' ? '/api/admin/login' : '/api/staff/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

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
      console.error('Login error:', error);
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
