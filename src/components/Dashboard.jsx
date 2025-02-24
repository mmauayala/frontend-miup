import React from 'react';
import { logout } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always navigate to login page, even if server logout fails
      navigate('/login');
    }
  };

  return (
    <div className="container dashboard-container">
      <h2>Welcome to the Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;