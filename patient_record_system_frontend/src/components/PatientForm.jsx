import React, { useState } from 'react';

const PatientForm = ({ onPatientCreated, onUpdatePatient, patient }) => {
  const isEdit = !!patient;
  const [formData, setFormData] = useState(
    isEdit
      ? {
          dob: patient.dob,
          gender: patient.gender || '',
          contact_phone: patient.contact_phone || '',
          emergency_contact: patient.emergency_contact || { name: '', phone: '', relation: '' },
        }
      : {
          user_id: '',
          unique_id: '',
          dob: '',
          gender: '',
          contact_phone: '',
          emergency_contact: { name: '', phone: '', relation: '' },
          created_by_hospital_id: '',
        }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('emergency_contact.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        emergency_contact: { ...formData.emergency_contact, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await onUpdatePatient(patient.patient_id, formData);
      } else {
        await onPatientCreated(formData);
      }
      if (!isEdit) {
        setFormData({
          user_id: '',
          unique_id: '',
          dob: '',
          gender: '',
          contact_phone: '',
          emergency_contact: { name: '', phone: '', relation: '' },
          created_by_hospital_id: '',
        });
      }
    } catch (error) {
      alert(isEdit ? 'Error updating patient' : 'Error creating patient');
    }
  };

  return (
    <div>
      <h2>{isEdit ? 'Edit Patient' : 'Add Patient'}</h2>
      <form onSubmit={handleSubmit}>
        {!isEdit && (
          <>
            <div>
              <label>User ID:</label>
              <input
                type="text"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Unique ID:</label>
              <input
                type="text"
                name="unique_id"
                value={formData.unique_id}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Hospital ID:</label>
              <input
                type="text"
                name="created_by_hospital_id"
                value={formData.created_by_hospital_id}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}
        <div>
          <label>DOB:</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required={!isEdit}
          />
        </div>
        <div>
          <label>Gender:</label>
          <input
            type="text"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Contact Phone:</label>
          <input
            type="text"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Emergency Contact Name:</label>
          <input
            type="text"
            name="emergency_contact.name"
            value={formData.emergency_contact.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Emergency Contact Phone:</label>
          <input
            type="text"
            name="emergency_contact.phone"
            value={formData.emergency_contact.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Emergency Contact Relation:</label>
          <input
            type="text"
            name="emergency_contact.relation"
            value={formData.emergency_contact.relation}
            onChange={handleChange}
          />
        </div>
        <button type="submit">{isEdit ? 'Update Patient' : 'Create Patient'}</button>
      </form>
    </div>
  );
};

export default PatientForm;