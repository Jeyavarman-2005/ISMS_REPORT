import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/Common/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUpload, FiDownload, FiRefreshCw, FiSearch, FiEdit2, FiFile, FiX, FiFilter } from 'react-icons/fi';
import styles from './Audits.module.css';

const Audits = () => {
  const [auditType, setAuditType] = useState('internal');
  const [auditData, setAuditData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  const [lastUploadDate, setLastUploadDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState('All Plants');
  const [plants, setPlants] = useState([]);
  const [users, setUsers] = useState([]);
  const [evidenceFiles, setEvidenceFiles] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const type = queryParams.get('type');
    if (type === 'internal' || type === 'external') {
      setAuditType(type);
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAuditData(auditType);
      setAuditData(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setLastUploadDate(data[0].lastUploadDate || null);
      }

      const uniquePlants = ['All Plants', ...new Set(data.map(item => item.Location).filter(Boolean))];
      setPlants(uniquePlants);
      
      applyFilters(searchTerm, selectedPlant, data);
    } catch (err) {
      setError(err.message);
      setAuditData([]);
      setFilteredData([]);
      toast.error('Failed to load audit data');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (searchTerm, plant, data = auditData) => {
    let result = [...data];
    
    if (plant && plant !== 'All Plants') {
      result = result.filter(row => row.Location === plant);
    }
    
    if (searchTerm) {
      result = result.filter(row => 
        Object.values(row).some(
          val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
    
    setFilteredData(result);
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

  useEffect(() => {
    applyFilters(searchTerm, selectedPlant);
  }, [searchTerm, selectedPlant]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await api.getAllUsers();
        setUsers(userList);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };

    fetchUsers();
  }, []);

  const handleEvidenceFileChange = (e, rowIndex) => {
    const file = e.target.files[0];
    if (file) {
      setEvidenceFiles(prev => ({
        ...prev,
        [rowIndex]: file
      }));
      toast.info(`File selected for row ${rowIndex + 1}: ${file.name}`);
    }
  };

  const handleEvidenceUpload = async (rowIndex) => {
    if (!evidenceFiles[rowIndex]) {
      toast.warning('Please select a file first');
      return;
    }

    const row = filteredData[rowIndex];
    
    if (!row.ID && !row.id && !row.Id && !row._id) {
      toast.error('Invalid record: Missing ID');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', evidenceFiles[rowIndex]);
      const recordId = row.ID || row.id || row.Id || row._id;
      formData.append('record_id', row.ID.toString());
      formData.append('audit_type', auditType);

      const response = await api.uploadEvidence(formData);
      
      const updatedData = [...auditData];
      const dataIndex = auditData.findIndex(item => item.ID === row.ID);
      
      if (dataIndex !== -1) {
        updatedData[dataIndex] = {
          ...updatedData[dataIndex],
          Evidence: response.filename,
          Status: 'Closed'
        };
        
        setAuditData(updatedData);
        applyFilters(searchTerm, selectedPlant, updatedData);
        
        setEvidenceFiles(prev => {
          const newState = {...prev};
          delete newState[rowIndex];
          return newState;
        });
        
        toast.success('Evidence uploaded successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload evidence');
    } finally {
      setIsLoading(false);
    }
  };

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
      applyFilters(searchTerm, selectedPlant, updatedData);
    } catch (err) {
      setError('Failed to save changes');
      toast.error('Failed to save changes');
    }
  };

  const toggleRowExpand = (rowIndex) => {
    setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
  };

  return (
    <div className={styles.auditDashboard}>
      <Header />
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className={styles.auditContainer}>
        <div className={styles.auditContent}>
          {/* Compact Header Row */}
          <div className={styles.compactHeader}>
            <div className={styles.titleSection}>
              <h1>Internal Audit Management</h1>
            </div>
            
            <div className={styles.controlsSection}>
              <div className={styles.searchBox}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search audits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className={styles.filterDropdown}>
                <FiFilter className={styles.filterIcon} />
                <select
                  value={selectedPlant}
                  onChange={(e) => setSelectedPlant(e.target.value)}
                >
                  {plants.map((plant, index) => (
                    <option key={index} value={plant}>{plant}</option>
                  ))}
                </select>
              </div>
              
              {isAdmin && (
                <div className={styles.uploadControl}>
                  <label className={styles.fileInputLabel}>
                    <input 
                      type="file" 
                      accept=".xlsx,.csv" 
                      onChange={handleFileChange} 
                      key={fileKey} 
                    />
                    <span className={styles.fileInputButton}>
                      <FiUpload /> Upload
                    </span>
                  </label>
                  <button 
                    onClick={handleFileUpload} 
                    disabled={!file || isLoading}
                    className={styles.uploadButton}
                  >
                    {isLoading ? (
                      <FiRefreshCw className={styles.spinIcon} />
                    ) : 'Submit'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Enhanced Audit Table */}
          <div className={styles.tableWrapper}>
            {isLoading ? (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <p>Loading audit data...</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.auditTable}>
                  <thead>
                    <tr>
                      <th>SN</th>
                      <th>Location</th>
                      <th>Domain/Clauses</th>
                      <th>Date of Audit</th>
                      <th>Report Date</th>
                      <th>NC Type</th>
                      <th>Observation</th>
                      <th>Root Cause Analysis</th>
                      <th>Corrective Action</th>
                      <th>Preventive Action</th>
                      <th>Responsibility</th>
                      <th>Closing Date</th>
                      <th>Status</th>
                      <th>Evidence</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, rowIndex) => (
                      <React.Fragment key={rowIndex}>
                        <tr>
                          <td className={styles.tableCell}>{row.SN}</td>
                          <td className={styles.tableCell}>{row.Location}</td>
                          <td className={styles.tableCell}>{row.DomainClauses}</td>
                          <td className={styles.tableCell}>{row.DateOfAudit}</td>
                          <td className={styles.tableCell}>{row.DateOfSubmission}</td>
                          <td className={styles.tableCell}>
                            <span className={`${styles.ncBadge} ${styles[row.NCMinI?.toLowerCase().replace(' ', '-')]}`}>
                              {row.NCMinI}
                            </span>
                          </td>
                          <td className={`${styles.tableCell} ${styles.observationCell}`}>
                            {row.ObservationDescription}
                          </td>
                          <td className={`${styles.tableCell} ${styles.editableCell}`}>
                            <textarea
                              value={row.RootCauseAnalysis || ''}
                              onChange={(e) => handleCellUpdate(rowIndex, 'RootCauseAnalysis', e.target.value)}
                              placeholder="Enter analysis..."
                              className={styles.editableField}
                            />
                          </td>
                          <td className={`${styles.tableCell} ${styles.editableCell}`}>
                            <textarea
                              value={row.CorrectiveAction || ''}
                              onChange={(e) => handleCellUpdate(rowIndex, 'CorrectiveAction', e.target.value)}
                              placeholder="Enter action..."
                              className={styles.editableField}
                            />
                          </td>
                          <td className={`${styles.tableCell} ${styles.editableCell}`}>
                            <textarea
                              value={row.PreventiveAction || ''}
                              onChange={(e) => handleCellUpdate(rowIndex, 'PreventiveAction', e.target.value)}
                              placeholder="Enter action..."
                              className={styles.editableField}
                            />
                          </td>
                          <td className={`${styles.tableCell} ${styles.editableCell}`}>
                            <select
                              value={row.Responsibility || ''}
                              onChange={(e) => handleCellUpdate(rowIndex, 'Responsibility', e.target.value)}
                              className={styles.responsibilitySelect}
                            >
                              <option value="">Select</option>
                              {users.map(user => (
                                <option key={user.id} value={user.Username}>
                                  {user.CompanyName} ({user.Username})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className={`${styles.tableCell} ${styles.editableCell}`}>
                            <input
                              type="date"
                              value={row.ClosingDates || ''}
                              onChange={(e) => handleCellUpdate(rowIndex, 'ClosingDates', e.target.value)}
                              className={styles.dateInput}
                            />
                          </td>
                          <td className={`${styles.tableCell} ${styles.editableCell}`}>
                            <select
                              value={row.Status || 'Open'}
                              onChange={(e) => handleCellUpdate(rowIndex, 'Status', e.target.value)}
                              className={`${styles.statusSelect} ${styles[row.Status?.toLowerCase()]}`}
                              disabled={!isAdmin && row.Status === 'Closed'}
                            >
                              <option value="Open">Open</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>
                          <td className={`${styles.tableCell} ${styles.evidenceCell}`}>
                            {row.Evidence ? (
                              <div className={styles.evidenceDownload}>
                                <a 
                                  href={`${api.baseUrl}/uploads/${row.Evidence}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={styles.downloadLink}
                                >
                                  <FiDownload /> Download
                                </a>
                                {isAdmin && (
                                  <button 
                                    className={styles.clearEvidence}
                                    onClick={() => handleCellUpdate(rowIndex, 'Evidence', '')}
                                  >
                                    <FiX />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className={styles.evidenceUpload}>
                                <input
                                  type="file"
                                  id={`evidence-${rowIndex}`}
                                  accept=".pdf,.pptx,.png,.jpeg,.jpg"
                                  onChange={(e) => handleEvidenceFileChange(e, rowIndex)}
                                  style={{ display: 'none' }}
                                />
                                <label htmlFor={`evidence-${rowIndex}`} className={styles.fileLabel}>
                                  <FiFile /> Choose File
                                </label>
                                {evidenceFiles[rowIndex] && (
                                  <button 
                                    className={styles.uploadButton}
                                    onClick={() => handleEvidenceUpload(rowIndex)}
                                    disabled={isLoading}
                                  >
                                    <FiUpload /> Upload
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className={styles.tableCell}>
                            <button 
                              className={styles.expandButton}
                              onClick={() => toggleRowExpand(rowIndex)}
                              title="Edit details"
                            >
                              <FiEdit2 />
                            </button>
                          </td>
                        </tr>
                        {expandedRow === rowIndex && (
                          <tr className={styles.expandedRow}>
                            <td colSpan="15">
                              <div className={styles.expandedContent}>
                                <h4>Detailed View</h4>
                                <div className={styles.expandedGrid}>
                                  <div>
                                    <label>Observation Description:</label>
                                    <p>{row.ObservationDescription}</p>
                                  </div>
                                  <div>
                                    <label>Root Cause Analysis:</label>
                                    <textarea
                                      value={row.RootCauseAnalysis || ''}
                                      onChange={(e) => handleCellUpdate(rowIndex, 'RootCauseAnalysis', e.target.value)}
                                      className={styles.expandedTextarea}
                                    />
                                  </div>
                                  <div>
                                    <label>Corrective Action:</label>
                                    <textarea
                                      value={row.CorrectiveAction || ''}
                                      onChange={(e) => handleCellUpdate(rowIndex, 'CorrectiveAction', e.target.value)}
                                      className={styles.expandedTextarea}
                                    />
                                  </div>
                                  <div>
                                    <label>Preventive Action:</label>
                                    <textarea
                                      value={row.PreventiveAction || ''}
                                      onChange={(e) => handleCellUpdate(rowIndex, 'PreventiveAction', e.target.value)}
                                      className={styles.expandedTextarea}
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
