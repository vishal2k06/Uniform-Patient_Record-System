import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ component: Component, allowedTypes, ...rest }) => {
  const token = localStorage.getItem('token');
  let isAuthenticated = false;
  let userType = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userType = decoded.type;
      isAuthenticated = allowedTypes.includes(userType);
    } catch (err) {
      isAuthenticated = false;
    }
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Navigate to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;