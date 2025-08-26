import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { User } from '../../types';
import { opinionApiService } from '../../services';

interface UserDetailsTabProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const UserDetailsTab: React.FC<UserDetailsTabProps> = ({ user, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    displayName: user.displayName || '',
    email: user.email || '',
    address1: user.address1 || '',
    address2: user.address2 || '',
    city: user.city || '',
    countryId: user.countryId || '',
    stateId: user.stateId || '',
    postalCode: user.postalCode || '',
    phone1: user.phone1 || '',
    sendNewsLetters: user.sendNewsLetters || false,
    comments: user.comments || '',
  });
  

  const [countries] = useState([
    { id: 232, name: 'United States' },
    { id: 39, name: 'Canada' },
    { id: 230, name: 'United Kingdom' },
    // Add more countries as needed
  ]);

  const [states] = useState([
    { id: 1, name: 'Alabama' },
    { id: 2, name: 'Alaska' },
    { id: 3, name: 'Arizona' },
    // Add more states as needed
  ]);

  const [provinces] = useState([
    { id: 1, name: 'Alberta' },
    { id: 2, name: 'British Columbia' },
    { id: 3, name: 'Manitoba' },
    // Add more provinces as needed
  ]);

  const [showStateProvince, setShowStateProvince] = useState('none');

  useEffect(() => {
    if (formData.countryId === '232') {
      setShowStateProvince('state');
    } else if (formData.countryId === '39') {
      setShowStateProvince('province');
    } else {
      setShowStateProvince('none');
    }
  }, [formData.countryId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleUpdate = async () => {
    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        countryId: formData.countryId ? parseInt(formData.countryId) : undefined,
        stateId: formData.stateId ? parseInt(formData.stateId) : undefined,
        postalCode: formData.postalCode,
        phone1: formData.phone1,
        displayName: formData.displayName,
        sendNewsLetters: formData.sendNewsLetters,
        comments: formData.comments,
      };

      const response = await opinionApiService.updateUser(user.userId, updateData);
      if (response.success) {
        onUserUpdate(response.data);
        toast.success('Changes saved successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };


  return (
    <Box>
      {/* User Details */}
      <Box>
        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>User Id:</Box>
          <Box className="param-value">
            <Typography sx={{ color: '#000' }}>{user.userId}</Typography>
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>Username:</Box>
          <Box className="param-value">
            <Typography sx={{ color: '#000' }}>{user.userName}</Typography>
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>Provider:</Box>
          <Box className="param-value">
            <Typography sx={{ color: '#000' }}>{user.provider || ''}</Typography>
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>First Name:</Box>
          <Box className="param-value">
            <TextField
              size="small"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              inputProps={{ maxLength: 32 }}
            />
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>Last Name:</Box>
          <Box className="param-value">
            <TextField
              size="small"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              inputProps={{ maxLength: 32 }}
            />
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>Display Name:</Box>
          <Box className="param-value">
            <TextField
              size="small"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              inputProps={{ maxLength: 32 }}
            />
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>Email:</Box>
          <Box className="param-value">
            <TextField
              size="small"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              inputProps={{ maxLength: 50 }}
            />
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>Address Line 1:</Box>
          <Box className="param-value">
            <TextField
              size="small"
              value={formData.address1}
              onChange={(e) => handleInputChange('address1', e.target.value)}
              inputProps={{ maxLength: 100 }}
            />
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>Address Line 2:</Box>
          <Box className="param-value">
            <Box>
              <TextField
                size="small"
                value={formData.address2}
                onChange={(e) => handleInputChange('address2', e.target.value)}
                inputProps={{ maxLength: 100 }}
              />
              <Box sx={{ fontSize: '0.8em', color: '#999', mt: 0.5 }}>(Optional)</Box>
            </Box>
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>City:</Box>
          <Box className="param-value">
            <TextField
              size="small"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              inputProps={{ maxLength: 40 }}
            />
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>Country:</Box>
          <Box className="param-value">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={formData.countryId}
                onChange={(e) => handleInputChange('countryId', e.target.value)}
              >
                <MenuItem value="">Select Country</MenuItem>
                {countries.map(country => (
                  <MenuItem key={country.id} value={country.id.toString()}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {showStateProvince === 'state' && (
          <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>* State:</Box>
            <Box className="param-value">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={formData.stateId}
                  onChange={(e) => handleInputChange('stateId', e.target.value)}
                >
                  <MenuItem value="">Select State</MenuItem>
                  {states.map(state => (
                    <MenuItem key={state.id} value={state.id.toString()}>
                      {state.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        {showStateProvince === 'province' && (
          <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>* Province:</Box>
            <Box className="param-value">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={formData.stateId}
                  onChange={(e) => handleInputChange('stateId', e.target.value)}
                >
                  <MenuItem value="">Select Province</MenuItem>
                  {provinces.map(province => (
                    <MenuItem key={province.id} value={province.id.toString()}>
                      {province.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>ZIP Code:</Box>
          <Box className="param-value">
            <TextField
              size="small"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              inputProps={{ maxLength: 10 }}
              sx={{ width: 120 }}
            />
            <Box sx={{ fontSize: '0.8em', color: '#666', mt: 0.5 }}>(5 or 9 digits)</Box>
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>Phone 1:</Box>
          <Box className="param-value">
            <TextField
              size="small"
              value={formData.phone1}
              onChange={(e) => handleInputChange('phone1', e.target.value)}
            />
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>Register Date:</Box>
          <Box className="param-value">
            <Typography sx={{ color: '#000' }}>{user.insertDate || 'N/A'}</Typography>
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px' }}></Box>
          <Box className="param-value">
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.sendNewsLetters}
                  onChange={(e) => handleInputChange('sendNewsLetters', e.target.checked)}
                />
              }
              label="Allow to receive newsletters"
            />
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold' }}>Gateway Id:</Box>
          <Box className="param-value">
            <Typography sx={{ color: '#000' }}>{user.gatewayId || 'N/A'}</Typography>
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px', fontWeight: 'bold', pt: 1 }}>Comments:</Box>
          <Box className="param-value">
            <TextField
              multiline
              rows={3}
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              inputProps={{ maxLength: 1000 }}
              sx={{ width: '314px' }}
            />
          </Box>
        </Box>

        <Box sx={{ height: '24px' }} />

        <Box className="params" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box className="param-name" sx={{ width: '130px' }}></Box>
          <Box className="param-value">
            <Button
              variant="contained"
              className="btn-action"
              onClick={handleUpdate}
            >
              Update
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserDetailsTab;
