import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-hot-toast';

import { User } from '../../types';
import { opinionApiService } from '../../services';
import { useSetBreadcrumbs } from '../../contexts/BreadcrumbContext';
import { PageTabs, TabDefinition } from '../../components/common';
import UserDetailsTab from './UserDetailsTab';
import UserMessagesTab from '../../components/users/UserDetails/UserMessagesTab';
import UserRelatedAccountsTab from '../../components/users/UserDetails/UserRelatedAccountsTab';
import UserHistoryTab from '../../components/users/UserDetails/UserHistoryTab';
import UserActivityTab from '../../components/users/UserDetails/UserActivityTab';
import UserPasswordTab from '../../components/users/UserDetails/UserPasswordTab';

const UserDetailsPage: React.FC = () => {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbData } = useSetBreadcrumbs();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading user with ID:', userId, 'parsed as:', parseInt(userId!));
      const response = await opinionApiService.getUser(parseInt(userId!));
      console.log('API response:', response);
      if (response.success) {
        setUser(response.data);
        // Set breadcrumb data when user is loaded - we'll update tab info separately
        setBreadcrumbData({ 
          userName: response.data.displayName || response.data.userName 
        });
      } else {
        throw new Error(response.error?.message || 'Failed to load user');
      }
    } catch (err: any) {
      console.error('Failed to load user:', err);
      setError(err.message || 'Failed to load user details');
      if (err.status === 404) {
        toast.error('User not found');
        navigate('/users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || 'User not found'}
      </Alert>
    );
  }

  // Define tabs configuration
  const tabs: TabDefinition[] = [
    {
      key: 'details',
      label: 'User Details',
      component: <UserDetailsTab user={user} onUserUpdate={handleUserUpdate} />
    },
    {
      key: 'messages',
      label: 'Messages',
      component: <UserMessagesTab userId={userId!} />
    },
    {
      key: 'accounts',
      label: 'Related Accounts',
      component: <UserRelatedAccountsTab userId={userId!} />
    },
    {
      key: 'history',
      label: 'History',
      component: <UserHistoryTab userId={userId!} />
    },
    {
      key: 'password',
      label: 'Password Reset',
      component: <UserPasswordTab user={user} />
    }
  ];

  return (
    <Box className="content-container">
      <PageTabs
        tabs={tabs}
        entityName={user.displayName || user.userName}
        className="content-container"
      />
    </Box>
  );
};

export default UserDetailsPage;
