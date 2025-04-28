import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password, loginType) => {
  const response = await api.post('/token', new URLSearchParams({
    grant_type: loginType,
    username,
    password,
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};


export const getHospitals = async () => {
  try {
    const response = await api.get('/hospitals/');
    return response.data;
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    throw error;
  }
};

export const createHospital = async (hospitalData) => {
  try {
    const response = await api.post('/hospitals/', hospitalData);
    return response.data;
  } catch (error) {
    console.error('Error creating hospital:', error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get('/users/');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getHospitalPatients = async () => {
  try {
    const response = await api.get('/hospitals/patients/');
    return response.data;
  } catch (error) {
    console.error('Error fetching hospital patients:', error);
    throw error;
  }
};

export const createPatient = async (patientData) => {
  try {
    const response = await api.post('/hospitals/patients/', patientData);
    return response.data;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};

export const updatePatient = async (patientId, patientData) => {
  try {
    const response = await api.patch(`/hospitals/patients/${patientId}`, patientData);
    return response.data;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

export const getPatientDetails = async () => {
  try {
    const response = await api.get('/patients/me/');
    return response.data;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
};

export const getPatientTestResults = async () => {
  try {
    const response = await api.get('/patients/test_results/');
    return response.data;
  } catch (error) {
    console.error('Error fetching test results:', error);
    throw error;
  }
};