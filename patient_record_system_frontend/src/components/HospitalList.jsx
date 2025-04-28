import React from 'react';

const HospitalList = ({ hospitals }) => {
  return (
    <div>
      <h2>Hospitals</h2>
      {hospitals.length === 0 ? (
        <p>No hospitals found.</p>
      ) : (
        <ul>
          {hospitals.map((hospital) => (
            <li key={hospital.hospital_id}>
              <strong>{hospital.name}</strong> (License: {hospital.license_number})
              <br />
              Email: {hospital.contact_email || 'N/A'}, Phone: {hospital.contact_phone || 'N/A'}
              <br />
              Address: {JSON.stringify(hospital.address)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HospitalList;