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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const UserBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookingService.getUserBookings();
      
      // Ensure we have an array of bookings
      const bookings = Array.isArray(response) ? response : [];
      
      // Sort bookings by status (pending first, then confirmed, then cancelled)
      const sortedBookings = bookings.sort((a, b) => {
        const statusOrder = { pending: 0, confirmed: 1, cancelled: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      
      setBookings(sortedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchBookings();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          My Bookings
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Room</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking.room?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    {format(new Date(booking.startTime), 'PPp')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(booking.endTime), 'PPp')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(booking.status)}
                      color={getStatusColor(booking.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setSelectedBooking(booking);
                        setOpenDetails(true);
                      }}
                      color="primary"
                      size="small"
                    >
                      <i className="fas fa-info-circle"></i>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Button
        variant="contained"
        color="primary"
        onClick={handleRefresh}
        sx={{ mt: 2 }}
      >
        Refresh
      </Button>

      <Dialog open={openDetails} onClose={() => setOpenDetails(false)}>
        {selectedBooking && (
          <>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Room: {selectedBooking.room?.name || 'Unknown'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Location:</strong> {selectedBooking.room?.location || 'Unknown'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Start Time:</strong> {format(new Date(selectedBooking.startTime), 'PPp')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>End Time:</strong> {format(new Date(selectedBooking.endTime), 'PPp')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Status:</strong>
                  <Chip
                    label={getStatusLabel(selectedBooking.status)}
                    color={getStatusColor(selectedBooking.status)}
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                {selectedBooking.status === 'confirmed' && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Approved By:</strong> {selectedBooking.approvedBy?.name}
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetails(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default UserBookings;
