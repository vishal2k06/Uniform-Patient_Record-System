import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Patients = () => {
  const [patient, setPatient] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please log in again.');
          navigate('/login');
          return;
        }

        // Fetch patient details
        const patientResponse = await axios.get('http://localhost:8000/patients/me/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPatient(patientResponse.data);

        // Fetch test results
        const testResultsResponse = await axios.get('http://localhost:8000/patients/test_results/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTestResults(testResultsResponse.data);
      } catch (err) {
        console.error('Fetch patient data error:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to fetch patient data: ' + (err.response?.data?.detail || err.message));
        }
      }
    };

    fetchPatientData();
  }, [navigate]);

  if (!patient && !error) {
    return <div className="container mt-5">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Patient Dashboard</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {patient && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Patient Details</h5>
            <p><strong>Patient ID:</strong> {patient.unique_id}</p>
            <p><strong>Date of Birth:</strong> {patient.dob}</p>
            <p><strong>Gender:</strong> {patient.gender || '-'}</p>
            <p><strong>Contact Phone:</strong> {patient.contact_phone || '-'}</p>
            <p><strong>Emergency Contact:</strong> {patient.emergency_contact ? JSON.stringify(patient.emergency_contact) : '-'}</p>
            <p><strong>Hospital ID:</strong> {patient.created_by_hospital_id}</p>
          </div>
        </div>
      )}
      <h4>Test Results</h4>
      {testResults.length === 0 && !error && (
        <p className="text-muted">No test results found.</p>
      )}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Test Type ID</th>
            <th>Result</th>
            <th>Test Date</th>
            <th>Hospital ID</th>
          </tr>
        </thead>
        <tbody>
          {testResults.map((result) => (
            <tr key={result.test_result_id}>
              <td>{result.test_type_id}</td>
              <td>{result.result}</td>
              <td>{result.test_date}</td>
              <td>{result.created_by_hospital_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="btn btn-secondary mt-3"
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

export default Patients;