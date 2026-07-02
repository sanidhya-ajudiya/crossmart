const API_BASE_URL = 'http://localhost:3000/api';

export interface ApiFetchOptions extends RequestInit {
  bodyData?: any;
}

export const apiFetch = async (endpoint: string, options: ApiFetchOptions = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  
  // Set default JSON headers if sending body
  if (options.bodyData) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.bodyData);
  }
  
  // Append authorization JWT token if present
  const token = localStorage.getItem('token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    
    // Handle unauthorized/session expired
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are not on login, redirect
      if (!window.location.pathname.includes('/login')) {
        window.location.href = window.location.pathname.includes('/delivery') 
          ? '/delivery/login' 
          : '/login';
      }
    }
    
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      const errorMsg = (data && typeof data === 'object' && data.message) || response.statusText || 'API error';
      throw new Error(errorMsg);
    }
    
    return data;
  } catch (error: any) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
};
