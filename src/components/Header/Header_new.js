import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header_new.css';

const Header_New = ({ userRole }) => {
  const navigate = useNavigate();
  
  // Determine background color based on user role
  const getHeaderStyle = () => {
    switch(userRole) {
      case 'admin':
        return { backgroundColor: '#3c4e7cff' };
      case 'manager':
        return { backgroundColor: '#15803d' };
      case 'user':
        return { backgroundColor: '#0369a1' };
      default:
        return { backgroundColor:'#1e40af' }; // Default color for unknown roles};
    }
  };

  const handleLogout = () => {
    // Perform logout logic if needed
    navigate('/');
  };

  return (
    <header className="app-header" style={getHeaderStyle()}>
      <nav className="left-nav">
        <ul className="nav-links">
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/audits">Audits</a></li>
          <li><a href="/userrole">User Management</a></li>
        </ul>
      </nav>
      
      <h1 className="header-title"><strong>ISMS AUDIT REPORTS</strong></h1>
      
      <div className="right-nav">
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </header>
  );
};

export default Header_New;