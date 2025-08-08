import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header_Main/Header';
import Login from './components/Login';
import Dashboard from './pages/dashboard';
import Audits from './pages/audits';
import UserRole from './pages/userrole';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/audits" element={<Audits />} />
            <Route path="/userrole" element={<UserRole />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;