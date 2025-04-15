import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import BookingForm from './BookingForm';
import { useAuth } from '../context/AuthContext';

const BookRoom = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Book a Room
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Welcome {user?.name}! Please fill in the details below to book a room.
        </Typography>
      </Paper>
      
      <Box sx={{ mt: 3 }}>
        <BookingForm />
      </Box>
    </Container>
  );
};

export default BookRoom;
