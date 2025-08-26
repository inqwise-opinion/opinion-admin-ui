import React from 'react';
import { Box, Paper } from '@mui/material';

interface StyledDataGridToolbarProps {
  children?: React.ReactNode;
  sx?: any; // Allow additional styling overrides
}

const StyledDataGridToolbar: React.FC<StyledDataGridToolbarProps> = ({ 
  children, 
  sx 
}) => {
  return (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 2, // Add margin bottom for proper spacing
        borderRadius: 0,
        border: '1px solid #BBBBBB',
        backgroundColor: '#f9f9f9',
        ...sx 
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        alignItems: 'center', 
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        {children}
      </Box>
    </Paper>
  );
};

export default StyledDataGridToolbar;
