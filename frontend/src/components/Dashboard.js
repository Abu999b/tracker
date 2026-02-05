// ============================================
// DASHBOARD COMPONENT
// ============================================

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import API from '../api';
import './Dashboard.css';

function Dashboard() {
  // State management
  const [progressList, setProgressList] = useState([]);
  const [platform, setPlatform] = useState('');
  const [solved, setSolved] = useState('');
  const [total, setTotal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch progress on component mount
  useEffect(() => {
    fetchProgress();
  }, []);

  // Fetch all progress from backend
  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await API.get('/progress');
      setProgressList(response.data);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  // Add or update progress
  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await API.post('/progress', {
        platform: platform.trim(),
        problemsSolved: Number(solved),
        totalProblems: Number(total)
      });
      
      // Clear form
      setPlatform('');
      setSolved('');
      setTotal('');
      
      // Refresh progress list
      fetchProgress();
    } catch (err) {
      console.error('Error adding progress:', err);
      setError(err.response?.data?.message || 'Failed to add progress');
    }
  };

  // Delete progress entry
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }
    
    try {
      await API.delete(`/progress/${id}`);
      fetchProgress();
    } catch (err) {
      console.error('Error deleting progress:', err);
      setError('Failed to delete progress');
    }
  };

  // Logout and redirect to login
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate completion percentage
  const calculatePercentage = (solved, total) => {
    return total > 0 ? ((solved / total) * 100).toFixed(1) : 0;
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <h1>🚀 Coding Progress Tracker</h1>
        <div className="user-info">
          <span>Welcome, <strong>{user?.username}</strong>!</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-banner">{error}</div>}

      {/* Add/Update Form */}
      <div className="add-form">
        <h2>📝 Add/Update Progress</h2>
        <form onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Platform (e.g., LeetCode, HackerRank)"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Problems Solved"
            value={solved}
            onChange={(e) => setSolved(e.target.value)}
            required
            min="0"
          />
          <input
            type="number"
            placeholder="Total Problems"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            required
            min="0"
          />
          <button type="submit">Add Progress</button>
        </form>
      </div>

      {/* Progress List */}
      <div className="progress-list">
        <h2>📊 Your Progress</h2>
        
        {loading ? (
          <p className="loading">Loading...</p>
        ) : progressList.length === 0 ? (
          <div className="no-data">
            <p>No progress tracked yet.</p>
            <p>Start by adding your first entry above! 👆</p>
          </div>
        ) : (
          <div className="cards">
            {progressList.map((item) => (
              <div key={item._id} className="card">
                <h3>{item.platform}</h3>
                <div className="stats">
                  <p className="numbers">
                    <strong>{item.problemsSolved}</strong> / {item.totalProblems} solved
                  </p>
                  
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${calculatePercentage(item.problemsSolved, item.totalProblems)}%` 
                      }}
                    ></div>
                  </div>
                  
                  <p className="percentage">
                    {calculatePercentage(item.problemsSolved, item.totalProblems)}% Complete
                  </p>
                  
                  <p className="last-updated">
                    Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleDelete(item._id)} 
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;