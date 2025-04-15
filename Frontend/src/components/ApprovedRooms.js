import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { roomService } from '../services/api';

const ApprovedRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await roomService.getAllRooms();
      const approvedRooms = data.filter(room => room.status === 'approved');
      setRooms(approvedRooms);
    } catch (error) {
      console.error('Error fetching approved rooms:', error);
      setError('Failed to load approved rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Approved Rooms
      </Typography>
      <Grid container spacing={2}>
        {rooms.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary">
              No approved rooms yet
            </Typography>
          </Grid>
        ) : (
          rooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {room.name}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Capacity: {room.capacity}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Location: {room.location}
                  </Typography>
                  {room.description && (
                    <Typography color="text.secondary" paragraph>
                      {room.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {room.amenities?.map((amenity) => (
                      <Chip key={amenity} label={amenity} size="small" />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => {
                      // Add edit functionality if needed
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Paper>
  );
};

export default ApprovedRooms;
