import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { 
  FiUserPlus, 
  FiUsers, 
  FiFileText, 
  FiFile, 
  FiUser, 
  FiChevronDown 
} from 'react-icons/fi';

const Header = ({ userRole, userData }) => {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Dynamic background color for first header based on user role
  const getMainHeaderStyle = () => {
    switch (userRole) {
      case 'admin':
        return { backgroundColor: '#3c4e7cff' };
      case 'manager':
        return { backgroundColor: '#15803d' };
      case 'user':
        return { backgroundColor: '#0369a1' };
      default:
        return { backgroundColor: '#1e40af' };
    }
  };

  // Gradient for the second header
  const getNavHeaderStyle = () => {
    return { 
      background: 'linear-gradient(to right, #1058d3ff, #1a202c)'
    };
  };

  const handleLogout = () => {
    navigate('/');
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Safely access userData properties with defaults
  const { 
    id = 'N/A', 
    name = 'User', 
    department = 'N/A' 
  } = userData || {};

  return (
    <div className="header-container">
      {/* First Header - Title, User Profile and Logout */}
      <header className="main-header" style={getMainHeaderStyle()}>
        <h1 className="header-title"><strong>ISMS AUDIT REPORTS</strong></h1>
        <div className="right-nav">
          <div className="user-profile-container">
            <button className="user-profile-button" onClick={toggleProfileDropdown}>
              <FiUser className="user-icon" />
              <span className="user-name">{name}</span>
              <FiChevronDown className="dropdown-arrow" />
            </button>
            
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <FiUser className="profile-icon" />
                  <h3>User Profile</h3>
                </div>
                <div className="profile-details">
                  <div className="profile-item">
                    <span className="profile-label">User ID:</span>
                    <span className="profile-value">{id}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Name:</span>
                    <span className="profile-value">{name}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Department:</span>
                    <span className="profile-value">{department}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Role:</span>
                    <span className="profile-value">{userRole || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      {/* Second Header - Navigation Links */}
      <header className="nav-header" style={getNavHeaderStyle()}>
        <nav className="left-nav">
          <ul className="nav-links">
            <li><a href="/dashboard">Dashboard</a></li>
            <li className="audit-dropdown">
              <a href="/audits">Audits</a>
              <div className="dropdown-content">
                <a href="/audits?type=internal">
                  <FiFileText className="dropdown-icon" /> Internal Audits
                </a>
                <a href="/audits?type=external">
                  <FiFile className="dropdown-icon" /> External Audits
                </a>
              </div>
            </li>
            <li className="user-dropdown">
              <a href="/userrole">User Management</a>
              <div className="dropdown-content">
                <a href="/userrole?tab=add">
                  <FiUserPlus className="dropdown-icon" /> Add User
                </a>
                <a href="/userrole?tab=manage">
                  <FiUsers className="dropdown-icon" /> Manage Users
                </a>
              </div>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
};

Header.propTypes = {
  userRole: PropTypes.string,
  userData: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    department: PropTypes.string
  })
};

Header.defaultProps = {
  userRole: 'user',
  userData: {
    id: 'N/A',
    name: 'User',
    department: 'N/A'
  }
};

export default Header;