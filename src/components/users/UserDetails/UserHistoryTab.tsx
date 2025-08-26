import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  InputAdornment,
} from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { StyledDataGrid, StyledDataGridToolbar } from '../../common';
import { Search as SearchIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { opinionApiService } from '../../../services';

interface UserHistoryRecord {
  id: number;
  typeId: number;
  sourceId: number;
  countryName: string;
  clientIp: string;
  insertDate: string;
}

interface UserHistoryTabProps {
  userId: string;
}

const UserHistoryTab: React.FC<UserHistoryTabProps> = ({ userId }) => {
  const [historyData, setHistoryData] = useState<UserHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    loadUserHistory();
  }, [userId]);

  const loadUserHistory = async () => {
    try {
      setLoading(true);
      const response = await opinionApiService.getUserHistory(parseInt(userId));
      
      if (response.success && response.data?.list) {
        setHistoryData(response.data.list);
      } else {
        setHistoryData([]);
      }
    } catch (error) {
      console.error('Failed to load user history:', error);
      setHistoryData([]);
      toast.error('Failed to load user history');
    } finally {
      setLoading(false);
    }
  };

  const getOperationType = (typeId: number): string => {
    switch (typeId) {
      case 1: return 'Login';
      case 2: return 'Reset password';
      case 3: return 'Register';
      case 4: return 'Change password';
      case 5: return 'Payment';
      case 6: return 'Auto Login';
      default: return `Type ${typeId}`;
    }
  };

  const getSourceName = (sourceId: number): string => {
    switch (sourceId) {
      case 1: return 'Opinion';
      case 3: return 'BackOffice';
      case 5: return 'Api';
      default: return `Source ${sourceId}`;
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const spaceIndex = dateStr.lastIndexOf(' ');
    if (spaceIndex === -1) return dateStr;
    
    const datePart = dateStr.substring(0, spaceIndex);
    const timePart = dateStr.substring(spaceIndex + 1);
    return (
      <>
        {datePart} <strong style={{ fontWeight: 'bold' }}>{timePart}</strong>
      </>
    );
  };

  // Filter data for search
  const filteredData = historyData.filter(record => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      getOperationType(record.typeId).toLowerCase().includes(searchLower) ||
      getSourceName(record.sourceId).toLowerCase().includes(searchLower) ||
      record.countryName?.toLowerCase().includes(searchLower) ||
      record.clientIp?.toLowerCase().includes(searchLower) ||
      record.insertDate?.toLowerCase().includes(searchLower)
    );
  });

  // Column definitions for the data grid
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '#',
      width: 60,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'flex-end', paddingRight: '2px' }}>
          <Typography sx={{ fontSize: '14px' }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'typeId',
      headerName: 'Operation Type',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontSize: '14px' }}>{getOperationType(params.value)}</Typography>
        </Box>
      ),
    },
    {
      field: 'sourceId',
      headerName: 'Source',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontSize: '14px' }}>{getSourceName(params.value)}</Typography>
        </Box>
      ),
    },
    {
      field: 'countryName',
      headerName: 'Country',
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontSize: '14px' }}>{params.value || ''}</Typography>
        </Box>
      ),
    },
    {
      field: 'clientIp',
      headerName: 'IP Address',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontSize: '14px' }}>{params.value || ''}</Typography>
        </Box>
      ),
    },
    {
      field: 'insertDate',
      headerName: 'Create Date',
      width: 160,
      renderCell: (params) => {
        if (!params.value) return null;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box component="span">
              {formatDateTime(params.value)}
            </Box>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      {/* Search Toolbar */}
      <StyledDataGridToolbar>
        <TextField
          size="small"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            minWidth: 250,
            "& .MuiInputBase-root": {
              fontSize: "13px",
            },
          }}
        />
      </StyledDataGridToolbar>

      {/* Data Grid */}
      <Paper sx={{ borderRadius: 0 }}>
        <StyledDataGrid
          rows={filteredData}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
        />
      </Paper>
    </Box>
  );
};

export default UserHistoryTab;
