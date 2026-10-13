// ==========================================================================
// EcoCivic AI — API Client Service
// Integrates with Spring Boot backend (Deployed on Render / Localhost)
// ==========================================================================

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ecocivic.onrender.com/api';

// Allow runtime override if user changes endpoint in Developer Settings
export const getApiBaseUrl = () => {
  return localStorage.getItem('ecocivic_api_url') || DEFAULT_API_BASE;
};

export const setApiBaseUrl = (url) => {
  if (url) {
    localStorage.setItem('ecocivic_api_url', url);
  } else {
    localStorage.removeItem('ecocivic_api_url');
  }
};

// Helper to get auth headers
const getAuthHeaders = (isMultipart = false) => {
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  const userStr = localStorage.getItem('loggedInUser');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    } catch {
      // Ignore parse error
    }
  }
  return headers;
};

// Generic fetch wrapper with error handling
async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, options);

  if (response.status === 401) {
    // Token may have expired
    console.warn('Unauthorized response (401) from backend');
  }

  // Handle empty or json response
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = typeof data === 'object' && data?.error ? data.error : (typeof data === 'string' && data ? data : `Request failed with status ${response.status}`);
    throw new Error(errorMsg);
  }

  return data;
}

// ----------------------------------------------------------------------
// Auth Endpoints
// ----------------------------------------------------------------------

export async function loginUser(email, password) {
  return request('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password })
  });
}

export async function registerUser({ name, email, password }) {
  return request('/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
  });
}

// ----------------------------------------------------------------------
// Reports Endpoints
// ----------------------------------------------------------------------

export async function fetchAllReports() {
  return request('/reports', {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

export async function fetchMyReports() {
  return request(`/reports/my?_t=${Date.now()}`, {
    method: 'GET',
    cache: 'no-store',
    headers: getAuthHeaders()
  });
}

export async function fetchDashboardSummary() {
  return request('/reports/dashboard', {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

export async function fetchReportById(id) {
  return request(`/reports/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

export async function submitReport(formDataOrJson) {
  if (formDataOrJson instanceof FormData) {
    return request('/reports', {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formDataOrJson
    });
  }

  return request('/reports', {
    method: 'POST',
    headers: getAuthHeaders(false),
    body: JSON.stringify(formDataOrJson)
  });
}

export async function updateReportStatus(reportId, newStatus) {
  return request(`/reports/${reportId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(false),
    body: JSON.stringify({ status: newStatus })
  });
}

// ----------------------------------------------------------------------
// AI Endpoints (Google Gemini in Spring Boot)
// ----------------------------------------------------------------------

export async function chatWithAI(message) {
  return request('/ai/chat', {
    method: 'POST',
    headers: getAuthHeaders(false),
    body: JSON.stringify({ message })
  });
}

export async function generateCivicInsights(summaryData) {
  const payloadMessage = typeof summaryData === 'string' 
    ? summaryData 
    : JSON.stringify(summaryData, null, 2);

  return request('/ai/insights', {
    method: 'POST',
    headers: getAuthHeaders(false),
    body: JSON.stringify({ message: payloadMessage })
  });
}

// ----------------------------------------------------------------------
// Image URL Helper
// ----------------------------------------------------------------------

export function resolveImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Clean filename
  let filename = imagePath;
  if (filename.startsWith('uploads/')) {
    filename = filename.replace('uploads/', '');
  } else if (filename.startsWith('/uploads/')) {
    filename = filename.replace('/uploads/', '');
  }

  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/reports/uploads/${filename}`;
}

// ----------------------------------------------------------------------
// Backend Health Check
// ----------------------------------------------------------------------

export async function checkBackendHealth() {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
