import React, { useState } from 'react';

const HospitalForm = ({ onHospitalCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    license_number: '',
    address: { street: '', city: '', state: '', zip: '' },
    contact_email: '',
    contact_phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onHospitalCreated(formData);
      setFormData({
        name: '',
        license_number: '',
        address: { street: '', city: '', state: '', zip: '' },
        contact_email: '',
        contact_phone: '',
      });
    } catch (error) {
      alert('Error creating hospital');
    }
  };

  return (
    <div>
      <h2>Add Hospital</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>License Number:</label>
          <input
            type="text"
            name="license_number"
            value={formData.license_number}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Street:</label>
          <input
            type="text"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>City:</label>
          <input
            type="text"
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>State:</label>
          <input
            type="text"
            name="address.state"
            value={formData.address.state}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Zip:</label>
          <input
            type="text"
            name="address.zip"
            value={formData.address.zip}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Phone:</label>
          <input
            type="text"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Create Hospital</button>
      </form>
    </div>
  );
};

export default HospitalForm;