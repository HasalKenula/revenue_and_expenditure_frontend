import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const SimpleBudgetUI = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [totalBudget, setTotalBudget] = useState(0);

  // Fetch all budget records
  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/budget/records`);
      if (response.data.success) {
        setBudgets(response.data.data);
        setTotalBudget(response.data.total_budget || 0);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
      alert('Failed to fetch budget data');
    } finally {
      setLoading(false);
    }
  };

  // Upload Excel file
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/budget/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert(`Success! Imported ${response.data.imported_count} records`);
        setSelectedFile(null);
        // Clear file input
        document.getElementById('fileInput').value = '';
        // Refresh the table
        fetchBudgets();
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Upload failed: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchBudgets();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Budget Management System</h1>

      {/* Upload Section */}
      <div style={{
        background: '#f0f9ff',
        border: '2px dashed #3b82f6',
        borderRadius: '10px',
        padding: '30px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '10px' }}>📊 Upload Budget Excel File</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>Support .xlsx, .xls, .csv files up to 50MB</p>
        
        <input
          type="file"
          id="fileInput"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          style={{ marginBottom: '15px' }}
        />
        <br />
        
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 30px',
            borderRadius: '5px',
            cursor: !selectedFile || uploading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Excel File'}
        </button>
        
        {selectedFile && (
          <p style={{ marginTop: '10px', color: '#10b981', fontSize: '14px' }}>
            Selected: {selectedFile.name}
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>Total Budget</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>Total Records</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{budgets.length}</p>
        </div>
      </div>

      {/* Table Section */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '15px 20px',
          background: '#f8f9fa',
          borderBottom: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: 0 }}>📋 Budget Records</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Head</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Program</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Project</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Object Name</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>
                    Loading...
                  </td>
                </tr>
              ) : budgets.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    No data found. Please upload an Excel file.
                  </td>
                </tr>
              ) : (
                budgets.map((budget) => (
                  <tr key={budget.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{budget.id}</td>
                    <td style={{ padding: '12px' }}>{budget.head || '-'}</td>
                    <td style={{ padding: '12px' }}>{budget.program || '-'}</td>
                    <td style={{ padding: '12px' }}>{budget.project || '-'}</td>
                    <td style={{ padding: '12px' }}>{budget.objname || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      ${parseFloat(budget.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refresh Button */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={fetchBudgets}
          disabled={loading}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default SimpleBudgetUI;