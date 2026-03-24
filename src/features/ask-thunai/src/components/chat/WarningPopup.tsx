import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { AlertTriangle } from 'lucide-react';
const FullscreenWarningPopup = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <Box sx={{
      position: 'fixed', // Use fixed to cover the entire viewport
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Slightly darker overlay
      zIndex: 9999, // Very high z-index to ensure it's above everything
      width: '100vw',
      height: '100vh',
    }}>
      <Paper
        elevation={6} // Higher elevation for more prominence
        sx={{
          width: '90%',
          maxWidth: '450px',
          p: 4,
          borderRadius: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '12px',
          mb: 3
        }}>
          <AlertTriangle 
            size={32} 
            color="#F59E0B" 
          />
          
          <Typography variant="body1" component="h2" sx={{ fontWeight: 600 }}>
                Something went wrong!
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 4, color: '#4B5563' }}>
          {message || "We are encountering an issue with the connection. We will have this resolved and get in touch with you soon."}
        </Typography>
        
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: '#4F46E5',
            '&:hover': {
              backgroundColor: '#4338CA',
            },
            px: 4,
          }}
        >
          OK
        </Button>
      </Paper>
    </Box>
  );
};
const WarningPopup = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <Box sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 100,
     
    }}>
      <Paper
        elevation={3}
        sx={{
          width: '85%',
          maxWidth: '400px',
          p: 3,

          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box sx={{ 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  gap: '10px',
  mb: 2
}}>
  <AlertTriangle 
    size={24} 
    color="#F59E0B" 
  />
  
  <Typography variant="body1" component="h2" sx={{ fontWeight: 600 }}>
    Something went wrong!
  </Typography>
</Box>

        
        <Typography variant="body2" sx={{ mb: 3, color: '#6B7280' }}>
          {message || "We are working on resolving an issue. Be right back soon. Sorry for the inconvenience."}
        </Typography>
        
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: '#4F46E5',
            '&:hover': {
              backgroundColor: '#4338CA',
            },
            px: 4,
          }}
        >
          Reconnect
        </Button>
      </Paper>
    </Box>
  );
};
export { WarningPopup, FullscreenWarningPopup };
export default WarningPopup;
