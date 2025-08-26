import React from 'react';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';

const StyledDataGridWrapper = styled(DataGrid)(({ theme }) => ({
  border: '1px solid #BBBBBB',
  borderRadius: 0,
  fontSize: '13px',
  
  '& .MuiDataGrid-root': {
    border: 'none',
  },
  
  '& .MuiDataGrid-main': {
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#f4f4f4',
      background: 'linear-gradient(to bottom, #f9f9f9, #f4f4f4)',
      borderBottom: '1px solid #BBBBBB',
      minHeight: '40px !important',
      maxHeight: '40px !important',
      lineHeight: '40px',
    },
    
    '& .MuiDataGrid-columnHeader': {
      borderRight: '1px solid #BBBBBB',
      padding: '8px 11px 8px 8px', // Added 3px extra right padding
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#333',
      textShadow: '0 1px 0 #FFFFFF',
      cursor: 'pointer',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      
      '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#333',
      },
      
      '&:last-child': {
        borderRight: 'none',
      },
      
      '&:hover': {
        backgroundColor: '#E8E8E8 !important',
      },
      
      '&:focus, &:focus-within': {
        outline: 'none',
      },
      
      // Special styling for header checkbox cell
      '&[data-field="select"]': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        
        '& .MuiDataGrid-columnHeaderDraggableContainer': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        },
        
        '& .MuiDataGrid-columnHeaderTitleContainer': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        },
        
        '& .MuiDataGrid-columnHeaderTitleContainerContent': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        },
        
        '& .MuiCheckbox-root': {
          padding: '4px',
        },
      },
    },
    
    '& .MuiDataGrid-row': {
      minHeight: '40px !important',
      maxHeight: '40px !important',
      fontSize: '13px !important',
      
      '&:nth-of-type(even)': {
        backgroundColor: '#FFFFFF !important',
        
        '& .MuiDataGrid-cell::after': {
          background: 'linear-gradient(to right, transparent, #FFFFFF)',
        },
      },
      
      '&:nth-of-type(odd)': {
        backgroundColor: '#F9F9F9 !important',
        
        '& .MuiDataGrid-cell::after': {
          background: 'linear-gradient(to right, transparent, #F9F9F9)',
        },
      },
      
      '&:hover': {
        backgroundColor: 'rgba(50, 78, 141, 0.04) !important',
        
        '& .MuiDataGrid-cell::after': {
          background: 'linear-gradient(to right, transparent, rgba(50, 78, 141, 0.04))',
        },
      },
    },
    
    '& .MuiDataGrid-cell': {
      borderRight: '1px solid #E2E2E2',
      borderBottom: '1px solid #E2E2E2',
      padding: '8px',
      fontSize: '14px',
      color: '#333',
      lineHeight: '24px',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      
      // Fade effect for overflowing text - applies to all text content
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '20px',
        height: '100%',
        background: 'linear-gradient(to right, transparent, var(--cell-bg-color, #FFFFFF))',
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 0.2s ease',
      },
      
      '&:last-child': {
        borderRight: 'none',
      },
      
      '&:focus, &:focus-within': {
        outline: 'none',
      },
      
      // Special styling for checkbox cells
      '&[data-field="select"]': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        
        '& .MuiCheckbox-root': {
          padding: '4px',
        },
      },
    },
  },
  
  '& .MuiDataGrid-footerContainer': {
    backgroundColor: '#F9F9F9 !important',
    borderTop: '1px solid #E2E2E2 !important',
    minHeight: '40px !important',
    borderBottomLeftRadius: '0 !important',
    borderBottomRightRadius: '0 !important',
    
    '& .MuiDataGrid-selectedRowCount': {
      display: 'none !important',
    },
    
    '& .MuiTablePagination-root': {
      fontSize: '13px !important',
      color: '#333',
    },
    
    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
      fontSize: '13px !important',
      color: '#333',
      margin: 0,
    },
    
    // Remove borders from all pagination dropdown containers
    '& .MuiInputBase-root.MuiTablePagination-select': {
      border: 'none !important',
      borderRadius: '4px !important',
      backgroundColor: '#f5f5f5 !important',
      boxShadow: '0 0 0 1px #BBBBBB !important',
      
      '&:hover': {
        backgroundColor: '#FFFFFF !important',
        boxShadow: '0 0 0 1px #999 !important',
      },
      
      '&:focus-within': {
        backgroundColor: '#FFFFFF !important',
        boxShadow: '0 0 0 1px #999 !important',
      },
      
      '&::before, &::after': {
        display: 'none !important',
      },
    },
    
    // Style the inner select element
    '& .MuiSelect-select.MuiTablePagination-select': {
      border: 'none !important',
      borderRadius: '4px !important',
      backgroundColor: 'transparent !important',
      fontSize: '13px !important',
      color: '#333 !important',
      padding: '6px 8px !important',
      paddingRight: '24px !important',
      minHeight: 'auto !important',
      boxSizing: 'border-box !important',
      
      '&:focus': {
        backgroundColor: 'transparent !important',
        outline: 'none !important',
        boxShadow: 'none !important',
      },
    },
    
    // Additional catch-all for any remaining pagination select elements
    '& .MuiTablePagination-select': {
      border: 'none !important',
      outline: 'none !important',
      boxShadow: 'none !important',
      
      '&::before, &::after': {
        display: 'none !important',
      },
    },
    
    '& .MuiIconButton-root': {
      color: '#333',
      fontSize: '13px',
      
      '&.Mui-disabled': {
        color: '#ccc !important',
        backgroundColor: 'transparent',
        cursor: 'not-allowed',
      },
    },
    
    // Target pagination buttons specifically
    '& .MuiTablePagination-actions': {
      '& .MuiIconButton-root': {
        color: '#333',
        
        '&.Mui-disabled': {
          color: '#ccc !important',
          backgroundColor: 'transparent',
          cursor: 'not-allowed',
        },
        
        '&:hover:not(.Mui-disabled)': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
    },
  },
  
  '& .MuiDataGrid-virtualScroller': {
    backgroundColor: 'transparent',
  },
  
  '& .MuiDataGrid-overlay': {
    backgroundColor: 'transparent',
  },
  
  // Ensure header styling overrides
  '& .MuiDataGrid-columnHeaderRow': {
    minHeight: '40px !important',
    maxHeight: '40px !important',
  },
}));

interface StyledDataGridProps extends Omit<DataGridProps, 'sx'> {
  sx?: any; // Allow additional sx overrides if needed
  fadeColumns?: string[]; // Array of column field names that should have fade effect
}

const StyledDataGrid: React.FC<StyledDataGridProps> = ({ sx, fadeColumns = [], ...props }) => {
  // Generate dynamic styles for fade columns
  const fadeColumnStyles = fadeColumns.length > 0 ? {
    '& .MuiDataGrid-cell': {
      ...fadeColumns.reduce((acc, column) => {
        acc[`&[data-field="${column}"]::after`] = {
          opacity: '1 !important',
        };
        return acc;
      }, {} as any)
    }
  } : {};

  const combinedSx = {
    ...fadeColumnStyles,
    ...sx
  };

  return (
    <StyledDataGridWrapper
      rowHeight={40}
      columnHeaderHeight={40}
      sx={combinedSx}
      {...props}
    />
  );
};

export default StyledDataGrid;
