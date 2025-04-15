import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PendingBookings = ({ onRefresh }) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [notifications, setNotifications] = useState([]);

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookingService.getAllBookings();
      const pendingBookings = response.filter(booking => booking.status === 'pending');
      setBookings(pendingBookings);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      setError('Failed to load pending bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      setActionLoading(prev => ({ ...prev, [bookingId]: true }));
      const booking = bookings.find(b => b._id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      const response = await bookingService.updateBooking(bookingId, {
        status: 'confirmed',
        startTime: booking.startTime,
        endTime: booking.endTime
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to approve booking');
      }
      
      // Add notification for user
      if (booking.user !== user._id) { // Only notify if it's not the admin's own booking
        setNotifications(prev => [
          ...prev,
          {
            id: Date.now(),
            type: 'success',
            message: `Booking ${bookingId} has been approved`,
            bookingId,
            userId: booking.user
          }
        ]);
      }
      
      await fetchPendingBookings();
      onRefresh(); // Refresh parent dashboard
    } catch (error) {
      console.error('Error approving booking:', error);
      setError('Failed to approve booking. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleReject = async (bookingId) => {
    try {
      setActionLoading(prev => ({ ...prev, [bookingId]: true }));
      const booking = bookings.find(b => b._id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      const response = await bookingService.updateBooking(bookingId, {
        status: 'cancelled',
        startTime: booking.startTime,
        endTime: booking.endTime
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to reject booking');
      }
      
      // Add notification for user
      if (booking.user !== user._id) { // Only notify if it's not the admin's own booking
        setNotifications(prev => [
          ...prev,
          {
            id: Date.now(),
            type: 'error',
            message: `Booking ${bookingId} has been rejected`,
            bookingId,
            userId: booking.user
          }
        ]);
      }
      
      await fetchPendingBookings();
      onRefresh(); // Refresh parent dashboard
    } catch (error) {
      console.error('Error rejecting booking:', error);
      setError('Failed to reject booking. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      fetchPendingBookings();
    } else {
      setError(user?.role ? 'Access denied: Admin access required' : 'Not authenticated');
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    // Send notifications to users via WebSocket or other real-time mechanism
    notifications.forEach(notification => {
      // Here you would typically send the notification to the user
      // For now, we'll just log it
      console.log('Sending notification to user:', notification.userId);
    });
  }, [notifications]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pending Bookings
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking.user?.name || 'User'}</TableCell>
                  <TableCell>{booking.room?.name || 'Room'}</TableCell>
                  <TableCell>{new Date(booking.startTime).toLocaleString()}</TableCell>
                  <TableCell>{new Date(booking.endTime).toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleApprove(booking._id)}
                        disabled={actionLoading[booking._id]}
                      >
                        {actionLoading[booking._id] ? <CircularProgress size={20} /> : 'Approve'}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleReject(booking._id)}
                        disabled={actionLoading[booking._id]}
                      >
                        {actionLoading[booking._id] ? <CircularProgress size={20} /> : 'Reject'}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default PendingBookings;
