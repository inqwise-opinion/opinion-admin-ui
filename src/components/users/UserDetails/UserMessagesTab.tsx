import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Paper,
} from '@mui/material';
import { GridColDef, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';
import { StyledDataGrid, StyledDataGridToolbar } from '../../common';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { opinionApiService } from '../../../services';

interface Message {
  id: number;
  name: string; // Subject
  content: string;
  closeDate?: string;
  publishDate?: string;
  excludeDate?: string;
  modifyDate?: string;
}

interface UserMessagesTabProps {
  userId: string;
}

const UserMessagesTab: React.FC<UserMessagesTabProps> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newMessageData, setNewMessageData] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    loadMessages();
  }, [userId, paginationModel, searchQuery]);

  // Reset selection when messages change to prevent stale selection state
  useEffect(() => {
    setSelectedMessageIds([]);
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await opinionApiService.getUserMessages(parseInt(userId), {
        page: paginationModel.page + 1, // API uses 1-based pages
        limit: paginationModel.pageSize,
        search: searchQuery,
      });
      
      if (response.success) {
        // The API returns { list: [] } structure
        setMessages(response.data?.list || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Custom selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMessageIds(messages.map(message => message.id));
    } else {
      setSelectedMessageIds([]);
    }
  };

  const handleSelectMessage = (messageId: number, checked: boolean) => {
    if (checked) {
      setSelectedMessageIds(prev => [...prev, messageId]);
    } else {
      setSelectedMessageIds(prev => prev.filter(id => id !== messageId));
    }
  };

  const renderCheckboxCell = (params: any) => {
    return (
      <Checkbox
        size="small"
        checked={selectedMessageIds.includes(params.row.id)}
        onChange={(e) => handleSelectMessage(params.row.id, e.target.checked)}
      />
    );
  };

  const renderHeaderCheckbox = () => {
    const isIndeterminate = selectedMessageIds.length > 0 && selectedMessageIds.length < messages.length;
    const isChecked = messages.length > 0 && selectedMessageIds.length === messages.length;
    
    return (
      <Checkbox
        size="small"
        checked={isChecked}
        indeterminate={isIndeterminate}
        onChange={(e) => handleSelectAll(e.target.checked)}
      />
    );
  };

  const handleNewMessage = async () => {
    if (!newMessageData.subject.trim() || !newMessageData.message.trim()) {
      toast.error('Subject and message are required');
      return;
    }

    try {
      await opinionApiService.createUserMessage(parseInt(userId), {
        name: newMessageData.subject,
        content: newMessageData.message,
      });
      
      setNewMessageOpen(false);
      setNewMessageData({ subject: '', message: '' });
      loadMessages();
      toast.success('Message created successfully');
    } catch (error) {
      toast.error('Failed to create message');
    }
  };

  const handleDeleteMessages = async () => {
    try {
      await opinionApiService.deleteUserMessages(parseInt(userId), selectedMessageIds);
      setDeleteDialogOpen(false);
      setSelectedMessageIds([]);
      loadMessages();
      toast.success('Messages deleted successfully');
    } catch (error) {
      toast.error('Failed to delete messages');
    }
  };

  const handlePublishMessage = async () => {
    if (selectedMessageIds.length !== 1) return;
    
    try {
      await opinionApiService.publishUserMessage(parseInt(userId), selectedMessageIds[0]);
      setSelectedMessageIds([]);
      loadMessages();
      toast.success('Message published successfully');
    } catch (error) {
      toast.error('Failed to publish message');
    }
  };

  const renderDateTimeCell = (params: any) => {
    if (!params.value) return '';
    const date = new Date(params.value);
    const datePart = date.toLocaleDateString();
    const timePart = date.toLocaleTimeString();
    return (
      <>
        {datePart} <strong style={{ fontWeight: 'bold', color: '#999' }}>{timePart}</strong>
      </>
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'select',
      headerName: '',
      width: 50,
      sortable: false,
      disableColumnMenu: true,
      renderCell: renderCheckboxCell,
      renderHeader: renderHeaderCheckbox,
    },
    {
      field: 'id',
      headerName: '#',
      width: 60,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'name',
      headerName: 'Subject',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={params.value}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'content',
      headerName: 'Message',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={params.value}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'closeDate',
      headerName: 'Close Date',
      width: 140,
      renderCell: renderDateTimeCell,
    },
    {
      field: 'publishDate',
      headerName: 'Publish Date',
      width: 140,
      renderCell: renderDateTimeCell,
    },
    {
      field: 'excludeDate',
      headerName: 'Exclude Date',
      width: 140,
      renderCell: renderDateTimeCell,
    },
  ];

  return (
    <Box>
      {/* Action Toolbar */}
      <StyledDataGridToolbar>
        <Button
          variant="contained"
          color="success"
          className="btn-add"
          size="medium"
          startIcon={<AddIcon />}
          onClick={() => setNewMessageOpen(true)}
        >
          New Message
        </Button>
        
        <Button
          variant="outlined"
          size="medium"
          startIcon={<DeleteIcon />}
          disabled={selectedMessageIds.length === 0}
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ 
            textTransform: 'none',
            fontSize: '14px',
            padding: '8px 16px',
            minHeight: '36px',
          }}
        >
          Delete
        </Button>
        
        <Button
          variant="outlined"
          size="medium"
          startIcon={<PublishIcon />}
          disabled={selectedMessageIds.length !== 1}
          onClick={handlePublishMessage}
          sx={{ 
            textTransform: 'none',
            fontSize: '14px',
            padding: '8px 16px',
            minHeight: '36px',
          }}
        >
          Publish
        </Button>
      </StyledDataGridToolbar>

      {/* Data Grid */}
      <Paper sx={{ borderRadius: 0 }}>
        <StyledDataGrid
          key={`messages-grid-${messages.length}`}
          rows={messages}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          loading={loading}
          pageSizeOptions={[5, 10, 25, 50, 100]}
        />
      </Paper>

      {/* New Message Dialog */}
      <Dialog open={newMessageOpen} onClose={() => setNewMessageOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Message</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Subject:</Typography>
            <TextField
              fullWidth
              value={newMessageData.subject}
              onChange={(e) => setNewMessageData({ ...newMessageData, subject: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body2" sx={{ mb: 1 }}>Message:</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Write a message..."
              value={newMessageData.message}
              onChange={(e) => setNewMessageData({ ...newMessageData, message: e.target.value })}
              sx={{ mb: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button
            onClick={handleNewMessage}
            variant="contained"
            className="btn-action"
            size="medium"
          >
            Create
          </Button>
          <Button 
            onClick={() => {
              setNewMessageOpen(false);
              setNewMessageData({ subject: '', message: '' });
            }}
            variant="outlined"
            className="btn-cancel"
            size="medium"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Deleting messages</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete selected messages?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button
            onClick={handleDeleteMessages}
            variant="contained"
            className="btn-action"
            size="medium"
          >
            Delete
          </Button>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            className="btn-cancel"
            size="medium"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserMessagesTab;
