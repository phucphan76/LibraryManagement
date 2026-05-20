const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const registerUser = (userData) => fetch(`${API_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
}).then(async res => {
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
});

export const loginUser = (credentials) => fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials)
}).then(async res => {
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
});

export const fetchBooks = () => fetch(`${API_URL}/books`, { headers: getHeaders() }).then(res => res.json());
export const fetchBookDetail = (id) => fetch(`${API_URL}/books/${id}`, { headers: getHeaders() }).then(res => res.json());
export const fetchCategories = () => fetch(`${API_URL}/categories`, { headers: getHeaders() }).then(res => res.json());
export const fetchDashboard = () => fetch(`${API_URL}/dashboard`, { headers: getHeaders() }).then(res => res.json());

export const checkoutBooks = (userId, bookIds) => fetch(`${API_URL}/loans/checkout`, {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify({ userId, bookIds })
}).then(async res => {
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
});

export const searchCheckin = (q) => fetch(`${API_URL}/loans/checkin-search?q=${q}`, { headers: getHeaders() }).then(async res => {
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
});

export const returnBook = (detailId) => fetch(`${API_URL}/loans/return`, {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify({ detailId })
}).then(async res => {
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
});

export const fetchMyBookshelf = (userId) => fetch(`${API_URL}/users/${userId}/loans`, { headers: getHeaders() }).then(res => res.json());

export const fetchReaders = () => fetch(`${API_URL}/readers`, { headers: getHeaders() }).then(res => res.json());
export const updateReaderStatus = (id, status) => fetch(`${API_URL}/readers/${id}/status`, {
  method: 'PUT',
  headers: getHeaders(),
  body: JSON.stringify({ status })
}).then(async res => {
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
});
export const fetchFines = () => fetch(`${API_URL}/fines`, { headers: getHeaders() }).then(res => res.json());
export const payFine = (id) => fetch(`${API_URL}/fines/${id}/pay`, {
  method: 'PUT',
  headers: getHeaders()
}).then(async res => {
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
});
export const fetchLoans = () => fetch(`${API_URL}/loans`, { headers: getHeaders() }).then(res => res.json());
