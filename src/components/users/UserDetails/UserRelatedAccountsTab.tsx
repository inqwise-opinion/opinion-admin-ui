import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Link,
  Collapse,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid, StyledDataGridToolbar } from '../../common';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as AttachIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { opinionApiService } from '../../../services';
import { useNavigate } from 'react-router-dom';

interface RelatedAccount {
  accountId: number;
  accountName: string;
  servicePackageName: string;
  isActive: boolean;
  insertDate: string;
  ownerId?: number;
}

interface UserRelatedAccountsTabProps {
  userId: string;
}

const UserRelatedAccountsTab: React.FC<UserRelatedAccountsTabProps> = ({ userId }) => {
  const navigate = useNavigate();
  
  // State for owned accounts (left side)
  const [ownedAccounts, setOwnedAccounts] = useState<RelatedAccount[]>([]);
  const [ownedAccountsLoading, setOwnedAccountsLoading] = useState(true);
  
  // State for attached accounts (right side)
  const [attachedAccounts, setAttachedAccounts] = useState<RelatedAccount[]>([]);
  const [attachedAccountsLoading, setAttachedAccountsLoading] = useState(true);
  const [selectedAttachedAccounts, setSelectedAttachedAccounts] = useState<number[]>([]);

  // Dialog states
  const [newAccountVisible, setNewAccountVisible] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [attachAccountId, setAttachAccountId] = useState('');
  const [attachDropdownOpen, setAttachDropdownOpen] = useState(false);
  const [detachDialogOpen, setDetachDialogOpen] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [userId]);

  const loadAccounts = async () => {
    try {
      setOwnedAccountsLoading(true);
      setAttachedAccountsLoading(true);
      
      const response = await opinionApiService.getUserAccounts(parseInt(userId));
      
      if (response.success && response.data?.list) {
        const accounts = response.data.list;
        const owned = accounts.filter(acc => acc.ownerId === parseInt(userId));
        const attached = accounts.filter(acc => acc.ownerId !== parseInt(userId));
        
        setOwnedAccounts(owned);
        setAttachedAccounts(attached);
      } else {
        setOwnedAccounts([]);
        setAttachedAccounts([]);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
      setOwnedAccounts([]);
      setAttachedAccounts([]);
    } finally {
      setOwnedAccountsLoading(false);
      setAttachedAccountsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) {
      toast.error('Account name is required');
      return;
    }

    try {
      await opinionApiService.createUserAccount(parseInt(userId), {
        productId: 1,
        accountName: newAccountName.trim(),
      });
      
      setNewAccountVisible(false);
      setNewAccountName('');
      loadAccounts();
      toast.success('Account created successfully');
    } catch (error) {
      toast.error('Failed to create account');
    }
  };

  const handleAttachAccount = async () => {
    const accountId = parseInt(attachAccountId);
    if (!accountId || isNaN(accountId)) {
      toast.error('Please enter a valid account ID');
      return;
    }

    try {
      await opinionApiService.attachUserAccount(parseInt(userId), accountId);
      setAttachDropdownOpen(false);
      setAttachAccountId('');
      loadAccounts();
      toast.success('Account attached successfully');
    } catch (error) {
      toast.error('Failed to attach account');
    }
  };

  const handleDetachAccount = async () => {
    if (selectedAttachedAccounts.length === 0) return;
    
    try {
      await opinionApiService.detachUserAccount(parseInt(userId), selectedAttachedAccounts[0]);
      setDetachDialogOpen(false);
      setSelectedAttachedAccounts([]);
      loadAccounts();
      toast.success('Account detached successfully');
    } catch (error) {
      toast.error('Failed to detach account');
    }
  };

  const handleAttachedAccountSelect = (accountId: number, checked: boolean) => {
    if (checked) {
      setSelectedAttachedAccounts([accountId]); // Only allow single selection
    } else {
      setSelectedAttachedAccounts([]);
    }
  };

  const handleSelectAllAttachedAccounts = (checked: boolean) => {
    if (checked && attachedAccounts.length > 0) {
      setSelectedAttachedAccounts([attachedAccounts[0].accountId]); // Only select first one
    } else {
      setSelectedAttachedAccounts([]);
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString();
    const timePart = date.toLocaleTimeString();
    return (
      <>
        {datePart}<strong style={{ fontWeight: 'bold' }}> {timePart}</strong>
      </>
    );
  };

  const getAccountUrl = (accountId: number) => {
    return `/accounts/${accountId}`;
  };

  // Column definitions for owned accounts
  const ownedAccountsColumns: GridColDef[] = [
    {
      field: 'accountId',
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
      field: 'accountName',
      headerName: 'Account',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => navigate(`/accounts/${params.row.accountId}`)}
          title={params.value || ""}
          sx={{
            color: "#324E8D",
            textDecoration: "none",
            width: '100%',
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            "&:hover": {
              textDecoration: "underline",
              color: "#f7931e",
            },
          }}
        >
          {params.value || ""}
        </Link>
      ),
    },
    {
      field: 'servicePackageName',
      headerName: 'Plan',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontSize: '14px' }}>{params.value || ""}</Typography>
        </Box>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 80,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontSize: '14px' }}>{params.value ? 'Enabled' : 'Disabled'}</Typography>
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

  // Selection handlers for attached accounts
  const renderAttachedCheckboxCell = (params: any) => {
    return (
      <Checkbox
        size="small"
        checked={selectedAttachedAccounts.includes(params.row.accountId)}
        onChange={(e) => handleAttachedAccountSelect(params.row.accountId, e.target.checked)}
      />
    );
  };

  const renderAttachedHeaderCheckbox = () => {
    const isIndeterminate = selectedAttachedAccounts.length > 0 && selectedAttachedAccounts.length < attachedAccounts.length;
    const isChecked = attachedAccounts.length > 0 && selectedAttachedAccounts.length === attachedAccounts.length;
    
    return (
      <Checkbox
        size="small"
        checked={isChecked}
        indeterminate={isIndeterminate}
        onChange={(e) => handleSelectAllAttachedAccounts(e.target.checked)}
        disabled={attachedAccounts.length === 0}
      />
    );
  };

  // Column definitions for attached accounts
  const attachedAccountsColumns: GridColDef[] = [
    {
      field: 'select',
      headerName: '',
      width: 50,
      sortable: false,
      disableColumnMenu: true,
      renderCell: renderAttachedCheckboxCell,
      renderHeader: renderAttachedHeaderCheckbox,
    },
    {
      field: 'accountId',
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
      field: 'accountName',
      headerName: 'Account',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => navigate(`/accounts/${params.row.accountId}`)}
          title={params.value || ""}
          sx={{
            color: "#324E8D",
            textDecoration: "none",
            width: '100%',
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            "&:hover": {
              textDecoration: "underline",
              color: "#f7931e",
            },
          }}
        >
          {params.value || ""}
        </Link>
      ),
    },
    {
      field: 'servicePackageName',
      headerName: 'Plan',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontSize: '14px' }}>{params.value || ""}</Typography>
        </Box>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 80,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontSize: '14px' }}>{params.value ? 'Enabled' : 'Disabled'}</Typography>
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
    <Box sx={{ display: 'flex', gap: 1 }}>
      {/* Left Side - Owned Accounts */}
      <Box sx={{ width: '50%', pr: 0.5 }}>
        <Typography variant="h6" className="ui-header-light" sx={{ mb: 2, color: '#666', fontWeight: 300 }}>
          Owned by User
        </Typography>

        {/* New Account Form */}
        <Collapse in={newAccountVisible}>
          <Box
            sx={{
              backgroundColor: '#FFF9D7',
              border: '1px solid #E2C822',
              p: 1.5,
              mb: 1.5,
              borderRadius: 1,
            }}
          >
            <Typography variant="h6" sx={{ mb: 1.5 }}>New Account</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: '130px', fontWeight: 'bold' }}>* Account Name:</Box>
              <TextField
                size="small"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="Enter account name"
                inputProps={{ maxLength: 32 }}
                sx={{ width: 240 }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: '130px' }}></Box>
              <Button
                variant="contained"
                onClick={handleCreateAccount}
                className="btn-action"
                sx={{
                  backgroundColor: '#4A90E2',
                  '&:hover': { backgroundColor: '#357ABD' },
                  textTransform: 'none',
                }}
              >
                Create
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setNewAccountVisible(false);
                  setNewAccountName('');
                }}
                className="btn-cancel"
                size="medium"
                sx={{ textTransform: 'none', ml: 1 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Collapse>

        {/* Owned Accounts Toolbar */}
        <StyledDataGridToolbar>
          <Button
            variant="contained"
            color="success"
            size="medium"
            startIcon={<AddIcon />}
            onClick={() => setNewAccountVisible(true)}
            sx={{ 
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#45a049' },
              textTransform: 'none',
              fontSize: '14px',
              padding: '8px 16px',
              minHeight: '36px',
            }}
          >
            New Account
          </Button>
        </StyledDataGridToolbar>

        {/* Owned Accounts Data Grid */}
        <Paper sx={{ borderRadius: 0 }}>
          <StyledDataGrid
            rows={ownedAccounts}
            columns={ownedAccountsColumns}
            loading={ownedAccountsLoading}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            disableRowSelectionOnClick
            getRowId={(row) => row.accountId}
            fadeColumns={['accountName']} // Enable fade for Account Name column
          />
        </Paper>
      </Box>

      {/* Right Side - Attached/Shared Accounts */}
      <Box sx={{ width: '50%', pl: 0.5 }}>
        <Typography variant="h6" className="ui-header-light" sx={{ mb: 2, color: '#666', fontWeight: 300 }}>
          Attached / Shared Accounts
        </Typography>

        {/* Attached Accounts Toolbar */}
        <StyledDataGridToolbar>
          <Box sx={{ position: 'relative' }}>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<AttachIcon />}
              endIcon={<ExpandMoreIcon />}
              onClick={() => setAttachDropdownOpen(!attachDropdownOpen)}
              className="btn-add"
              sx={{ 
                textTransform: 'none',
                fontSize: '14px',
                padding: '8px 16px',
                minHeight: '36px',
              }}
            >
              Attach Account
            </Button>
            
            {/* Dropdown */}
            <Collapse in={attachDropdownOpen}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  zIndex: 1000,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  p: 1.5,
                  minWidth: 200,
                  boxShadow: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2">Account #:</Typography>
                  <TextField
                    size="small"
                    value={attachAccountId}
                    onChange={(e) => setAttachAccountId(e.target.value)}
                    sx={{ width: 80 }}
                  />
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAttachAccount}
                  className="btn-action"
                  sx={{
                    backgroundColor: '#4A90E2',
                    '&:hover': { backgroundColor: '#357ABD' },
                    textTransform: 'none',
                  }}
                >
                  Attach
                </Button>
              </Box>
            </Collapse>
          </Box>

          <Button
            variant="outlined"
            size="medium"
            startIcon={<DeleteIcon />}
            disabled={selectedAttachedAccounts.length === 0}
            onClick={() => setDetachDialogOpen(true)}
            sx={{ 
              textTransform: 'none',
              fontSize: '14px',
              padding: '8px 16px',
              minHeight: '36px',
            }}
          >
            Detach Account
          </Button>
        </StyledDataGridToolbar>

        {/* Attached Accounts Data Grid */}
        <Paper sx={{ borderRadius: 0 }}>
          <StyledDataGrid
            rows={attachedAccounts}
            columns={attachedAccountsColumns}
            loading={attachedAccountsLoading}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            disableRowSelectionOnClick
            getRowId={(row) => row.accountId}
            fadeColumns={['accountName']} // Enable fade for Account Name column
          />
        </Paper>
      </Box>

      {/* Detach Confirmation Dialog */}
      <Dialog open={detachDialogOpen} onClose={() => setDetachDialogOpen(false)}>
        <DialogTitle>Detach account</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to detach selected account?</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDetachAccount}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Detach
          </Button>
          <Button 
            onClick={() => setDetachDialogOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserRelatedAccountsTab;
