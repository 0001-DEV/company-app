// src/auth.js
export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
};

export const hasRole = (role) => {
  const user = getUser();
  return user?.role === role;
};

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
