import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Link,
  Button,
  InputAdornment,
  TextField,
} from '@mui/material';
import {
  GridColDef,
  GridRowParams,
  GridActionsCellItem,
  GridPaginationModel
} from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { StyledDataGrid, StyledDataGridToolbar } from '../../components/common';

interface Job {
  id: number;
  assemblyName: string;
  description: string;
  lastExecDate?: string;
  plannedExecDate?: string;
  scheduleTask: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
}

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  // Set document title
  useEffect(() => {
    document.title = 'Jobs - Opinion Admin Dashboard';
    
    return () => {
      document.title = 'Opinion Admin Dashboard';
    };
  }, []);

  // Mock job data for demonstration - matching original table structure
  useEffect(() => {
    // You can toggle between empty state and sample data
    const sampleJobs: Job[] = [
      {
        id: 1,
        assemblyName: 'DataCleanupTask.exe',
        description: 'Cleans up expired survey responses and temporary data files',
        lastExecDate: '2025-08-26T02:30:00Z',
        plannedExecDate: '2025-08-27T02:30:00Z',
        scheduleTask: 'Daily at 02:30',
        status: 'completed'
      },
      {
        id: 2,
        assemblyName: 'EmailNotificationService.exe',
        description: 'Sends scheduled email notifications and reminders to users',
        lastExecDate: '2025-08-26T05:00:00Z',
        plannedExecDate: '2025-08-26T06:00:00Z',
        scheduleTask: 'Hourly',
        status: 'running'
      },
      {
        id: 3,
        assemblyName: 'ReportGenerator.exe',
        description: 'Generates daily analytics and summary reports for administrators',
        lastExecDate: '2025-08-25T23:59:59Z',
        plannedExecDate: '',
        scheduleTask: 'Manual',
        status: 'paused'
      },
      {
        id: 4,
        assemblyName: 'DatabaseBackup.exe',
        description: 'Performs automated database backups and integrity checks',
        lastExecDate: '2025-08-26T03:15:00Z',
        plannedExecDate: '2025-08-26T07:15:00Z',
        scheduleTask: 'Every 4 hours',
        status: 'failed'
      }
    ];
    
    // Simulate loading delay
    setLoading(true);
    setTimeout(() => {
      // Comment out the line below to show empty state like the original
      setJobs(sampleJobs);
      // setJobs([]); // Uncomment this to show "No records found"
      setLoading(false);
    }, 500);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'running':
        return <Chip label="Running" size="small" color="success" />;
      case 'paused':
        return <Chip label="Paused" size="small" color="warning" />;
      case 'completed':
        return <Chip label="Completed" size="small" color="info" />;
      case 'failed':
        return <Chip label="Failed" size="small" color="error" />;
      default:
        return <Chip label="Unknown" size="small" color="default" />;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return dateStr;
    }
  };

  // Column definitions matching the original table structure
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '#',
      width: 46,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
          <Typography sx={{ fontSize: '14px' }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'assemblyName',
      headerName: 'Assembly Name',
      width: 340,
      flex: 0,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => console.log('View job:', params.row.id)}
          sx={{
            color: '#324E8D',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
              color: '#f7931e',
            },
          }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: 'lastExecDate',
      headerName: 'Last Exec. Date',
      width: 126,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: 'plannedExecDate',
      headerName: 'Planned Exec. Date',
      width: 126,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: 'scheduleTask',
      headerName: 'Schedule Task',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 60,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      type: 'actions',
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="view"
          icon={<ViewIcon />}
          label="View Details"
          onClick={() => console.log('View job details:', params.row.id)}
        />,
      ],
    },
  ];

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job =>
    job.assemblyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.scheduleTask.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className="content-container">
      {/* Toolbar */}
      <StyledDataGridToolbar>
        <TextField
          size="small"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        <Button
          variant="contained"
          startIcon={<PlayIcon />}
          disabled={loading}
        >
          Run Selected
        </Button>
      </StyledDataGridToolbar>

      {/* Jobs DataGrid */}
      <StyledDataGrid
        rows={filteredJobs}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[10, 25, 50, 100]}
        checkboxSelection
        disableSelectionOnClick
        autoHeight
        // Show "No records found" when empty (matching original)
        localeText={{
          noRowsLabel: 'No records found.'
        }}
        sx={{
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(50, 78, 141, 0.04)',
          },
        }}
      />
    </Box>
  );
};

export default JobsPage;
