import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUpload, FiDownload, FiRefreshCw, FiSearch, FiEdit2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './audits.css';

const Audits = () => {
  const [auditType, setAuditType] = useState('internal');
  const [auditData, setAuditData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  const [lastUploadDate, setLastUploadDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAuditData(auditType);
      setAuditData(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setLastUploadDate(data[0].lastUploadDate || null);
      }
    } catch (err) {
      setError(err.message);
      setAuditData([]);
      toast.error('Failed to load audit data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [auditType]);

  useEffect(() => {
    const checkUser = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/');
        return;
      }
      const user = JSON.parse(userStr);
      setIsAdmin(user.role === 'admin');
    };

    checkUser();
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.info(`File selected: ${selectedFile.name}`);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.warning('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', auditType);
      
      setFile(null);
      setFileKey(Date.now());

      await api.uploadAuditFile(formData, auditType);
      await loadData();
      toast.success('File uploaded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload file');
      toast.error(err.message || 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCellUpdate = async (rowIndex, columnName, value) => {
    const updatedData = [...auditData];
    updatedData[rowIndex][columnName] = value;
    setAuditData(updatedData);

    try {
      await api.updateAuditRecord(auditType, updatedData[rowIndex]);
    } catch (err) {
      setError('Failed to save changes');
      toast.error('Failed to save changes');
    }
  };

  const filteredData = auditData.filter(row => 
    Object.values(row).some(
      val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleRowExpand = (rowIndex) => {
    setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
  };

  return (
    <div className="audit-dashboard">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="audit-container">
        <div className="audit-sidebar">
          <div className="audit-menu">
            <button 
              className={`menu-item ${auditType === 'internal' ? 'active' : ''}`}
              onClick={() => setAuditType('internal')}
            >
              Internal Audits
            </button>
            <button 
              className={`menu-item ${auditType === 'external' ? 'active' : ''}`}
              onClick={() => setAuditType('external')}
            >
              External Audits
            </button>
          </div>
        </div>
        
        <div className="audit-content">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="audit-header"
          >
            <h2>Audit Management System</h2>
            <p>Comprehensive tracking and management of audit findings and corrective actions</p>
          </motion.div>

          <div className="audit-controls">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search audits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {isAdmin && (
              <div className="file-upload-card">
                <div className="upload-header">
                  <FiUpload className="upload-icon" />
                  <h4>Upload New Audit Data</h4>
                </div>
                <div className="upload-controls">
                  <label className="file-input-label">
                    Choose File
                    <input 
                      type="file" 
                      accept=".xlsx,.csv" 
                      onChange={handleFileChange} 
                      key={fileKey} 
                    />
                  </label>
                  <button 
                    onClick={handleFileUpload} 
                    disabled={!file || isLoading}
                    className="upload-button"
                  >
                    {isLoading ? (
                      <FiRefreshCw className="spin-icon" />
                    ) : (
                      <>
                        <FiUpload /> Upload
                      </>
                    )}
                  </button>
                </div>
                {lastUploadDate && (
                  <div className="upload-info">
                    Last updated: {new Date(lastUploadDate).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="audit-table-wrapper">
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading audit data...</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="audit-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>SN</th>
                      <th style={{ width: '120px' }}>Location</th>
                      <th style={{ width: '150px' }}>Domain/Clauses</th>
                      <th style={{ width: '120px' }}>Date of Audit</th>
                      <th style={{ width: '120px' }}>Report Date</th>
                      <th style={{ width: '100px' }}>NC Type</th>
                      <th style={{ width: '250px' }}>Observation</th>
                      <th style={{ minWidth: '300px' }}>Root Cause Analysis</th>
                      <th style={{ minWidth: '300px' }}>Corrective Action</th>
                      <th style={{ minWidth: '300px' }}>Preventive Action</th>
                      <th style={{ width: '150px' }}>Responsibility</th>
                      <th style={{ width: '120px' }}>Closing Date</th>
                      <th style={{ width: '120px' }}>Status</th>
                      <th style={{ width: '150px' }}>Evidence</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, rowIndex) => (
                      <React.Fragment key={rowIndex}>
                        <tr>
                          <td>{row.SN}</td>
                          <td>{row.Location}</td>
                          <td>{row.DomainClauses}</td>
                          <td>{row.DateOfAudit}</td>
                          <td>{row.DateOfSubmission}</td>
                          <td>
                            <span className={`nc-badge ${row.NCMinI?.toLowerCase().replace(' ', '-')}`}>
                              {row.NCMinI}
                            </span>
                          </td>
                          <td className="observation-cell">
                            <div className="observation-content">
                              {row.ObservationDescription}
                            </div>
                          </td>
                          <td>
                            <textarea
                              value={row.RootCauseAnalysis || ''}
                              onChange={(e) => handleCellUpdate(rowIndex, 'RootCauseAnalysis', e.target.value)}
                              placeholder="Enter root cause analysis..."
                            />
                          </td>
                          <td>
                            <textarea
                              value={row.CorrectiveAction || ''}
                              onChange={(e) => handleCellUpdate(rowIndex, 'CorrectiveAction', e.target.value)}
                              placeholder="Enter corrective action..."
                            />
                          </td>
                          <td>
                            <textarea
                              value={row.PreventiveAction || ''}
                              onChange={(e) => handleCellUpdate(rowIndex, 'PreventiveAction', e.target.value)}
                              placeholder="Enter preventive action..."
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.Responsibility || ''}
                              onChange={(e) => handleCellUpdate(rowIndex, 'Responsibility', e.target.value)}
                              placeholder="Responsible party"
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              value={row.ClosingDates || ''}
                              onChange={(e) => handleCellUpdate(rowIndex, 'ClosingDates', e.target.value)}
                            />
                          </td>
                          <td>
                            <select
                              value={row.Status || 'Open'}
                              onChange={(e) => handleCellUpdate(rowIndex, 'Status', e.target.value)}
                              className={`status-select ${row.Status?.toLowerCase()}`}
                            >
                              <option value="Open">Open</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.Evidence || ''}
                              onChange={(e) => handleCellUpdate(rowIndex, 'Evidence', e.target.value)}
                              placeholder="Evidence reference"
                            />
                          </td>
                          <td>
                            <button 
                              className="expand-button"
                              onClick={() => toggleRowExpand(rowIndex)}
                            >
                              <FiEdit2 />
                            </button>
                          </td>
                        </tr>
                        {expandedRow === rowIndex && (
                          <tr className="expanded-row">
                            <td colSpan="15">
                              <div className="expanded-content">
                                <h4>Detailed View</h4>
                                <div className="expanded-grid">
                                  <div>
                                    <label>Observation Description:</label>
                                    <p>{row.ObservationDescription}</p>
                                  </div>
                                  <div>
                                    <label>Root Cause Analysis:</label>
                                    <textarea
                                      value={row.RootCauseAnalysis || ''}
                                      onChange={(e) => handleCellUpdate(rowIndex, 'RootCauseAnalysis', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label>Corrective Action:</label>
                                    <textarea
                                      value={row.CorrectiveAction || ''}
                                      onChange={(e) => handleCellUpdate(rowIndex, 'CorrectiveAction', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label>Preventive Action:</label>
                                    <textarea
                                      value={row.PreventiveAction || ''}
                                      onChange={(e) => handleCellUpdate(rowIndex, 'PreventiveAction', e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audits;