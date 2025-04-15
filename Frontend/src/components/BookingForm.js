import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Grid,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { roomService, bookingService } from '../services/api';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { addHours, isAfter, isBefore, addMinutes } from 'date-fns';

const BookingForm = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [startTime, setStartTime] = useState(addMinutes(new Date(), 30));
  const [endTime, setEndTime] = useState(addHours(addMinutes(new Date(), 30), 1));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      const roomDetails = rooms.find(room => room._id === selectedRoom);
      console.log('Selected room details:', roomDetails);
      console.log('All rooms:', rooms);
      console.log('Selected room ID:', selectedRoom);
    }
  }, [selectedRoom, rooms]);

  const fetchRooms = async () => {
    try {
      console.log('Starting to fetch rooms...');
      setFetchingRooms(true);
      setError('');
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to view rooms');
      }
      
      const roomsData = await roomService.getAllRooms();
      console.log('Raw room response:', roomsData);
      console.log('Room data type:', typeof roomsData);
      console.log('Is array?', Array.isArray(roomsData));
      
      if (roomsData && Array.isArray(roomsData)) {
        console.log('Number of rooms:', roomsData.length);
        console.log('Room details:', roomsData.map(room => ({
          id: room._id,
          name: room.name,
          location: room.location,
          capacity: room.capacity
        })));
        setRooms(roomsData);
      } else {
        console.error('Invalid room data received:', roomsData);
        throw new Error('Failed to load rooms - invalid data format');
      }
    } catch (error) {
      console.error('Get all rooms error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      setError(error.response?.data?.message || error.message || 'Failed to load rooms');
      setRooms([]);
    } finally {
      setFetchingRooms(false);
    }
  };

  const validateBooking = () => {
    if (!selectedRoom) {
      setError('Please select a room');
      return false;
    }

    if (!startTime || !endTime) {
      setError('Please select both start and end times');
      return false;
    }

    const now = new Date();
    if (isBefore(startTime, now)) {
      setError('Start time must be in the future');
      return false;
    }

    if (!isAfter(endTime, startTime)) {
      setError('End time must be after start time');
      return false;
    }

    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // in hours
    if (duration > 4) {
      setError('Booking duration cannot exceed 4 hours');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateBooking()) {
      return;
    }

    try {
      setLoading(true);
      const startISO = startTime.toISOString();
      const endISO = endTime.toISOString();
      console.log('Start time ISO:', startISO);
      console.log('End time ISO:', endISO);

      const bookingData = {
        room: selectedRoom,
        startTime: startISO,
        endTime: endISO,
        status: 'pending'
      };

      console.log('Submitting booking data:', bookingData);
      const response = await bookingService.createBooking(bookingData);
      console.log('Booking response:', response);
      
      setSuccess('Booking request submitted successfully!');
      // Reset form
      setSelectedRoom('');
      setStartTime(addMinutes(new Date(), 30));
      setEndTime(addHours(addMinutes(new Date(), 30), 1));
    } catch (error) {
      console.error('Error creating booking:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data
      });
      setError(error.response?.data?.message || error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingRooms) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Room</InputLabel>
                <Select
                  value={selectedRoom}
                  label="Select Room"
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  required
                >
                  {rooms.length === 0 ? (
                    <MenuItem disabled>No rooms available</MenuItem>
                  ) : (
                    rooms.map((room) => (
                      <MenuItem key={room._id} value={room._id}>
                        {room.name} ({room.location})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Start Time"
                    value={startTime}
                    onChange={(newValue) => {
                      setStartTime(newValue);
                      if (newValue) {
                        setEndTime(addHours(newValue, 1));
                      }
                    }}
                    minDateTime={addMinutes(new Date(), 30)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="End Time"
                    value={endTime}
                    onChange={(newValue) => setEndTime(newValue)}
                    minDateTime={addMinutes(startTime, 30)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Book Room'}
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default BookingForm;