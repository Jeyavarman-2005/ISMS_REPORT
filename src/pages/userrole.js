import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './userrole.css';
import Header from '../components/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUserPlus, FiUsers, FiEdit2, FiTrash2, FiKey, FiMail, FiBriefcase, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';

const UserRole = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    plantName: '', // New field
    username: '',
    genId: '',    // New field
    password: '',
    email: '',
    department: '',
    role: 'user'
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login');
          return;
        }

        const user = JSON.parse(userStr);
        if (user?.role !== 'admin') {
          navigate('/dashboard');
          return;
        }

        setUser(user);
        setIsAdmin(true);
        await loadUsers();
      } catch (err) {
        console.error('Error:', err);
        navigate('/login');
      }
    };

    checkUser();
  }, [navigate]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await api.getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };
  const handleEdit = (user) => {
    setFormData({
      companyName: user.CompanyName,
      plantName: user.PlantName || '', // Add new fields
      username: user.Username,
      genId: user.GenId || '', // Add new field
      password: '',
      email: user.Email,
      department: user.Department,
      role: user.Role
    });
    setEditingUserId(user.id); // Track which user we're editing
    setActiveTab('add');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  
  try {
    if (editingUserId) {
      // Update existing user
      await api.updateUser(editingUserId, formData);
      toast.success('User updated successfully!');
    } else {
      // Create new user
      await api.createUser(formData);
      toast.success('User created successfully!');
    }
    
    await loadUsers();
    setFormData({
      companyName: '',
      plantName: '',
      username: '',
      genId: '',
      password: '',
      email: '',
      department: '',
      role: 'user'
    });
    setEditingUserId(null); // Reset editing state
  } catch (err) {
    setError(err.message);
    toast.error(err.message || 'Operation failed');
  } finally {
    setIsLoading(false);
  }
};

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(userId);
        await loadUsers();
        toast.success('User deleted successfully');
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    Object.values(user).some(
      val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
  ));

  if (!isAdmin) return null;

  return (
    <div className="admin-dashboard">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="admin-profile">
            <div className="admin-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="admin-info">
              <h4>{user?.username}</h4>
              <span className="admin-badge">Admin</span>
            </div>
          </div>
          
          <nav className="admin-menu">
            <button 
              className={`menu-item ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              <FiUserPlus className="menu-icon" />
              Add User
            </button>
            <button 
              className={`menu-item ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              <FiUsers className="menu-icon" />
              Manage Users
            </button>
          </nav>
        </div>
        
        <div className="admin-content">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="admin-header"
          >
            <h2>User Management</h2>
            <p>Admin dashboard for managing system users and permissions</p>
          </motion.div>
          
          {activeTab === 'add' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="user-form-container"
            >
              <div className="form-card">
                <div className="form-header">
                  <FiUserPlus className="form-icon" />
                  <h3>Create New User</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="elegant-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        <FiHome className="input-icon" />
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter company name"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <FiHome className="input-icon" />
                        Plant Name
                      </label>
                      <input
                        type="text"
                        name="plantName"
                        value={formData.plantName || ''}
                        onChange={handleInputChange}
                        placeholder="Enter plant name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>
                        <FiUserPlus className="input-icon" />
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter username"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <FiUserPlus className="input-icon" />
                        GEN ID
                      </label>
                      <input
                        type="text"
                        name="genId"
                        value={formData.genId}
                        onChange={handleInputChange}
                        placeholder="Enter GEN ID"
                      />
                    </div>
                                        
                    <div className="form-group">
                      <label>
                        <FiKey className="input-icon" />
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter password"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>
                        <FiMail className="input-icon" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter email"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>
                        <FiBriefcase className="input-icon" />
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter department"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>
                        <FiKey className="input-icon" />
                        Role
                      </label>
                      <select 
                        name="role" 
                        value={formData.role} 
                        onChange={handleInputChange}
                        className="role-select"
                      >
                        <option value="user">Standard User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="button-loader"></span>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'manage' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="user-list-container"
            >
              <div className="list-controls">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="search-icon">🔍</span>
                </div>
                <div className="user-count">
                  Total Users: {filteredUsers.length}
                </div>
              </div>
              
              <div className="table-responsive">
                {isLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading users...</p>
                  </div>
                ) : (
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Company</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.CompanyName}</td>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">
                                {user.Username?.charAt(0).toUpperCase()}
                              </div>
                              {user.Username}
                            </div>
                          </td>
                          <td>{user.Email}</td>
                          <td>{user.Department}</td>
                          <td>
                            <span className={`role-badge ${user.Role.toLowerCase()}`}>
                              {user.Role}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="edit-button"
                                onClick={() => handleEdit(user)}
                              >
                                <FiEdit2 />
                              </button>
                              <button 
                                className="delete-button"
                                onClick={() => handleDelete(user.id)}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRole;