import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Hospitals from './pages/Hospitals';
import Patients from './pages/Patients';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;