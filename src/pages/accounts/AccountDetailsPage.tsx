import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  Chip,
  Link,
  Divider,
  List,
  ListItem,
  InputAdornment,
} from '@mui/material';
import {
  GridColDef,
  GridRowParams,
  GridActionsCellItem,
  GridPaginationModel
} from '@mui/x-data-grid';
import { Account, ApiResponse, User } from '../../types';
import { opinionApiService as apiService } from '../../services';
import { Search as SearchIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { StyledDataGrid, StyledDataGridToolbar, PageTabs } from '../../components/common';
import { TabDefinition } from '../../components/common/PageTabs';
import SurveysTab from '../../components/SurveysTab';
import CollectorsTab from '../../components/CollectorsTab';
import BillingTab from '../../components/accounts/BillingTab';
import TransactionHistoryTab from '../../components/accounts/TransactionHistoryTab';
import MakePaymentTab from '../../components/accounts/MakePaymentTab';
import ChargesTab from '../../components/accounts/ChargesTab';
import RecurringTab from '../../components/accounts/RecurringTab';
import UnInvoicedListTab from '../../components/accounts/UnInvoicedListTab';
import InvoicesTab from '../../components/accounts/InvoicesTab';


const AccountDetailsPage: React.FC = () => {
  const { id: accountId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [timezones, setTimezones] = useState<any[]>([]);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    accountName: '',
    ownerId: '' as string | number,
    packageId: '' as string | number,
    timezoneId: '' as string | number,
    isActive: true,
    permissions: [] as string[],
    inheritPermissions: false,
  });


  useEffect(() => {
    console.log('AccountDetailsPage useEffect - accountId:', accountId);
    if (accountId) {
      loadAllData();
    }
  }, [accountId]);

  const loadAllData = async () => {
    console.log('=== LOAD ALL DATA START ===');
    console.log('accountId:', accountId, 'type:', typeof accountId);
    
    try {
      console.log('Setting loading to true');
      setLoading(true);
      setError(null);
      
      console.log('About to parse accountId:', accountId);
      const accountIdNum = parseInt(accountId!);
      console.log('Parsed accountId:', accountIdNum, 'isNaN:', isNaN(accountIdNum));
      
      if (isNaN(accountIdNum)) {
        throw new Error('Invalid account ID');
      }
      
      console.log('Making API calls...');
      
      // Test each API call separately first with timeout
      console.log('Calling getAccount...');
      const accountPromise = apiService.getAccount(accountIdNum);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API call timeout')), 10000)
      );
      
      const accountResponse = await Promise.race([accountPromise, timeoutPromise]) as any;
      console.log('Account response received:', accountResponse);
      
      console.log('Calling getUsers...');
      const usersPromise = apiService.getUsers({ page: 1, limit: 100 });
      const usersTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Users API call timeout')), 10000)
      );
      
      const usersResponse = await Promise.race([usersPromise, usersTimeoutPromise]) as any;
      console.log('Users response received:', usersResponse);
      
      console.log('Setting account data...');
      setAccount(accountResponse.data);
      
      console.log('Setting form data...');
      setFormData({
        accountName: accountResponse.data.accountName,
        ownerId: accountResponse.data.ownerId || '',
        packageId: accountResponse.data.packageId || '',
        timezoneId: accountResponse.data.timezoneId || '',
        isActive: accountResponse.data.isActive,
        permissions: accountResponse.data.permissions || [],
        inheritPermissions: accountResponse.data.inheritPermissions || false,
      });
      
      console.log('Setting users data...');
      setUsers(usersResponse.data.list || []);
      
      console.log('Loading packages...');
      try {
        const packagesResponse = await apiService.getPackages(1); // productId = 1 for admin
        setPackages(packagesResponse.data.list || []);
        console.log('Packages loaded:', packagesResponse.data.list);
      } catch (packagesErr) {
        console.error('Error loading packages:', packagesErr);
        // Fallback to mock data if API fails
        setPackages([
          { packageId: 1, packageName: 'Basic' },
          { packageId: 2, packageName: 'Professional' },
          { packageId: 3, packageName: 'Enterprise' },
          { packageId: 4, packageName: 'Premium' },
        ]);
      }
      
      console.log('Setting timezones...');
      setTimezones([
        { timezoneId: 1, timezone: 'UTC' },
        { timezoneId: 2, timezone: 'EST (UTC-5)' },
        { timezoneId: 3, timezone: 'PST (UTC-8)' },
        { timezoneId: 4, timezone: 'CET (UTC+1)' },
        { timezoneId: 5, timezone: 'JST (UTC+9)' },
      ]);
      
      console.log('All data loaded successfully!');
    } catch (err) {
      console.error('ERROR in loadAllData:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError(`Failed to load account details: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      console.log('Setting loading to false in finally block');
      setLoading(false);
      console.log('=== LOAD ALL DATA END ===');
    }
  };

  const loadAccountDetails = async () => {
    try {
      const response: ApiResponse<Account> = await apiService.getAccount(parseInt(accountId!));
      setAccount(response.data);
      setFormData({
        accountName: response.data.accountName,
        ownerId: response.data.ownerId || '',
        packageId: response.data.packageId || '',
        timezoneId: response.data.timezoneId || '',
        isActive: response.data.isActive,
        permissions: response.data.permissions || [],
        inheritPermissions: response.data.inheritPermissions || false,
      });
    } catch (err) {
      setError('Failed to load account details');
      console.error('Error loading account:', err);
    }
  };

  const loadUsers = async () => {
    try {
      // Load users for the owner dropdown
      const response = await apiService.getUsers({ page: 1, limit: 100 });
      setUsers(response.data.list || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadPackages = async () => {
    try {
      // Call the real packages API
      const response = await apiService.getPackages(1); // productId = 1 for admin
      setPackages(response.data.list || []);
    } catch (err) {
      console.error('Error loading packages:', err);
    }
  };

  const loadTimezones = async () => {
    try {
      // Mock timezone data
      setTimezones([
        { timezoneId: 1, timezone: 'UTC' },
        { timezoneId: 2, timezone: 'EST (UTC-5)' },
        { timezoneId: 3, timezone: 'PST (UTC-8)' },
        { timezoneId: 4, timezone: 'CET (UTC+1)' },
        { timezoneId: 5, timezone: 'JST (UTC+9)' },
      ]);
    } catch (err) {
      console.error('Error loading timezones:', err);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await apiService.updateAccount(parseInt(accountId!), formData);
      setSuccess('Account updated successfully');
      loadAccountDetails(); // Refresh data
    } catch (err) {
      setError('Failed to update account');
      console.error('Error updating account:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatOriginalDate = (dateStr: string) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      const datePart = date.toLocaleDateString('en-US', options);
      
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const timePart = `${hours}:${minutes}:${seconds}`;
      
      return `${datePart} ${timePart}`;
    } catch (error) {
      return dateStr;
    }
  };

  const getAccountStatus = (isActive: boolean) => {
    return isActive ? 'Enabled' : 'Disabled';
  };

  const getSelectedPackageName = () => {
    const pkg = packages.find(p => p.packageId === formData.packageId);
    return pkg?.packageName || '';
  };

  const getOwnerUser = () => {
    const ownerId = typeof formData.ownerId === 'string' ? parseInt(formData.ownerId) : formData.ownerId;
    return users.find(u => u.userId === ownerId);
  };

  const handleEditPlan = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditingPlan(!isEditingPlan);
  };

  const handlePlanSave = async () => {
    try {
      setLoading(true);
      await apiService.updateAccount(parseInt(accountId!), {
        packageId: formData.packageId
      });
      setSuccess('Plan updated successfully');
      setIsEditingPlan(false);
      loadAccountDetails(); // Refresh data
    } catch (err) {
      setError('Failed to update plan');
      console.error('Error updating plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanCancel = () => {
    // Reset to original value
    setFormData({
      ...formData,
      packageId: account?.packageId || ''
    });
    setIsEditingPlan(false);
  };

  if (loading && !account) {
    return (
      <Box className="content-container" sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!account) {
    return (
      <Box className="content-container" sx={{ p: 3 }}>
        <Typography color="error">Account not found</Typography>
      </Box>
    );
  }

  // Define tab configurations for PageTabs
  const tabs: TabDefinition[] = [
    {
      key: 'details',
      label: 'Account Details',
      component: (
        <AccountDetailsForm 
          account={account}
          formData={formData}
          setFormData={setFormData}
          users={users}
          packages={packages}
          timezones={timezones}
          isEditingPlan={isEditingPlan}
          setIsEditingPlan={setIsEditingPlan}
          handleUpdate={handleUpdate}
          handlePlanSave={handlePlanSave}
          handlePlanCancel={handlePlanCancel}
          navigate={navigate}
          accountId={accountId!}
          loading={loading}
        />
      )
    },
    {
      key: 'users',
      label: 'Users',
      component: <UsersTab accountId={parseInt(accountId!)} account={account} users={users} />
    },
    {
      key: 'surveys',
      label: 'Surveys', 
      component: <SurveysTab accountId={parseInt(accountId!)} account={account} />
    },
    {
      key: 'collectors',
      label: 'Collectors',
      component: <CollectorsTab accountId={parseInt(accountId!)} account={account} />
    },
    {
      key: 'billing',
      label: 'Billing',
      component: <BillingTab accountId={parseInt(accountId!)} />
    },
    {
      key: 'transactions',
      label: 'Transaction History',
      component: <TransactionHistoryTab accountId={parseInt(accountId!)} />
    },
    {
      key: 'payment',
      label: 'Make a Payment',
      component: <MakePaymentTab accountId={parseInt(accountId!)} />
    },
    {
      key: 'charges',
      label: 'Charges',
      component: <ChargesTab accountId={parseInt(accountId!)} />
    },
    {
      key: 'recurring',
      label: 'Recurring',
      component: <RecurringTab accountId={parseInt(accountId!)} />
    },
    {
      key: 'uninvoiced',
      label: 'UnInvoiced List',
      component: <UnInvoicedListTab accountId={parseInt(accountId!)} />
    },
    {
      key: 'invoices',
      label: 'Invoices',
      component: <InvoicesTab accountId={parseInt(accountId!)} />
    }
  ];

  return (
    <PageTabs
      tabs={tabs}
      entityName={account.accountName}
      error={error}
      success={success}
      onErrorClose={() => setError(null)}
      onSuccessClose={() => setSuccess(null)}
      className="content-container"
    />
  );
};

// Account Details Form Component
interface AccountDetailsFormProps {
  account: Account;
  formData: any;
  setFormData: (data: any) => void;
  users: User[];
  packages: any[];
  timezones: any[];
  isEditingPlan: boolean;
  setIsEditingPlan: (editing: boolean) => void;
  handleUpdate: () => void;
  handlePlanSave: () => void;
  handlePlanCancel: () => void;
  navigate: any;
  accountId: string;
  loading: boolean;
}

const AccountDetailsForm: React.FC<AccountDetailsFormProps> = ({
  account,
  formData,
  setFormData,
  users,
  packages,
  timezones,
  isEditingPlan,
  setIsEditingPlan,
  handleUpdate,
  handlePlanSave,
  handlePlanCancel,
  navigate,
  accountId,
  loading
}) => {
  const formatOriginalDate = (dateStr: string) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      const datePart = date.toLocaleDateString('en-US', options);
      
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const timePart = `${hours}:${minutes}:${seconds}`;
      
      return `${datePart} ${timePart}`;
    } catch (error) {
      return dateStr;
    }
  };

  const getSelectedPackageName = () => {
    const pkg = packages.find(p => p.packageId === formData.packageId);
    return pkg?.packageName || '';
  };

  const getOwnerUser = () => {
    const ownerId = typeof formData.ownerId === 'string' ? parseInt(formData.ownerId) : formData.ownerId;
    return users.find(u => u.userId === ownerId);
  };

  const handleEditPlan = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditingPlan(!isEditingPlan);
  };

  return (
    <Box sx={{ 
      maxWidth: 600,
      width: '100%',
      // Responsive adjustments
      '@media (max-width: 600px)': {
        maxWidth: 'none',
        padding: 0,
      },
    }}>
          {/* Account ID */}
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Typography sx={{ minWidth: 150, pt: 1 }}>Account Id:</Typography>
            <Typography sx={{ fontWeight: 'bold', pt: 1 }}>
              {account.accountId}
            </Typography>
          </Box>

          {/* Account Name */}
          <Box sx={{ 
            display: 'flex', 
            mb: 2, 
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography sx={{ 
              minWidth: { xs: 'auto', sm: 150 }, 
              pt: { xs: 0, sm: 1 },
              mb: { xs: 0.5, sm: 0 }
            }}>* Account Name:</Typography>
            <Box sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
              <TextField
                size="small"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                inputProps={{ maxLength: 32 }}
                fullWidth
                sx={{ maxWidth: { xs: 'none', sm: 300 } }}
              />
            </Box>
          </Box>

          {/* Owner ID */}
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Typography sx={{ minWidth: 150, pt: 1 }}>Owner Id:</Typography>
            <Typography sx={{ fontWeight: 'bold', pt: 1 }}>
              {account.ownerId}
            </Typography>
          </Box>

          {/* Owned by */}
          <Box sx={{ 
            display: 'flex', 
            mb: 2, 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography sx={{ 
              minWidth: { xs: 'auto', sm: 150 },
              mb: { xs: 0.5, sm: 0 }
            }}>Owned by:</Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1,
              width: { xs: '100%', sm: 'auto' }
            }}>
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                <Select
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: Number(e.target.value) })}
                >
                  {users.map((user) => (
                    <MenuItem key={user.userId} value={user.userId}>
                      {user.userName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {getOwnerUser() && (
                <Link
                  href={`/users/${getOwnerUser()?.userId}`}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate(`/users/${getOwnerUser()?.userId}`); 
                  }}
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    textAlign: { xs: 'left', sm: 'center' }
                  }}
                >
                  View owner details
                </Link>
              )}
            </Box>
          </Box>

          {/* Current Plan */}
          <Box sx={{ 
            display: 'flex', 
            mb: 2, 
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography sx={{ 
              minWidth: { xs: 'auto', sm: 150 }, 
              pt: { xs: 0, sm: 1 },
              mb: { xs: 0.5, sm: 0 }
            }}>Current Plan:</Typography>
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {!isEditingPlan ? (
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    {getSelectedPackageName()}
                  </Typography>
                  <Link 
                    href="#" 
                    onClick={handleEditPlan}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    Edit
                  </Link>
                </Box>
              ) : (
                <Box>
                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, mb: 1 }}>
                    <Select
                      value={formData.packageId}
                      onChange={(e) => setFormData({ ...formData, packageId: Number(e.target.value) })}
                    >
                      {packages.map((pkg) => (
                        <MenuItem key={pkg.packageId} value={pkg.packageId}>
                          {pkg.packageName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={handlePlanSave}
                      disabled={loading}
                      fullWidth={{ xs: true, sm: false }}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={handlePlanCancel}
                      fullWidth={{ xs: true, sm: false }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Permissions */}
          <Box sx={{ 
            display: 'flex', 
            mb: 2, 
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography sx={{ 
              minWidth: { xs: 'auto', sm: 150 }, 
              pt: { xs: 0, sm: 1 },
              mb: { xs: 0.5, sm: 0 }
            }}>Permissions:</Typography>
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  width: { xs: '100%', sm: 250 }, 
                  height: 120, 
                  overflowY: 'auto', 
                  p: 1,
                  bgcolor: '#fff'
                }}
              >
                {/* Permissions checkboxes - disabled when inheriting from parent */}
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.permissions.includes('purchaseRespondents')}
                      onChange={(e) => {
                        const newPermissions = e.target.checked 
                          ? [...formData.permissions, 'purchaseRespondents']
                          : formData.permissions.filter(p => p !== 'purchaseRespondents');
                        setFormData({ ...formData, permissions: newPermissions });
                      }}
                      size="small" 
                      disabled={formData.inheritPermissions}
                    />
                  }
                  label="Purchase Respondents"
                  sx={{ display: 'block', mb: 0.5 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.permissions.includes('makePayment')}
                      onChange={(e) => {
                        const newPermissions = e.target.checked 
                          ? [...formData.permissions, 'makePayment']
                          : formData.permissions.filter(p => p !== 'makePayment');
                        setFormData({ ...formData, permissions: newPermissions });
                      }}
                      size="small" 
                      disabled={formData.inheritPermissions}
                    />
                  }
                  label="Make Payment"
                  sx={{ display: 'block', mb: 0.5 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.permissions.includes('customFinishBehaviour')}
                      onChange={(e) => {
                        const newPermissions = e.target.checked 
                          ? [...formData.permissions, 'customFinishBehaviour']
                          : formData.permissions.filter(p => p !== 'customFinishBehaviour');
                        setFormData({ ...formData, permissions: newPermissions });
                      }}
                      size="small" 
                      disabled={formData.inheritPermissions}
                    />
                  }
                  label="Custom Finish Behaviour"
                  sx={{ display: 'block', mb: 0.5 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.permissions.includes('importExportOpinion')}
                      onChange={(e) => {
                        const newPermissions = e.target.checked 
                          ? [...formData.permissions, 'importExportOpinion']
                          : formData.permissions.filter(p => p !== 'importExportOpinion');
                        setFormData({ ...formData, permissions: newPermissions });
                      }}
                      size="small" 
                      disabled={formData.inheritPermissions}
                    />
                  }
                  label="Import/Export Opinion"
                  sx={{ display: 'block', mb: 0.5 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.permissions.includes('advancedReports')}
                      onChange={(e) => {
                        const newPermissions = e.target.checked 
                          ? [...formData.permissions, 'advancedReports']
                          : formData.permissions.filter(p => p !== 'advancedReports');
                        setFormData({ ...formData, permissions: newPermissions });
                      }}
                      size="small" 
                      disabled={formData.inheritPermissions}
                    />
                  }
                  label="Advanced Reports"
                  sx={{ display: 'block', mb: 0.5 }}
                />
              </Paper>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.inheritPermissions}
                    onChange={(e) => setFormData({ ...formData, inheritPermissions: e.target.checked })}
                  />
                }
                label="Inherit from parent"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          {/* Timezone */}
          <Box sx={{ 
            display: 'flex', 
            mb: 2, 
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography sx={{ 
              minWidth: { xs: 'auto', sm: 150 }, 
              pt: { xs: 0, sm: 1 },
              mb: { xs: 0.5, sm: 0 }
            }}>* Timezone:</Typography>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <Select
                value={formData.timezoneId}
                onChange={(e) => setFormData({ ...formData, timezoneId: Number(e.target.value) })}
              >
                <MenuItem value="">Select timezone...</MenuItem>
                {timezones.map((tz) => (
                  <MenuItem key={tz.timezoneId} value={tz.timezoneId}>
                    {tz.timezone}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Create Date */}
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Typography sx={{ minWidth: 150, pt: 1 }}>Create Date:</Typography>
            <Typography sx={{ fontWeight: 'bold', pt: 1 }}>
              {formatOriginalDate(account.insertDate)}
            </Typography>
          </Box>

          {/* Status */}
          <Box sx={{ 
            display: 'flex', 
            mb: 2, 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography sx={{ 
              minWidth: { xs: 'auto', sm: 150 },
              mb: { xs: 0.5, sm: 0 }
            }}>Status:</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Enabled"
            />
          </Box>

          {/* Action buttons */}
          <Box sx={{ 
            mt: 4, 
            display: 'flex', 
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            '& > button': {
              minWidth: { xs: '100%', sm: 'auto' }
            }
          }}>
            <Button 
              variant="contained" 
              onClick={handleUpdate}
              disabled={loading}
              className="btn-action"
            >
              Update
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate(`/accounts/${accountId}`)}
              className="btn-cancel"
            >
              Cancel
            </Button>
          </Box>
    </Box>
  );
};

// UsersTab component
interface UsersTabProps {
  accountId: number;
  account: Account;
  users: User[];
}

type SortField = 'userId' | 'userName' | 'isActive' | 'insertDate';
type SortDirection = 'asc' | 'desc';

const UsersTab: React.FC<UsersTabProps> = ({ accountId, account, users }) => {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadAccountUsers();
  }, [accountId]);

  const loadAccountUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the users stored in the account object
      // In a real implementation, this would be an API call to get users for this specific account
      let accountUsers = account.users || [];
      
      // If no users data in account, show all loaded users as fallback
      // In practice, you'd want to filter users by accountId
      if (accountUsers.length === 0 && users.length > 0) {
        // Use the already loaded users data instead of creating mock data
        accountUsers = users.slice(0, 5); // Show first 5 users as example
        console.log('Account users loaded from main users list:', accountUsers.map(u => ({ id: u.userId, name: u.userName })));
      } else {
        console.log('Account users loaded from account.users:', accountUsers.map(u => ({ id: u.userId, name: u.userName })));
      }
      
      setUsersData(accountUsers);
    } catch (err) {
      setError('Failed to load users for this account');
      console.error('Error loading account users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  const handleFilterChange = (value: string) => {
    setSearchTerm(value);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page when filtering
  };

  // Filter users based on search term
  const filteredUsers = usersData.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ).map(user => ({
    ...user,
    id: user.userId // For DataGrid consistency
  }));

  // Column definitions for DataGrid
  const columns: GridColDef[] = [
    {
      field: 'userId',
      headerName: '#',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => navigate(`/users/${params.row.userId}`)}
          sx={{ textDecoration: 'none' }}
        >
          {params.row.userId}
        </Link>
      )
    },
    {
      field: 'userName',
      headerName: 'Username',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => navigate(`/users/${params.row.userId}`)}
          sx={{ textDecoration: 'none' }}
        >
          {params.row.userName}
        </Link>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.email || 'N/A'}
        </Typography>
      )
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.row.isActive ? 'Active' : 'Inactive'}
          size="small"
          color={params.row.isActive ? 'success' : 'default'}
          variant={params.row.isActive ? 'filled' : 'outlined'}
        />
      )
    },
    {
      field: 'insertDate',
      headerName: 'Created',
      width: 150,
      type: 'date',
      valueGetter: (params) => new Date(params.value),
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.row.insertDate)}
        </Typography>
      )
    }
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <Typography>Loading users...</Typography>;
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Toolbar with Search */}
      <StyledDataGridToolbar>
        <TextField
          size="small"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => handleFilterChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      </StyledDataGridToolbar>

      {/* Users DataGrid */}
      <Paper sx={{ p: 0 }}>
        <StyledDataGrid
          rows={filteredUsers}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          disableSelectionOnClick
          autoHeight
        />
      </Paper>
    </Box>
  );
};

export default AccountDetailsPage;
