class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
  }

  getAuthHeaders() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async login(username, password) {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error(await response.text() || 'Login failed');
    }
    
    const userData = await response.json();
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }

  async getAllUsers() {
    const response = await fetch(`${this.baseUrl}/users`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return await response.json();
  }

    async createUser(userData) {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(await response.text() || 'Failed to create user');
    }
    
    return await response.json();
  }

  async getAuditData(auditType) {
  const response = await fetch(`${this.baseUrl}/audits?type=${auditType}`);
  if (!response.ok) {
    throw new Error('Failed to fetch audit data');
  }
  const result = await response.json();
  
  // Ensure we always return an array, even if the structure is different
  if (Array.isArray(result)) {
    return result;
  } else if (result.data && Array.isArray(result.data)) {
    return result.data;
  } else {
    return []; // Return empty array if no valid data found
  }
}

  async uploadAuditFile(formData, auditType) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;

  try {
    const response = await fetch(`${this.baseUrl}/audits/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - let the browser set it with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Upload failed');
    }

    return await response.json();
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  }
}

  async updateUser(userId, userData) {
  const response = await fetch(`${this.baseUrl}/users/${userId}`, {
    method: 'PUT',
    headers: this.getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error(await response.text() || 'Failed to update user');
  }
  
  return await response.json();
}

async deleteUser(userId) {
  const response = await fetch(`${this.baseUrl}/users/${userId}`, {
    method: 'DELETE',
    headers: this.getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error(await response.text() || 'Failed to delete user');
  }
  
  return await response.json();
}

  async updateAuditRecord(auditType, record) {
  const response = await fetch(`${this.baseUrl}/audits/update`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}`
    },
    body: JSON.stringify({ 
      type: auditType,  // Changed from auditType to type to match backend expectation
      record: {
        ...record,
        // Ensure date fields are properly formatted
        DateOfAudit: record.DateOfAudit || null,
        ClosingDates: record.ClosingDates || null
      }
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to update record');
  }
  
  return await response.json();
}

  async uploadEvidence(formData) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;
  
  try {
    const response = await fetch(`${this.baseUrl}/audits/upload-evidence`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Evidence upload failed');
    }

    return await response.json();
  } catch (err) {
    console.error('Evidence upload error:', err);
    throw err;
  }
}

  async checkLastUploadDate(auditType) {
    const response = await fetch(`${this.baseUrl}/audits/last-upload?type=${auditType}`);
    if (!response.ok) {
      throw new Error('Failed to check last upload date');
    }
    return await response.json();
  }
}

export default new ApiService();