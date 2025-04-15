import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Event as EventIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomService, bookingService } from '../services/api';

const RoomList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editRoom, setEditRoom] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsData, bookingsData] = await Promise.all([
        roomService.getAllRooms(),
        bookingService.getAllBookings()
      ]);
      setRooms(roomsData || []);
      setBookings(bookingsData || []);
    } catch (err) {
      setError('Failed to load rooms');
      console.error('Room loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditRoom(room);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditRoom(null);
    setEditDialogOpen(false);
  };

  const handleEditSave = async () => {
    try {
      await roomService.updateRoom(editRoom._id, editRoom);
      setSuccess('Room updated successfully');
      handleEditClose();
      fetchData();
    } catch (err) {
      setError('Failed to update room');
      console.error('Room update error:', err);
    }
  };

  const handleDelete = async (roomId) => {
    try {
      await roomService.deleteRoom(roomId);
      setSuccess('Room deleted successfully');
      fetchData();
    } catch (err) {
      setError('Failed to delete room');
      console.error('Room deletion error:', err);
    }
  };

  const handleBookRoom = (roomId) => {
    navigate(`/book-room/${roomId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Available Rooms
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      </Box>

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  {room.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Location: {room.location}
                </Typography>
                <Typography variant="body2" component="p">
                  Capacity: {room.capacity} people
                </Typography>
                {room.description && (
                  <Typography variant="body2" color="textSecondary">
                    {room.description}
                  </Typography>
                )}
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={`${bookings.filter(b => b.roomId === room._id).length} Bookings`}
                    size="small"
                    color="primary"
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<EventIcon />}
                  onClick={() => handleBookRoom(room._id)}
                  size="small"
                >
                  Book
                </Button>
                {user?.isAdmin && (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(room)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(room._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={editDialogOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            fullWidth
            value={editRoom?.name || ''}
            onChange={(e) => setEditRoom({ ...editRoom, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Capacity"
            type="number"
            fullWidth
            value={editRoom?.capacity || ''}
            onChange={(e) => setEditRoom({ ...editRoom, capacity: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={editRoom?.location || ''}
            onChange={(e) => setEditRoom({ ...editRoom, location: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editRoom?.description || ''}
            onChange={(e) => setEditRoom({ ...editRoom, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoomList;