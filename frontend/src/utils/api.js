/**
 * API utility for making requests to the backend
 * Handles environment-specific API URLs
 */

const getApiUrl = () => {
  // In development, use the proxy configured in package.json
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  
  // In production, use the environment variable or default to relative paths
  return process.env.REACT_APP_API_URL || '';
};

export const apiCall = async (endpoint, options = {}) => {
  const url = `${getApiUrl()}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    return response;
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
};

export default apiCall;
