import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddTestResultModal from '../components/AddTestResultModal';
import EditPatientModal from '../components/EditPatientModal';
import '../styles/Hospitals.css';

const Hospitals = () => {
  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);
  const [newPatient, setNewPatient] = useState({
    user_id: '',
    unique_id: '',
    dob: '',
    gender: '',
    contact_phone: '',
    emergency_contact: '',
    created_by_hospital_id: '',
  });
  const [addPatientError, setAddPatientError] = useState(null);
  const [addPatientSuccess, setAddPatientSuccess] = useState(null);
  const [testResult, setTestResult] = useState({
    test_type_id: '',
    result: '',
    test_date: '',
  });
  const [testResultError, setTestResultError] = useState(null);
  const [testResultSuccess, setTestResultSuccess] = useState(null);
  const [editPatient, setEditPatient] = useState({
    gender: '',
    contact_phone: '',
    emergency_contact: '',
  });
  const [editPatientError, setEditPatientError] = useState(null);
  const [editPatientSuccess, setEditPatientSuccess] = useState(null);
  const [isTestResultModalOpen, setIsTestResultModalOpen] = useState(false);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const navigate = useNavigate();

  // UUID validation regex
  const isValidUUID = (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Date validation (YYYY-MM-DD)
  const isValidDate = (str) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(str)) return false;
    const date = new Date(str);
    return date instanceof Date && !isNaN(date);
  };

  // JSON validation
  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const handlePatientLookup = async (e) => {
    e.preventDefault();
    setError(null);
    setPatient(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        navigate('/login');
        return;
      }
      const response = await axios.get(`http://localhost:8000/hospitals/patients/?unique_id=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.length === 0) {
        setError('Patient not found.');
      } else {
        setPatient(response.data[0]);
        setEditPatient({
          gender: response.data[0].gender || '',
          contact_phone: response.data[0].contact_phone || '',
          emergency_contact: response.data[0].emergency_contact ? JSON.stringify(response.data[0].emergency_contact) : '',
        });
      }
    } catch (err) {
      console.error('Fetch patient error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to fetch patient: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setAddPatientError(null);
    setAddPatientSuccess(null);
    if (!isValidUUID(newPatient.user_id)) {
      setAddPatientError('Invalid User ID format (must be UUID).');
      return;
    }
    if (!isValidUUID(newPatient.created_by_hospital_id)) {
      setAddPatientError('Invalid Hospital ID format (must be UUID).');
      return;
    }
    if (!isValidDate(newPatient.dob)) {
      setAddPatientError('Invalid Date of Birth format (use YYYY-MM-DD).');
      return;
    }
    if (newPatient.emergency_contact && !isValidJSON(newPatient.emergency_contact)) {
      setAddPatientError('Invalid Emergency Contact format (must be valid JSON).');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAddPatientError('No token found. Please log in again.');
        navigate('/login');
        return;
      }
      const response = await axios.post(
        'http://localhost:8000/hospitals/patients/',
        {
          ...newPatient,
          emergency_contact: newPatient.emergency_contact ? JSON.parse(newPatient.emergency_contact) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddPatientSuccess('Patient added successfully!');
      setNewPatient({
        user_id: '',
        unique_id: '',
        dob: '',
        gender: '',
        contact_phone: '',
        emergency_contact: '',
        created_by_hospital_id: '',
      });
    } catch (err) {
      console.error('Add patient error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setAddPatientError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setAddPatientError('Failed to add patient: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleAddTestResult = async (e) => {
    e.preventDefault();
    console.log('handleAddTestResult called', testResult, patient);
    setTestResultError(null);
    setTestResultSuccess(null);
    if (!patient) {
      setTestResultError('No patient selected.');
      return;
    }
    if (!isValidUUID(testResult.test_type_id)) {
      setTestResultError('Invalid Test Type ID format (must be UUID).');
      return;
    }
    if (!testResult.result.trim()) {
      setTestResultError('Result cannot be empty.');
      return;
    }
    if (!isValidDate(testResult.test_date)) {
      setTestResultError('Invalid Test Date format (use YYYY-MM-DD).');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTestResultError('No token found. Please log in again.');
        navigate('/login');
        return;
      }
      await axios.post(
        `http://localhost:8000/hospitals/patients/${patient.patient_id}/test_results/`,
        testResult,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestResultSuccess('Test result added successfully!');
      setTestResult({ test_type_id: '', result: '', test_date: '' });
      setIsTestResultModalOpen(false);
    } catch (err) {
      console.error('Add test result error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setTestResultError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setTestResultError('Failed to add test result: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    console.log('handleEditPatient called', editPatient, patient);
    setEditPatientError(null);
    setEditPatientSuccess(null);
    if (!patient) {
      setEditPatientError('No patient selected.');
      return;
    }
    if (editPatient.emergency_contact && !isValidJSON(editPatient.emergency_contact)) {
      setEditPatientError('Invalid Emergency Contact format (must be valid JSON).');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setEditPatientError('No token found. Please log in again.');
        navigate('/login');
        return;
      }
      const updateData = {
        gender: editPatient.gender || null,
        contact_phone: editPatient.contact_phone || null,
        emergency_contact: editPatient.emergency_contact ? JSON.parse(editPatient.emergency_contact) : null,
      };
      const response = await axios.patch(
        `http://localhost:8000/hospitals/patients/${patient.patient_id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditPatientSuccess('Patient details updated successfully!');
      setPatient({ ...patient, ...response.data });
      setIsEditPatientModalOpen(false);
    } catch (err) {
      console.error('Edit patient error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setEditPatientError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setEditPatientError('Failed to update patient: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  return (
    <div className="container">
      <h2 className="title">Hospital Dashboard</h2>

      {/* Patient Lookup Form */}
      <div className="card">
        <div className="card-title">Find Patient</div>
        <form onSubmit={handlePatientLookup}>
          <div className="form-group">
            <label htmlFor="patientId" className="form-label">Patient ID</label>
            <input
              id="patientId"
              type="text"
              className="form-input"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="e.g., 2025-HOSP001-000001"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {/* Patient Details */}
      {error && <div className="alert alert-danger">{error}</div>}
      {patient && (
        <div className="card">
          <div className="card-title">Patient Details</div>
          <p><strong>Patient ID:</strong> {patient.unique_id}</p>
          <p><strong>Date of Birth:</strong> {patient.dob}</p>
          <p><strong>Gender:</strong> {patient.gender || '-'}</p>
          <p><strong>Contact Phone:</strong> {patient.contact_phone || '-'}</p>
          <p><strong>Emergency Contact:</strong> {patient.emergency_contact ? JSON.stringify(patient.emergency_contact) : '-'}</p>
          <p><strong>Hospital ID:</strong> {patient.created_by_hospital_id}</p>
          <button
            className="btn btn-primary"
            onClick={() => setIsTestResultModalOpen(true)}
            disabled={!patient}
            style={{ marginRight: '10px' }}
          >
            Add Test Result
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsEditPatientModalOpen(true)}
            disabled={!patient}
          >
            Edit Details
          </button>
        </div>
      )}

      {/* Add Patient Form */}
      <div className="card">
        <div className="card-title">Add New Patient</div>
        <form onSubmit={handleAddPatient}>
          <div className="form-group">
            <label htmlFor="userId" className="form-label">User ID (UUID)</label>
            <input
              id="userId"
              type="text"
              className="form-input"
              value={newPatient.user_id}
              onChange={(e) => setNewPatient({ ...newPatient, user_id: e.target.value })}
              placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="uniqueId" className="form-label">Patient ID</label>
            <input
              id="uniqueId"
              type="text"
              className="form-input"
              value={newPatient.unique_id}
              onChange={(e) => setNewPatient({ ...newPatient, unique_id: e.target.value })}
              placeholder="e.g., 2025-HOSP001-000002"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dob" className="form-label">Date of Birth (YYYY-MM-DD)</label>
            <input
              id="dob"
              type="text"
              className="form-input"
              value={newPatient.dob}
              onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
              placeholder="e.g., 1990-01-01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender" className="form-label">Gender</label>
            <input
              id="gender"
              type="text"
              className="form-input"
              value={newPatient.gender}
              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
              placeholder="e.g., Male"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactPhone" className="form-label">Contact Phone</label>
            <input
              id="contactPhone"
              type="text"
              className="form-input"
              value={newPatient.contact_phone}
              onChange={(e) => setNewPatient({ ...newPatient, contact_phone: e.target.value })}
              placeholder="e.g., 555-123-4567"
            />
          </div>
          <div className="form-group">
            <label htmlFor="emergencyContact" className="form-label">Emergency Contact (JSON)</label>
            <input
              id="emergencyContact"
              type="text"
              className="form-input"
              value={newPatient.emergency_contact}
              onChange={(e) => setNewPatient({ ...newPatient, emergency_contact: e.target.value })}
              placeholder='e.g., {"name": "John Doe", "phone": "555-987-6543"}'
            />
          </div>
          <div className="form-group">
            <label htmlFor="hospitalId" className="form-label">Hospital ID (UUID)</label>
            <input
              id="hospitalId"
              type="text"
              className="form-input"
              value={newPatient.created_by_hospital_id}
              onChange={(e) => setNewPatient({ ...newPatient, created_by_hospital_id: e.target.value })}
              placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
              required
            />
          </div>
          {addPatientError && <div className="alert alert-danger">{addPatientError}</div>}
          {addPatientSuccess && <div className="alert alert-success">{addPatientSuccess}</div>}
          <button type="submit" className="btn btn-primary">Add Patient</button>
        </form>
      </div>

      {/* Modals */}
      <AddTestResultModal
        isOpen={isTestResultModalOpen}
        onClose={() => setIsTestResultModalOpen(false)}
        testResult={testResult}
        setTestResult={setTestResult}
        testResultError={testResultError}
        testResultSuccess={testResultSuccess}
        handleAddTestResult={handleAddTestResult}
        isValidUUID={isValidUUID}
        isValidDate={isValidDate}
      />
      <EditPatientModal
        isOpen={isEditPatientModalOpen}
        onClose={() => setIsEditPatientModalOpen(false)}
        editPatient={editPatient}
        setEditPatient={setEditPatient}
        editPatientError={editPatientError}
        editPatientSuccess={editPatientSuccess}
        handleEditPatient={handleEditPatient}
        isValidJSON={isValidJSON}
      />

      <button
        className="btn btn-secondary"
        onClick={() => {
          localStorage.removeItem('token');
          navigate('/login');
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Hospitals;