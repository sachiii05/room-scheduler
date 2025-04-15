import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../services/api';

const RoomForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    location: '',
    description: '',
    amenities: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenitiesChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData((prev) => ({
      ...prev,
      amenities: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Room name is required');
      return false;
    }
    if (!formData.capacity || formData.capacity < 1) {
      setError('Capacity must be at least 1');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const roomData = {
        name: formData.name,
        location: formData.location,
        capacity: formData.capacity,
        description: formData.description,
        amenities: formData.amenities,
        status: 'pending', // Add pending status
      };

      await roomService.createRoom(roomData);
      setSuccess('Room request submitted successfully!');
      setFormData({
        name: '',
        capacity: '',
        location: '',
        description: '',
        amenities: []
      });
    } catch (error) {
      console.error('Error creating room:', error);
      setError(error.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create New Room
          </Typography>

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
            <TextField
              fullWidth
              label="Room Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Capacity"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ min: 1 }}
            />

            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Amenities</InputLabel>
              <Select
                multiple
                value={formData.amenities}
                onChange={handleAmenitiesChange}
                input={<OutlinedInput label="Amenities" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
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

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Room'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default RoomForm;
