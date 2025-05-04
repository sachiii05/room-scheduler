import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

function DashboardOverview() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const bookingsRef = collection(db, 'bookings');
      const allBookings = await getDocs(bookingsRef);
      const pendingQuery = query(bookingsRef, where('status', '==', 'pending'));
      const pendingBookings = await getDocs(pendingQuery);

      setStats({
        totalBookings: allBookings.size,
        pendingRequests: pendingBookings.size
      });
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard Overview</h2>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          minWidth: '200px'
        }}>
          <h3>Total Bookings</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalBookings}</p>
        </div>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          minWidth: '200px'
        }}>
          <h3>Pending Requests</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.pendingRequests}</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
