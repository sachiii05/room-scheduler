import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomService, bookingService } from '../services/api';
import { format } from 'date-fns';
import PendingBookings from './PendingBookings';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [rejectedBookings, setRejectedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [roomsData, bookingsData] = await Promise.all([
        roomService.getAllRooms(),
        user.role === 'admin' 
          ? bookingService.getAllBookings()  // Admin gets all bookings
          : bookingService.getUserBookings(), // Users get their own bookings
      ]);
      
      // Ensure bookingsData is an array
      const bookings = Array.isArray(bookingsData) ? bookingsData : [];
      
      // Filter rooms based on user's role
      const filteredRooms = user?.role === 'admin' 
        ? roomsData 
        : roomsData.filter(room => room.status === 'approved');
      
      // Filter bookings by status for admin view
      const userBookings = bookings.filter(booking => booking.user === user._id);
      const approvedBookings = bookings.filter(booking => booking.status === 'confirmed');
      const rejectedBookings = bookings.filter(booking => booking.status === 'cancelled');
      
      setRooms(filteredRooms);
      setUserBookings(userBookings);
      setApprovedBookings(approvedBookings);
      setRejectedBookings(rejectedBookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.role, user._id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDateTime = (date) => {
    try {
      return format(new Date(date), 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome, {user?.name || 'User'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.role === 'admin' ? 'Manage rooms and approve bookings' : 'Book a room or manage your bookings'}
            </Typography>
          </Paper>
        </Grid>

        {/* Admin Dashboard */}
        {user?.role === 'admin' && (
          <>
            {/* Quick Actions */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/create-room')}  // Navigate to rooms page
                  >
                    Create Room
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/rooms')}  // Navigate to rooms page
                  >
                    Manage Rooms
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Available Rooms */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Available Rooms
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {rooms.slice(0, 3).map((room) => (
                    <Button
                      key={room._id}
                      variant="outlined"
                      onClick={() => 
                        user.role === 'admin' 
                          ? navigate(`/manage-rooms/${room._id}`) 
                          : navigate(`/book-room/${room._id}`)}
                      sx={{ minWidth: '150px' }}
                      disabled={room.status === 'pending'}
                    >
                      {room.name}
                      {room.status === 'pending' && (
                        <Typography variant="caption" color="warning" sx={{ ml: 1 }}>
                          (Pending)
                        </Typography>
                      )}
                    </Button>
                  ))}
                  {rooms.length === 0 && (
                    <Typography color="text.secondary">
                      No rooms available
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Approved Bookings */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Approved Bookings
                </Typography>
                {approvedBookings.length > 0 ? (
                  approvedBookings.slice(0, 5).map((booking) => (
                    <Card key={booking._id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {booking.user?.name || 'User'} - {booking.room?.name || 'Room'}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                          Start: {formatDateTime(booking.startTime)}
                        </Typography>
                        <Typography color="text.secondary">
                          End: {formatDateTime(booking.endTime)}
                        </Typography>
                        <Typography color="success.main">
                          Status: Confirmed
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/bookings/${booking._id}`)}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No approved bookings
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Rejected Bookings */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Rejected Bookings
                </Typography>
                {rejectedBookings.length > 0 ? (
                  rejectedBookings.slice(0, 5).map((booking) => (
                    <Card key={booking._id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {booking.user?.name || 'User'} - {booking.room?.name || 'Room'}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                          Start: {formatDateTime(booking.startTime)}
                        </Typography>
                        <Typography color="text.secondary">
                          End: {formatDateTime(booking.endTime)}
                        </Typography>
                        <Typography color="error">
                          Status: Cancelled
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/bookings/${booking._id}`)}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No rejected bookings
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Pending Bookings */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Pending Bookings
                </Typography>
                <PendingBookings onRefresh={fetchDashboardData} />
              </Paper>
            </Grid>
          </>
        )}

        {/* User Dashboard */}
        {user?.role !== 'admin' && (
          <>
            {/* Quick Actions */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/book-room')}
                  >
                    Book a Room
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/bookings')}
                  >
                    View My Bookings
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Available Rooms */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Available Rooms
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {rooms.slice(0, 3).map((room) => (
                    <Button
                      key={room._id}
                      variant="outlined"
                      onClick={() => navigate(`/book-room/${room._id}`)}
                      sx={{ minWidth: '150px' }}
                      disabled={room.status === 'pending'}
                    >
                      {room.name}
                      {room.status === 'pending' && (
                        <Typography variant="caption" color="warning" sx={{ ml: 1 }}>
                          (Pending)
                        </Typography>
                      )}
                    </Button>
                  ))}
                  {rooms.length === 0 && (
                    <Typography color="text.secondary">
                      No rooms available
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Recent Bookings */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Recent Bookings
                </Typography>
                <Grid container spacing={2}>
                  {userBookings.length > 0 ? (
                    userBookings.slice(0, 3).map((booking) => (
                      <Grid item xs={12} sm={6} md={4} key={booking._id}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {booking.room?.name || 'Room'}
                            </Typography>
                            <Typography color="text.secondary" gutterBottom>
                              Start: {formatDateTime(booking.startTime)}
                            </Typography>
                            <Typography color="text.secondary">
                              End: {formatDateTime(booking.endTime)}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/bookings/${booking._id}`)}
                            >
                              View Details
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography color="text.secondary">
                        You have no bookings yet.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
