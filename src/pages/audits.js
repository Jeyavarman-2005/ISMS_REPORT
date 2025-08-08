// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import Header from '../components/Header';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { FiUpload, FiRefreshCw, FiSearch, FiEdit2 } from 'react-icons/fi';
// import { motion } from 'framer-motion';
// import './audits.css';

// const Audits = () => {
//   const [auditType, setAuditType] = useState('internal');
//   const [auditData, setAuditData] = useState([]);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [file, setFile] = useState(null);
//   const [fileKey, setFileKey] = useState(Date.now());
//   const [lastUploadDate, setLastUploadDate] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [expandedRow, setExpandedRow] = useState(null);
//   const navigate = useNavigate();

//   const loadData = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const data = await api.getAuditData(auditType);
//       setAuditData(Array.isArray(data) ? data : []);
//       if (data.length > 0) {
//         setLastUploadDate(data[0].lastUploadDate || null);
//       }
//     } catch (err) {
//       setError(err.message);
//       setAuditData([]);
//       toast.error('Failed to load audit data');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, [auditType]);

//   useEffect(() => {
//     const checkUser = async () => {
//       const userStr = localStorage.getItem('user');
//       if (!userStr) {
//         navigate('/');
//         return;
//       }
//       const user = JSON.parse(userStr);
//       setIsAdmin(user.role === 'admin');
//     };

//     checkUser();
//   }, [navigate]);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//       toast.info(`File selected: ${selectedFile.name}`);
//     }
//   };

//   const handleFileUpload = async () => {
//     if (!file) {
//       toast.warning('Please select a file first');
//       return;
//     }

//     setIsLoading(true);
//     setError('');
    
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('type', auditType);
      
//       setFile(null);
//       setFileKey(Date.now());

//       await api.uploadAuditFile(formData, auditType);
//       await loadData();
//       toast.success('File uploaded successfully!');
//     } catch (err) {
//       setError(err.message || 'Failed to upload file');
//       toast.error(err.message || 'Failed to upload file');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCellUpdate = async (rowIndex, columnName, value) => {
//     const updatedData = [...auditData];
//     updatedData[rowIndex][columnName] = value;
//     setAuditData(updatedData);

//     try {
//       await api.updateAuditRecord(auditType, updatedData[rowIndex]);
//     } catch (err) {
//       setError('Failed to save changes');
//       toast.error('Failed to save changes');
//     }
//   };

//   const filteredData = auditData.filter(row => 
//     Object.values(row).some(
//       val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   const toggleRowExpand = (rowIndex) => {
//     setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
//   };

//   return (
//     <div className="audit-dashboard">
//       <Header />
//       <ToastContainer position="top-right" autoClose={5000} />
      
//       <div className="audit-container">
//         <div className="audit-sidebar">
//           <div className="audit-menu">
//             <button 
//               className={`menu-item ${auditType === 'internal' ? 'active' : ''}`}
//               onClick={() => setAuditType('internal')}
//             >
//               Internal Audits
//             </button>
//             <button 
//               className={`menu-item ${auditType === 'external' ? 'active' : ''}`}
//               onClick={() => setAuditType('external')}
//             >
//               External Audits
//             </button>
//           </div>
//         </div>
        
//         <div className="audit-content">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="audit-header"
//           >
//             <h2>Audit Management System</h2>
//             <p>Comprehensive tracking and management of audit findings and corrective actions</p>
//           </motion.div>

//           <div className="audit-controls">
//             <div className="search-box">
//               <FiSearch className="search-icon" />
//               <input
//                 type="text"
//                 placeholder="Search audits..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
            
//             {isAdmin && (
//               <div className="file-upload-card">
//                 <div className="upload-header">
//                   <FiUpload className="upload-icon" />
//                   <h4>Upload New Audit Data</h4>
//                 </div>
//                 <div className="upload-controls">
//                   <label className="file-input-label">
//                     Choose File
//                     <input 
//                       type="file" 
//                       accept=".xlsx,.csv" 
//                       onChange={handleFileChange} 
//                       key={fileKey} 
//                     />
//                   </label>
//                   <button 
//                     onClick={handleFileUpload} 
//                     disabled={!file || isLoading}
//                     className="upload-button"
//                   >
//                     {isLoading ? (
//                       <FiRefreshCw className="spin-icon" />
//                     ) : (
//                       <>
//                         <FiUpload /> Upload
//                       </>
//                     )}
//                   </button>
//                 </div>
//                 {lastUploadDate && (
//                   <div className="upload-info">
//                     Last updated: {new Date(lastUploadDate).toLocaleString()}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {error && (
//             <div className="error-message">
//               {error}
//             </div>
//           )}

//           <div className="audit-table-wrapper">
//             {isLoading ? (
//               <div className="loading-spinner">
//                 <div className="spinner"></div>
//                 <p>Loading audit data...</p>
//               </div>
//             ) : (
//               <div className="table-container">
//                 <table className="audit-data-table">
//                   <thead>
//                     <tr>
//                       <th style={{ width: '50px' }}>SN</th>
//                       <th style={{ width: '120px' }}>Location</th>
//                       <th style={{ width: '150px' }}>Domain/Clauses</th>
//                       <th style={{ width: '120px' }}>Date of Audit</th>
//                       <th style={{ width: '120px' }}>Report Date</th>
//                       <th style={{ width: '100px' }}>NC Type</th>
//                       <th style={{ width: '250px' }}>Observation</th>
//                       <th style={{ minWidth: '300px' }}>Root Cause Analysis</th>
//                       <th style={{ minWidth: '300px' }}>Corrective Action</th>
//                       <th style={{ minWidth: '300px' }}>Preventive Action</th>
//                       <th style={{ width: '150px' }}>Responsibility</th>
//                       <th style={{ width: '120px' }}>Closing Date</th>
//                       <th style={{ width: '120px' }}>Status</th>
//                       <th style={{ width: '150px' }}>Evidence</th>
//                       <th style={{ width: '50px' }}></th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredData.map((row, rowIndex) => (
//                       <React.Fragment key={rowIndex}>
//                         <tr>
//                           <td>{row.SN}</td>
//                           <td>{row.Location}</td>
//                           <td>{row.DomainClauses}</td>
//                           <td>{row.DateOfAudit}</td>
//                           <td>{row.DateOfSubmission}</td>
//                           <td>
//                             <span className={`nc-badge ${row.NCMinI?.toLowerCase().replace(' ', '-')}`}>
//                               {row.NCMinI}
//                             </span>
//                           </td>
//                           <td className="observation-cell">
//                             <div className="observation-content">
//                               {row.ObservationDescription}
//                             </div>
//                           </td>
//                           <td>
//                             <textarea
//                               value={row.RootCauseAnalysis || ''}
//                               onChange={(e) => handleCellUpdate(rowIndex, 'RootCauseAnalysis', e.target.value)}
//                               placeholder="Enter root cause analysis..."
//                             />
//                           </td>
//                           <td>
//                             <textarea
//                               value={row.CorrectiveAction || ''}
//                               onChange={(e) => handleCellUpdate(rowIndex, 'CorrectiveAction', e.target.value)}
//                               placeholder="Enter corrective action..."
//                             />
//                           </td>
//                           <td>
//                             <textarea
//                               value={row.PreventiveAction || ''}
//                               onChange={(e) => handleCellUpdate(rowIndex, 'PreventiveAction', e.target.value)}
//                               placeholder="Enter preventive action..."
//                             />
//                           </td>
//                           <td>
//                             <input
//                               type="text"
//                               value={row.Responsibility || ''}
//                               onChange={(e) => handleCellUpdate(rowIndex, 'Responsibility', e.target.value)}
//                               placeholder="Responsible party"
//                             />
//                           </td>
//                           <td>
//                             <input
//                               type="date"
//                               value={row.ClosingDates || ''}
//                               onChange={(e) => handleCellUpdate(rowIndex, 'ClosingDates', e.target.value)}
//                             />
//                           </td>
//                           <td>
//                             <select
//                               value={row.Status || 'Open'}
//                               onChange={(e) => handleCellUpdate(rowIndex, 'Status', e.target.value)}
//                               className={`status-select ${row.Status?.toLowerCase()}`}
//                             >
//                               <option value="Open">Open</option>
//                               <option value="Closed">Closed</option>
//                             </select>
//                           </td>
//                           <td>
//                             <input
//                               type="text"
//                               value={row.Evidence || ''}
//                               onChange={(e) => handleCellUpdate(rowIndex, 'Evidence', e.target.value)}
//                               placeholder="Evidence reference"
//                             />
//                           </td>
//                           <td>
//                             <button 
//                               className="expand-button"
//                               onClick={() => toggleRowExpand(rowIndex)}
//                             >
//                               <FiEdit2 />
//                             </button>
//                           </td>
//                         </tr>
//                         {expandedRow === rowIndex && (
//                           <tr className="expanded-row">
//                             <td colSpan="15">
//                               <div className="expanded-content">
//                                 <h4>Detailed View</h4>
//                                 <div className="expanded-grid">
//                                   <div>
//                                     <label>Observation Description:</label>
//                                     <p>{row.ObservationDescription}</p>
//                                   </div>
//                                   <div>
//                                     <label>Root Cause Analysis:</label>
//                                     <textarea
//                                       value={row.RootCauseAnalysis || ''}
//                                       onChange={(e) => handleCellUpdate(rowIndex, 'RootCauseAnalysis', e.target.value)}
//                                     />
//                                   </div>
//                                   <div>
//                                     <label>Corrective Action:</label>
//                                     <textarea
//                                       value={row.CorrectiveAction || ''}
//                                       onChange={(e) => handleCellUpdate(rowIndex, 'CorrectiveAction', e.target.value)}
//                                     />
//                                   </div>
//                                   <div>
//                                     <label>Preventive Action:</label>
//                                     <textarea
//                                       value={row.PreventiveAction || ''}
//                                       onChange={(e) => handleCellUpdate(rowIndex, 'PreventiveAction', e.target.value)}
//                                     />
//                                   </div>
//                                 </div>
//                               </div>
//                             </td>
//                           </tr>
//                         )}
//                       </React.Fragment>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Audits;

//Included search option//
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header_Main/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUpload, FiDownload, FiRefreshCw, FiSearch, FiEdit2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FiFile, FiX, FiCheck } from 'react-icons/fi';
import './audits.css';

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
        )
      );
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
  
  // Add validation for row.ID
  console.log('Row data:', row);
  console.log('Available IDs:', {
    ID: row.ID,
    id: row.id,
    Id: row.Id,
    _id: row._id
  });

   if (!row.ID && !row.id && !row.Id && !row._id) {
    toast.error('Invalid record: Missing ID');
    return;
  }

  setIsLoading(true);

  try {
    const formData = new FormData();
    formData.append('file', evidenceFiles[rowIndex]);
    const recordId = row.ID || row.id || row.Id || row._id;
    formData.append('record_id', row.ID.toString()); // Now safe to call toString()
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
    <div className="audit-dashboard">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="audit-container">
        <div className="audit-content">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="audit-header"
          >
            <h2>{auditType === 'internal' ? 'Internal' : 'External'} Audit Management</h2>
            <p>Comprehensive tracking and management of audit findings and corrective actions</p>
          </motion.div>

          <div className="audit-controls">
            <div className="filter-controls">
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search audits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="plant-filter">
                <select
                  value={selectedPlant}
                  onChange={(e) => setSelectedPlant(e.target.value)}
                  className="plant-select"
                >
                  {plants.map((plant, index) => (
                    <option key={index} value={plant}>{plant}</option>
                  ))}
                </select>
              </div>
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
                            <select
                              value={row.Responsibility || ''}
                              onChange={(e) => handleCellUpdate(rowIndex, 'Responsibility', e.target.value)}
                              className="responsibility-select"
                            >
                              <option value="">Select Responsible</option>
                              {users.map(user => (
                                <option key={user.id} value={user.Username}>
                                  {user.CompanyName} ({user.Username})
                                </option>
                              ))}
                            </select>
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
                              disabled={!isAdmin && row.Status === 'Closed'}
                            >
                              <option value="Open">Open</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>
                          <td className="evidence-cell">
                            {row.Evidence ? (
                              <div className="evidence-download">
                                <a 
                                  href={`${api.baseUrl}/uploads/${row.Evidence}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="download-link"
                                >
                                  <FiDownload /> Download
                                </a>
                                {isAdmin && (
                                  <button 
                                    className="clear-evidence"
                                    onClick={() => handleCellUpdate(rowIndex, 'Evidence', '')}
                                  >
                                    <FiX />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="evidence-upload">
                                <input
                                  type="file"
                                  id={`evidence-${rowIndex}`}
                                  accept=".pdf,.pptx,.png,.jpeg,.jpg"
                                  onChange={(e) => handleEvidenceFileChange(e, rowIndex)}
                                  style={{ display: 'none' }}
                                />
                                <label htmlFor={`evidence-${rowIndex}`} className="file-label">
                                  <FiFile /> Choose File
                                </label>
                                {evidenceFiles[rowIndex] && (
                                  <>
                                    <span className="file-name">{evidenceFiles[rowIndex].name}</span>
                                    <button 
                                      className="upload-button"
                                      onClick={() => handleEvidenceUpload(rowIndex)}
                                      disabled={isLoading}
                                    >
                                      <FiUpload /> Upload
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
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