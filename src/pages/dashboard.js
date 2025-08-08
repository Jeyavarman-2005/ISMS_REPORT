// import React from 'react';
// import './dashboard.css';
// import Header from '../components/Header';

// const Dashboard = () => {
//   return (
//     <>
//     <Header />
//     <div className="dashboard-container">
//       <h2>Dashboard</h2>
//       <div className="dashboard-content">
//         <div className="dashboard-card">
//           <h3>Welcome to Admin Portal</h3>
//           <p>Use the navigation menu to access different sections of the application.</p>
//         </div>
//       </div>
//     </div>
//     </>
//   );
// };

// export default Dashboard;

// import React, { useState, useEffect } from 'react';
// import './dashboard.css';
// import Header from '../components/Header';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
// import axios from 'axios';

// const Dashboard = () => {
//   const [auditData, setAuditData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [auditType, setAuditType] = useState('internal');
//   const [timeRange, setTimeRange] = useState('last30');

//   // Color palette for charts
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

//   useEffect(() => {
//     fetchAuditData();
//   }, [auditType, timeRange]);

//   const fetchAuditData = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`/api/audits?type=${auditType}`);
//       let data = response.data.data || [];
      
//       // Filter by time range
//       const now = new Date();
//       if (timeRange === 'last30') {
//         const thirtyDaysAgo = new Date();
//         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//         data = data.filter(item => new Date(item.UploadDate) > thirtyDaysAgo);
//       } else if (timeRange === 'last90') {
//         const ninetyDaysAgo = new Date();
//         ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
//         data = data.filter(item => new Date(item.UploadDate) > ninetyDaysAgo);
//       } else if (timeRange === 'lastYear') {
//         const oneYearAgo = new Date();
//         oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
//         data = data.filter(item => new Date(item.UploadDate) > oneYearAgo);
//       }
      
//       setAuditData(data);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching audit data:', error);
//       setLoading(false);
//     }
//   };

//   // Process data for location-wise chart
//   const getLocationData = () => {
//     const locationMap = {};
    
//     auditData.forEach(item => {
//       const location = item.Location || 'Unknown';
//       locationMap[location] = (locationMap[location] || 0) + 1;
//     });
    
//     return Object.entries(locationMap).map(([name, count]) => ({
//       name,
//       count
//     })).sort((a, b) => b.count - a.count);
//   };

//   // Process data for NC Type-wise chart
//   const getNCTypeData = () => {
//     const ncTypeMap = {};
    
//     auditData.forEach(item => {
//       const ncType = item.NCMinI || 'Unknown';
//       ncTypeMap[ncType] = (ncTypeMap[ncType] || 0) + 1;
//     });
    
//     return Object.entries(ncTypeMap).map(([name, count]) => ({
//       name,
//       count
//     })).sort((a, b) => b.count - a.count);
//   };

//   // Process data for Status-wise chart
//   const getStatusData = () => {
//     const statusMap = {};
    
//     auditData.forEach(item => {
//       const status = item.Status || 'Open';
//       statusMap[status] = (statusMap[status] || 0) + 1;
//     });
    
//     return Object.entries(statusMap).map(([name, count]) => ({
//       name,
//       count
//     })).sort((a, b) => b.count - a.count);
//   };

//   // Summary statistics
//   const getSummaryStats = () => {
//     const totalNCs = auditData.length;
//     const openNCs = auditData.filter(item => item.Status === 'Open').length;
//     const closedNCs = auditData.filter(item => item.Status === 'Closed').length;
//     const locations = new Set(auditData.map(item => item.Location)).size;
    
//     return {
//       totalNCs,
//       openNCs,
//       closedNCs,
//       locations,
//       closureRate: totalNCs > 0 ? Math.round((closedNCs / totalNCs) * 100) : 0
//     };
//   };

//   const stats = getSummaryStats();
//   const locationData = getLocationData();
//   const ncTypeData = getNCTypeData();
//   const statusData = getStatusData();

//   return (
//     <>
//       <Header />
//       <div className="dashboard-container">
//         <div className="dashboard-header">
//           <h2>Audit Dashboard</h2>
//           <div className="dashboard-controls">
//             <select 
//               value={auditType} 
//               onChange={(e) => setAuditType(e.target.value)}
//               className="dashboard-select"
//             >
//               <option value="internal">Internal Audits</option>
//               <option value="external">External Audits</option>
//             </select>
//             <select 
//               value={timeRange} 
//               onChange={(e) => setTimeRange(e.target.value)}
//               className="dashboard-select"
//             >
//               <option value="all">All Time</option>
//               <option value="last30">Last 30 Days</option>
//               <option value="last90">Last 90 Days</option>
//               <option value="lastYear">Last Year</option>
//             </select>
//           </div>
//         </div>

//         {loading ? (
//           <div className="dashboard-loading">Loading data...</div>
//         ) : (
//           <div className="dashboard-content">
//             {/* Summary Cards */}
//             <div className="dashboard-summary">
//               <div className="summary-card">
//                 <h3>Total NCs</h3>
//                 <p className="summary-value">{stats.totalNCs}</p>
//               </div>
//               <div className="summary-card">
//                 <h3>Open NCs</h3>
//                 <p className="summary-value">{stats.openNCs}</p>
//               </div>
//               <div className="summary-card">
//                 <h3>Closed NCs</h3>
//                 <p className="summary-value">{stats.closedNCs}</p>
//               </div>
//               <div className="summary-card">
//                 <h3>Closure Rate</h3>
//                 <p className="summary-value">{stats.closureRate}%</p>
//               </div>
//               <div className="summary-card">
//                 <h3>Locations</h3>
//                 <p className="summary-value">{stats.locations}</p>
//               </div>
//             </div>

//             {/* Location-wise Chart */}
//             <div className="dashboard-chart">
//               <h3>NCs by Location</h3>
//               <div className="chart-container">
//                 <BarChart
//                   width={800}
//                   height={400}
//                   data={locationData}
//                   margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="count" fill="#8884d8" name="Number of NCs" />
//                 </BarChart>
//               </div>
//             </div>

//             {/* NC Type-wise Chart */}
//             <div className="dashboard-chart">
//               <h3>NCs by Type</h3>
//               <div className="chart-container">
//                 <PieChart width={400} height={400}>
//                   <Pie
//                     data={ncTypeData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="count"
//                     nameKey="name"
//                     label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                   >
//                     {ncTypeData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </div>
//             </div>

//             {/* Status-wise Chart */}
//             <div className="dashboard-chart">
//               <h3>NCs by Status</h3>
//               <div className="chart-container">
//                 <PieChart width={400} height={400}>
//                   <Pie
//                     data={statusData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="count"
//                     nameKey="name"
//                     label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                   >
//                     {statusData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </div>
//             </div>

//             {/* Recent NCs Table */}
//             <div className="dashboard-table">
//               <h3>Recent Non-Conformities</h3>
//               <table>
//                 <thead>
//                   <tr>
//                     <th>SN</th>
//                     <th>Location</th>
//                     <th>NC Type</th>
//                     <th>Status</th>
//                     <th>Date</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {auditData.slice(0, 5).map((item, index) => (
//                     <tr key={index}>
//                       <td>{item.SN}</td>
//                       <td>{item.Location}</td>
//                       <td>{item.NCMinI}</td>
//                       <td>
//                         <span className={`status-badge ${item.Status?.toLowerCase()}`}>
//                           {item.Status || 'Open'}
//                         </span>
//                       </td>
//                       <td>{new Date(item.UploadDate).toLocaleDateString()}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Dashboard;
// 

// import React, { useState, useEffect } from 'react';
// import './dashboard.css';
// import Header from '../components/Header';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
// import axios from 'axios';

// const Dashboard = () => {
//   const [auditData, setAuditData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [auditType, setAuditType] = useState('internal');
//   const [timeRange, setTimeRange] = useState('last30');

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

//   useEffect(() => {
//     fetchAuditData();
//   }, [auditType, timeRange]);

//   const fetchAuditData = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`http://localhost:3001/api/audits?type=${auditType}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
      
//       if (!response.data || !response.data.data) {
//         console.error('No data received from API');
//         setAuditData([]);
//         setLoading(false);
//         return;
//       }
      
//       let data = response.data.data;
      
//       // Filter by time range
//       const now = new Date();
//       if (timeRange === 'last30') {
//         const thirtyDaysAgo = new Date();
//         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//         data = data.filter(item => item.UploadDate && new Date(item.UploadDate) > thirtyDaysAgo);
//       } else if (timeRange === 'last90') {
//         const ninetyDaysAgo = new Date();
//         ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
//         data = data.filter(item => item.UploadDate && new Date(item.UploadDate) > ninetyDaysAgo);
//       } else if (timeRange === 'lastYear') {
//         const oneYearAgo = new Date();
//         oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
//         data = data.filter(item => item.UploadDate && new Date(item.UploadDate) > oneYearAgo);
//       }
      
//       setAuditData(data || []);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching audit data:', error);
//       setAuditData([]);
//       setLoading(false);
      
//       if (error.response) {
//         if (error.response.status === 404) {
//           alert('API endpoint not found. Please check the server connection.');
//         } else if (error.response.status === 401) {
//           alert('Session expired. Please log in again.');
//         }
//       }
//     }
//   };

//   // Rest of your component code remains the same...
//   // Process data for location-wise chart
//   const getLocationData = () => {
//     if (!auditData || auditData.length === 0) return [];
    
//     const locationMap = {};
    
//     auditData.forEach(item => {
//       const location = item.Location || 'Unknown';
//       locationMap[location] = (locationMap[location] || 0) + 1;
//     });
    
//     return Object.entries(locationMap).map(([name, count]) => ({
//       name,
//       count
//     })).sort((a, b) => b.count - a.count);
//   };

//   // Process data for NC Type-wise chart
//   const getNCTypeData = () => {
//     if (!auditData || auditData.length === 0) return [];
    
//     const ncTypeMap = {};
    
//     auditData.forEach(item => {
//       const ncType = item.NCMinI || 'Unknown';
//       ncTypeMap[ncType] = (ncTypeMap[ncType] || 0) + 1;
//     });
    
//     return Object.entries(ncTypeMap).map(([name, count]) => ({
//       name,
//       count
//     })).sort((a, b) => b.count - a.count);
//   };

//   // Process data for Status-wise chart
//   const getStatusData = () => {
//     if (!auditData || auditData.length === 0) return [];
    
//     const statusMap = {};
    
//     auditData.forEach(item => {
//       const status = item.Status || 'Open';
//       statusMap[status] = (statusMap[status] || 0) + 1;
//     });
    
//     return Object.entries(statusMap).map(([name, count]) => ({
//       name,
//       count
//     })).sort((a, b) => b.count - a.count);
//   };

//   // Summary statistics
//   const getSummaryStats = () => {
//     if (!auditData || auditData.length === 0) {
//       return {
//         totalNCs: 0,
//         openNCs: 0,
//         closedNCs: 0,
//         locations: 0,
//         closureRate: 0
//       };
//     }
    
//     const totalNCs = auditData.length;
//     const openNCs = auditData.filter(item => item.Status === 'Open').length;
//     const closedNCs = auditData.filter(item => item.Status === 'Closed').length;
//     const locations = new Set(auditData.map(item => item.Location)).size;
    
//     return {
//       totalNCs,
//       openNCs,
//       closedNCs,
//       locations,
//       closureRate: totalNCs > 0 ? Math.round((closedNCs / totalNCs) * 100) : 0
//     };
//   };

//   const stats = getSummaryStats();
//   const locationData = getLocationData();
//   const ncTypeData = getNCTypeData();
//   const statusData = getStatusData();

//   return (
//     <>
//       <Header />
//       <div className="dashboard-container">
//         <div className="dashboard-header">
//           <h2>ISMS AUDIT REPORTS</h2>
//           <div className="dashboard-controls">
//             <select 
//               value={auditType} 
//               onChange={(e) => setAuditType(e.target.value)}
//               className="dashboard-select"
//             >
//               <option value="internal">Internal Audits</option>
//               <option value="external">External Audits</option>
//             </select>
//             <select 
//               value={timeRange} 
//               onChange={(e) => setTimeRange(e.target.value)}
//               className="dashboard-select"
//             >
//               <option value="all">All Time</option>
//               <option value="last30">Last 30 Days</option>
//               <option value="last90">Last 90 Days</option>
//               <option value="lastYear">Last Year</option>
//             </select>
//           </div>
//         </div>

//         {loading ? (
//           <div className="dashboard-loading">Loading audit data...</div>
//         ) : (
//           <>
//             {/* Summary Cards */}
//             <div className="dashboard-summary">
//               <div className="summary-card">
//                 <h3>Total NCs</h3>
//                 <p className="summary-value">{stats.totalNCs}</p>
//               </div>
//               <div className="summary-card">
//                 <h3>Open NCs</h3>
//                 <p className="summary-value">{stats.openNCs}</p>
//               </div>
//               <div className="summary-card">
//                 <h3>Closed NCs</h3>
//                 <p className="summary-value">{stats.closedNCs}</p>
//               </div>
//               <div className="summary-card">
//                 <h3>Closure Rate</h3>
//                 <p className="summary-value">{stats.closureRate}%</p>
//               </div>
//               <div className="summary-card">
//                 <h3>Locations</h3>
//                 <p className="summary-value">{stats.locations}</p>
//               </div>
//             </div>

//             {/* Charts will only render if there's data */}
//             {auditData.length > 0 ? (
//               <>
//                 {/* Location-wise Chart */}
//                 <div className="dashboard-chart">
//                   <h3>NCs by Location</h3>
//                   <div className="chart-container">
//                     <BarChart
//                       width={1100}
//                       height={400}
//                       data={locationData}
//                       margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//                     >
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="name" />
//                       <YAxis />
//                       <Tooltip />
//                       <Legend />
//                       <Bar dataKey="count" fill="#16bd45ff" name="Number of NCs" />
//                     </BarChart>
//                   </div>
//                 </div>
// {/* Combined NC Type and Status Charts */}
// <div className="dashboard-chart combined-charts">
//   <div className="chart-half">
//     <h3>NCs by Type</h3>
//     <div className="chart-container">
//       <PieChart width={400} height={400}>
//         <Pie
//           data={ncTypeData}
//           cx="50%"
//           cy="50%"
//           labelLine={false}
//           outerRadius={80}
//           fill="#8884d8"
//           dataKey="count"
//           nameKey="name"
//           label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//         >
//           {ncTypeData.map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//           ))}
//         </Pie>
//         <Tooltip />
//       </PieChart>
//     </div>
//   </div>

//   <div className="chart-half">
//     <h3>NCs by Status</h3>
//     <div className="chart-container">
//       <PieChart width={400} height={400}>
//         <Pie
//           data={statusData}
//           cx="50%"
//           cy="50%"
//           labelLine={false}
//           outerRadius={80}
//           fill="#0ab6bf91"
//           dataKey="count"
//           nameKey="name"
//           label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//         >
//           {statusData.map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//           ))}
//         </Pie>
//         <Tooltip />
//       </PieChart>
//     </div>
//   </div>
// </div>

//                 {/* Recent NCs Table */}
//                 <div className="dashboard-table">
//                   <h3>Recent Non-Conformities</h3>
//                   <table>
//                     <thead>
//                       <tr>
//                         <th>SN</th>
//                         <th>Location</th>
//                         <th>NC Type</th>
//                         <th>Status</th>
//                         <th>Date</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {auditData.slice(0, 5).map((item, index) => (
//                         <tr key={index}>
//                           <td>{item.SN}</td>
//                           <td>{item.Location}</td>
//                           <td>{item.NCMinI}</td>
//                           <td>
//                             <span className={`status-badge ${item.Status?.toLowerCase()}`}>
//                               {item.Status || 'Open'}
//                             </span>
//                           </td>
//                           <td>{item.UploadDate ? new Date(item.UploadDate).toLocaleDateString() : 'N/A'}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </>
//             ) : (
//               <div className="dashboard-no-data">
//                 <p>No audit data found for the selected criteria.</p>
//                 <button onClick={fetchAuditData} className="refresh-button">
//                   Refresh Data
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import './dashboard.css';
import Header_New from '../components/Header/Header_new';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditType, setAuditType] = useState('internal');
  const [timeRange, setTimeRange] = useState('last30');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchAuditData();
  }, [auditType, timeRange]);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/audits?type=${auditType}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.data || !response.data.data) {
        console.error('No data received from API');
        setAuditData([]);
        setLoading(false);
        return;
      }
      
      let data = response.data.data;
      
      // Filter by time range
      const now = new Date();
      if (timeRange === 'last30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        data = data.filter(item => item.UploadDate && new Date(item.UploadDate) > thirtyDaysAgo);
      } else if (timeRange === 'last90') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        data = data.filter(item => item.UploadDate && new Date(item.UploadDate) > ninetyDaysAgo);
      } else if (timeRange === 'lastYear') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        data = data.filter(item => item.UploadDate && new Date(item.UploadDate) > oneYearAgo);
      }
      
      setAuditData(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching audit data:', error);
      setAuditData([]);
      setLoading(false);
      
      if (error.response) {
        if (error.response.status === 404) {
          alert('API endpoint not found. Please check the server connection.');
        } else if (error.response.status === 401) {
          alert('Session expired. Please log in again.');
        }
      }
    }
  };

  const getLocationData = () => {
    if (!auditData || auditData.length === 0) return [];
    
    const locationMap = {};
    
    auditData.forEach(item => {
      const location = item.Location || 'Unknown';
      locationMap[location] = (locationMap[location] || 0) + 1;
    });
    
    return Object.entries(locationMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const getNCTypeData = () => {
    if (!auditData || auditData.length === 0) return [];
    
    const ncTypeMap = {};
    
    auditData.forEach(item => {
      const ncType = item.NCMinI || 'Unknown';
      ncTypeMap[ncType] = (ncTypeMap[ncType] || 0) + 1;
    });
    
    return Object.entries(ncTypeMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const getStatusData = () => {
    if (!auditData || auditData.length === 0) return [];
    
    const statusMap = {};
    
    auditData.forEach(item => {
      const status = item.Status || 'Open';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    
    return Object.entries(statusMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const getSummaryStats = () => {
    if (!auditData || auditData.length === 0) {
      return {
        totalNCs: 0,
        openNCs: 0,
        closedNCs: 0,
        locations: 0,
        closureRate: 0
      };
    }
    
    const totalNCs = auditData.length;
    const openNCs = auditData.filter(item => item.Status === 'Open').length;
    const closedNCs = auditData.filter(item => item.Status === 'Closed').length;
    const locations = new Set(auditData.map(item => item.Location)).size;
    
    return {
      totalNCs,
      openNCs,
      closedNCs,
      locations,
      closureRate: totalNCs > 0 ? Math.round((closedNCs / totalNCs) * 100) : 0
    };
  };

  const stats = getSummaryStats();
  const locationData = getLocationData();
  const ncTypeData = getNCTypeData();
  const statusData = getStatusData();

  return (
    <>
      <Header_New />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>ISMS AUDIT REPORTS</h2>
          <div className="dashboard-controls">
            <select 
              value={auditType} 
              onChange={(e) => setAuditType(e.target.value)}
              className="dashboard-select"
            >
              <option value="internal">Internal Audits</option>
              <option value="external">External Audits</option>
            </select>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="dashboard-select"
            >
              <option value="all">All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="lastYear">Last Year</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading">Loading audit data...</div>
        ) : (
          <>
            <div className="dashboard-summary">
              <div className="summary-card">
                <h3>Total NCs</h3>
                <p className="summary-value">{stats.totalNCs}</p>
              </div>
              <div className="summary-card">
                <h3>Open NCs</h3>
                <p className="summary-value">{stats.openNCs}</p>
              </div>
              <div className="summary-card">
                <h3>Closed NCs</h3>
                <p className="summary-value">{stats.closedNCs}</p>
              </div>
              <div className="summary-card">
                <h3>Closure Rate</h3>
                <p className="summary-value">{stats.closureRate}%</p>
              </div>
              <div className="summary-card">
                <h3>Locations</h3>
                <p className="summary-value">{stats.locations}</p>
              </div>
            </div>

            {auditData.length > 0 ? (
              <>
                <div className="dashboard-chart">
                  <h3>NCs by Location</h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={locationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#16bd45ff" name="Number of NCs" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="nc-charts-row">
                  <div className="nc-chart-container">
                    <h3>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      NC by Type
                    </h3>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={ncTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {ncTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="nc-chart-container">
                    <h3>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      NC by Status
                    </h3>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#0ab6bf91"
                            dataKey="count"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="dashboard-table">
                  <h3>Recent Non-Conformities</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>SN</th>
                        <th>Location</th>
                        <th>NC Type</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditData.slice(0, 5).map((item, index) => (
                        <tr key={index}>
                          <td>{item.SN}</td>
                          <td>{item.Location}</td>
                          <td>{item.NCMinI}</td>
                          <td>
                            <span className={`status-badge ${item.Status?.toLowerCase()}`}>
                              {item.Status || 'Open'}
                            </span>
                          </td>
                          <td>{item.UploadDate ? new Date(item.UploadDate).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="dashboard-no-data">
                <p>No audit data found for the selected criteria.</p>
                <button onClick={fetchAuditData} className="refresh-button">
                  Refresh Data
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;