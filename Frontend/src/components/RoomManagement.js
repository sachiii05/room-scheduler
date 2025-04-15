import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { roomService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RoomManagement = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState({ open: false, roomId: null });
  const [roomData, setRoomData] = useState({
    name: '',
    capacity: '',
    location: '',
    description: '',
    amenities: [],
  });

  const amenityOptions = [
    'Projector',
    'Whiteboard',
    'TV Screen',
    'Video Conference',
    'Air Conditioning',
    'Windows',
    'Computer',
    'Internet',
  ];

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchRooms();
    } else {
      setError('Access denied: Admin access required');
      setLoading(false);
    }
  }, [user]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching rooms for admin:', user.email);
      const rooms = await roomService.getAllRooms();
      console.log('Rooms fetched:', rooms);
      setRooms(rooms || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      setError(error.response?.data?.message || error.message || 'Failed to fetch rooms');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (room = null) => {
    if (user?.role !== 'admin') {
      setError('Access denied: Admin access required');
      return;
    }
    
    if (room) {
      console.log('Editing room:', room);
      setEditingRoom(room);
      setRoomData({
        name: room.name,
        capacity: room.capacity,
        location: room.location,
        description: room.description || '',
        amenities: room.amenities || [],
      });
    } else {
      console.log('Creating new room');
      setEditingRoom(null);
      setRoomData({
        name: '',
        capacity: '',
        location: '',
        description: '',
        amenities: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    console.log('Closing dialog');
    setOpen(false);
    setEditingRoom(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? (value === '' ? '' : parseInt(value, 10)) : value,
    }));
  };

  const handleAmenitiesChange = (event) => {
    const { value } = event.target;
    setRoomData(prev => ({
      ...prev,
      amenities: Array.isArray(value) ? value : [],
    }));
  };

  const validateForm = () => {
    if (!roomData.name.trim()) {
      setError('Room name is required');
      return false;
    }
    if (!roomData.capacity || roomData.capacity < 1) {
      setError('Capacity must be at least 1');
      return false;
    }
    if (!roomData.location.trim()) {
      setError('Location is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    setError('');
    setSuccess('');

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    if (user?.role !== 'admin') {
      setError('Access denied: Admin access required');
      console.log('Access denied - not admin');
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting room data:', roomData);

      if (editingRoom) {
        console.log('Updating room:', editingRoom._id);
        const updatedRoom = await roomService.updateRoom(editingRoom._id, roomData);
        console.log('Room updated:', updatedRoom);
        setSuccess('Room updated successfully!');
      } else {
        console.log('Creating new room');
        const newRoom = await roomService.createRoom(roomData);
        console.log('Room created:', newRoom);
        setSuccess('Room created successfully!');
      }
      
      console.log('Operation successful, refreshing rooms');
      await fetchRooms();
      handleClose();
    } catch (error) {
      console.error('Room operation error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      setError(error.response?.data?.message || error.message || 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (roomId) => {
    if (user?.role !== 'admin') {
      setError('Access denied: Admin access required');
      return;
    }
    setDeleteConfirmOpen({ open: true, roomId });
  };

  const handleDeleteConfirm = async () => {
    if (user?.role !== 'admin') {
      setError('Access denied: Admin access required');
      return;
    }

    try {
      setLoading(true);
      await roomService.deleteRoom(deleteConfirmOpen.roomId);
      setSuccess('Room deleted successfully!');
      fetchRooms();
    } catch (error) {
      console.error('Delete room error:', error);
      setError(error.message || 'Failed to delete room');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen({ open: false, roomId: null });
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Paper sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => {
              setError('');
              if (user?.role === 'admin') {
                fetchRooms();
              }
            }}
          >
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Room Management</Typography>
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.preventDefault();
                handleOpen();
              }}
              startIcon={<EditIcon />}
              disabled={loading}
            >
              Create Room
            </Button>
          )}
        </Box>

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

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Active</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amenities</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No rooms available
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <TableRow key={room._id}>
                    <TableCell>
                      <Chip 
                        label={room.isActive ? 'Active' : 'Inactive'}
                        color={room.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{room.name}</TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>{room.location}</TableCell>
                    <TableCell>{room.description || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {room.amenities?.map((amenity) => (
                          <Chip key={amenity} label={amenity} size="small" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user?.role === 'admin' && (
                        <>
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              handleOpen(room);
                            }}
                            color="primary"
                            size="small"
                            disabled={loading}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteClick(room._id);
                            }}
                            color="error"
                            size="small"
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {error && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Room Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingRoom ? 'Edit Room' : 'Add New Room'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Room Name"
                  value={roomData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="capacity"
                  label="Capacity"
                  type="number"
                  value={roomData.capacity}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="location"
                  label="Location"
                  value={roomData.location}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  value={roomData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel>Amenities</InputLabel>
                    <Select
                      multiple
                      value={roomData.amenities || []}
                      onChange={handleAmenitiesChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected || []).map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                    {amenityOptions.map((amenity) => (
                      <MenuItem key={amenity} value={amenity}>
                        {amenity}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                editingRoom ? 'Update Room' : 'Create Room'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen.open}
        onClose={() => setDeleteConfirmOpen({ open: false, roomId: null })}
      >
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this room? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen({ open: false, roomId: null })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoomManagement;
