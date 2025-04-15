import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PendingApprovals = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [pendingRooms, setPendingRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({}); // Track loading for individual actions

  useEffect(() => {
    // Only fetch pending rooms if user is logged in and is admin
    if (user?.role === 'admin' && token) {
      fetchPendingRooms();
    } else {
      setError(user?.role ? 'Access denied: Admin access required' : 'Not authenticated');
      setLoading(false);
    }
  }, [user, token]); // Add token to dependencies

  const fetchPendingRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await roomService.getPendingRooms();
      if (response.error) {
        throw new Error(response.error);
      }
      setPendingRooms(response.data || []);
    } catch (error) {
      console.error('Error fetching pending rooms:', error);
      setError('Failed to load pending rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (roomId) => {
    try {
      setActionLoading(prev => ({ ...prev, [roomId]: true }));
      const response = await roomService.approveRoom(roomId);
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchPendingRooms();
    } catch (error) {
      console.error('Error approving room:', error);
      setError('Failed to approve room. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [roomId]: false }));
    }
  };

  const handleReject = async (roomId) => {
    try {
      setActionLoading(prev => ({ ...prev, [roomId]: true }));
      const response = await roomService.rejectRoom(roomId);
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchPendingRooms();
    } catch (error) {
      console.error('Error rejecting room:', error);
      setError('Failed to reject room. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [roomId]: false }));
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
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => {
            setError('');
            if (user?.role === 'admin' && token) {
              fetchPendingRooms();
            }
          }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {pendingRooms.length === 0 ? (
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              No Pending Approvals
            </Typography>
            <Typography color="text.secondary">
              All room requests have been processed.
            </Typography>
          </Paper>
        </Grid>
      ) : (
        pendingRooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room._id}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {room.name}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Location: {room.location}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Capacity: {room.capacity} people
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Created by: {room.createdBy?.name || 'Unknown'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  disabled={actionLoading[room._id]}
                  onClick={() => handleApprove(room._id)}
                >
                  {actionLoading[room._id] ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  disabled={actionLoading[room._id]}
                  onClick={() => handleReject(room._id)}
                >
                  {actionLoading[room._id] ? 'Rejecting...' : 'Reject'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default PendingApprovals;
