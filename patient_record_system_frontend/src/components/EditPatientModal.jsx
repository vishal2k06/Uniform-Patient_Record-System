import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Hospitals.css';

const EditPatientModal = ({
  isOpen,
  onClose,
  editPatient,
  setEditPatient,
  editPatientError,
  editPatientSuccess,
  handleEditPatient,
  isValidJSON,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit Patient Details</h5>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleEditPatient}>
          <div className="form-group">
            <label htmlFor="editGender" className="form-label">Gender</label>
            <input
              id="editGender"
              type="text"
              className="form-input"
              value={editPatient.gender}
              onChange={(e) => setEditPatient({ ...editPatient, gender: e.target.value })}
              placeholder="e.g., Male"
            />
          </div>
          <div className="form-group">
            <label htmlFor="editContactPhone" className="form-label">Contact Phone</label>
            <input
              id="editContactPhone"
              type="text"
              className="form-input"
              value={editPatient.contact_phone}
              onChange={(e) => setEditPatient({ ...editPatient, contact_phone: e.target.value })}
              placeholder="e.g., 555-123-4567"
            />
          </div>
          <div className="form-group">
            <label htmlFor="editEmergencyContact" className="form-label">Emergency Contact (JSON)</label>
            <input
              id="editEmergencyContact"
              type="text"
              className="form-input"
              value={editPatient.emergency_contact}
              onChange={(e) => setEditPatient({ ...editPatient, emergency_contact: e.target.value })}
              placeholder='e.g., {"name": "John Doe", "phone": "555-987-6543"}'
            />
          </div>
          {editPatientError && <div className="alert alert-danger">{editPatientError}</div>}
          {editPatientSuccess && <div className="alert alert-success">{editPatientSuccess}</div>}
          <button type="submit" className="btn btn-primary">Update Patient</button>
        </form>
      </div>
    </div>
  );
};

EditPatientModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editPatient: PropTypes.shape({
    gender: PropTypes.string,
    contact_phone: PropTypes.string,
    emergency_contact: PropTypes.string,
  }).isRequired,
  setEditPatient: PropTypes.func.isRequired,
  editPatientError: PropTypes.string,
  editPatientSuccess: PropTypes.string,
  handleEditPatient: PropTypes.func.isRequired,
  isValidJSON: PropTypes.func.isRequired,
};

export default EditPatientModal;