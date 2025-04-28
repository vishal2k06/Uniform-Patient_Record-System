import React, { useState } from 'react';
import PatientForm from './PatientForm';

const PatientList = ({ patients, onUpdatePatient }) => {
  const [editingPatient, setEditingPatient] = useState(null);

  return (
    <div>
      <h2>Patients</h2>
      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul>
          {patients.map((patient) => (
            <li key={patient.patient_id}>
              <strong>Patient ID: {patient.unique_id}</strong>
              <br />
              DOB: {patient.dob}
              <br />
              Gender: {patient.gender || 'N/A'}
              <br />
              Phone: {patient.contact_phone || 'N/A'}
              <br />
              Emergency Contact: {JSON.stringify(patient.emergency_contact) || 'N/A'}
              <br />
              Hospital ID: {patient.created_by_hospital_id}
              <br />
              <button onClick={() => setEditingPatient(patient)}>Edit</button>
              {editingPatient?.patient_id === patient.patient_id && (
                <PatientForm
                  patient={editingPatient}
                  onUpdatePatient={onUpdatePatient}
                  onPatientCreated={() => setEditingPatient(null)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientList; 