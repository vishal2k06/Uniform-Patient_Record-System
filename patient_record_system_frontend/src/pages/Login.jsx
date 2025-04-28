import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [loginType, setLoginType] = useState('hospital');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const grantType = loginType;
      const response = await axios.post(
        'http://localhost:8000/token',
        new URLSearchParams({
          grant_type: grantType,
          username,
          password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      console.log('Sending:', { grant_type: grantType, username, password });
      localStorage.setItem('token', response.data.access_token);

      if (loginType === 'hospital') {
        navigate('/hospitals');
      } else if (loginType === 'user') {
        navigate('/users');
      } else if (loginType === 'patient') {
        navigate('/patients');
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please check your credentials.';
      if (err.response?.data) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map((e) => e.msg).join('; ');
        } else {
          errorMessage = 'An unexpected error occurred.';
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Patient Record System Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="loginType" className="form-label">
                    Login Type
                  </label>
                  <select
                    id="loginType"
                    className="form-select"
                    value={loginType}
                    onChange={(e) => setLoginType(e.target.value)}
                  >
                    <option value="hospital">Hospital</option>
                    <option value="patient">Patient</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    {loginType === 'hospital'
                      ? 'License Number'
                      : 'Patient ID'}
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={
                      loginType === 'hospital'
                        ? 'e.g., HOSP001'
                        : 'e.g., 2025-HOSP001-000001'
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;