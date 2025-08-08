import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ userRole }) => {
  const navigate = useNavigate();
  
  const getHeaderStyle = () => {
    return { backgroundColor: '#1e40af' };
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <header className="app-header" style={getHeaderStyle()}>
      <nav className="left-nav">
        <ul className="nav-links">
          <li><a href="/dashboard">Dashboard</a></li>
          <li className="audit-dropdown">
            <a href="/audits">Audits</a>
            <div className="dropdown-content">
              <a href="/audits?type=internal">Internal Audits</a>
              <a href="/audits?type=external">External Audits</a>
            </div>
          </li>
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

export default Header;
