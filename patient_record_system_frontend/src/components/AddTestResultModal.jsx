import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Hospitals.css';

const AddTestResultModal = ({
  isOpen,
  onClose,
  testResult,
  setTestResult,
  testResultError,
  testResultSuccess,
  handleAddTestResult,
  isValidUUID,
  isValidDate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Add Test Result</h5>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleAddTestResult}>
          <div className="form-group">
            <label htmlFor="testTypeId" className="form-label">Test Type ID (UUID)</label>
            <input
              id="testTypeId"
              type="text"
              className="form-input"
              value={testResult.test_type_id}
              onChange={(e) => setTestResult({ ...testResult, test_type_id: e.target.value })}
              placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="result" className="form-label">Result</label>
            <input
              id="result"
              type="text"
              className="form-input"
              value={testResult.result}
              onChange={(e) => setTestResult({ ...testResult, result: e.target.value })}
              placeholder="e.g., Positive"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="testDate" className="form-label">Test Date (YYYY-MM-DD)</label>
            <input
              id="testDate"
              type="text"
              className="form-input"
              value={testResult.test_date}
              onChange={(e) => setTestResult({ ...testResult, test_date: e.target.value })}
              placeholder="e.g., 2025-04-27"
              required
            />
          </div>
          {testResultError && <div className="alert alert-danger">{testResultError}</div>}
          {testResultSuccess && <div className="alert alert-success">{testResultSuccess}</div>}
          <button type="submit" className="btn btn-primary">Add Test Result</button>
        </form>
      </div>
    </div>
  );
};

AddTestResultModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  testResult: PropTypes.shape({
    test_type_id: PropTypes.string,
    result: PropTypes.string,
    test_date: PropTypes.string,
  }).isRequired,
  setTestResult: PropTypes.func.isRequired,
  testResultError: PropTypes.string,
  testResultSuccess: PropTypes.string,
  handleAddTestResult: PropTypes.func.isRequired,
  isValidUUID: PropTypes.func.isRequired,
  isValidDate: PropTypes.func.isRequired,
};

export default AddTestResultModal;