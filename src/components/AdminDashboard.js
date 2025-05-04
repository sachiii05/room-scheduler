import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import BookingRequests from './BookingRequests';
import RoomManagement from './RoomManagement';
import CreateRoom from './CreateRoom';

function AdminDashboardHome() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBookings: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const roomsSnapshot = await getDocs(collection(db, 'rooms'));
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      
      setStats({
        totalRooms: roomsSnapshot.size,
        totalBookings: bookingsSnapshot.size
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-home">
      <h2>Dashboard Overview</h2>
      <div className="stats-container">
        <div className="stat-box">
          <h3>Available Rooms</h3>
          <div className="stat-number">{stats.totalRooms}</div>
        </div>
        <div className="stat-box">
          <h3>Total Bookings</h3>
          <div className="stat-number">{stats.totalBookings}</div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <Router>
      <div className="admin-layout">
        <div className="sidebar">
          <div className="logo">BSU Room Scheduling</div>
          <nav>
            <ul>
              <li><Link to="/admin">Home</Link></li>
              <li><Link to="/admin/bookings">Booking Requests</Link></li>
              <li><Link to="/admin/rooms">Room Management</Link></li>
              <li><Link to="/admin/create-room">Create Room</Link></li>
            </ul>
          </nav>
        </div>
        <div className="main-content">
          <Switch>
            <Route exact path="/admin" component={AdminDashboardHome} />
            <Route path="/admin/bookings" component={BookingRequests} />
            <Route path="/admin/rooms" component={RoomManagement} />
            <Route path="/admin/create-room" component={CreateRoom} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default AdminDashboard;
