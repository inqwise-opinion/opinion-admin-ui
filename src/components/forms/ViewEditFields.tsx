import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Chip,
  Link,
  FormHelperText,
  TextareaAutosize,
  Checkbox,
  RadioGroup,
  Radio,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

interface BaseViewEditFieldProps {
  label: string;
  value: any;
  error?: string;
  isEditing: boolean;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  helperText?: string;
  labelWidth?: number | string;
  sx?: object;
}

interface ViewEditFieldProps extends BaseViewEditFieldProps {
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url';
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  onEditClick?: () => void;
}

interface ViewEditSelectProps extends BaseViewEditFieldProps {
  onChange: (value: any) => void;
  options: Array<{ value: any; label: string; disabled?: boolean }>;
  multiple?: boolean;
  renderValue?: (value: any) => React.ReactNode;
  onEditClick?: () => void;
}

interface ViewEditSwitchProps extends BaseViewEditFieldProps {
  onChange: (checked: boolean) => void;
  onEditClick?: () => void;
}

interface ViewEditDateFieldProps extends BaseViewEditFieldProps {
  onChange: (value: string) => void;
  type?: 'date' | 'datetime-local' | 'time';
  onEditClick?: () => void;
}

/**
 * Unified text field component for view/edit modes
 */
export const ViewEditField: React.FC<ViewEditFieldProps> = ({
  label,
  value,
  onChange,
  error,
  isEditing,
  disabled = false,
  required = false,
  fullWidth = false,
  helperText,
  labelWidth = 150,
  type = 'text',
  placeholder,
  maxLength,
  multiline = false,
  rows = 1,
  startAdornment,
  endAdornment,
  onEditClick,
  sx = {}
}) => {
  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', mb: 2, alignItems: 'flex-start', ...sx }}>
        <Typography sx={{ minWidth: labelWidth, pt: 1 }}>
          {required && '* '}{label}:
        </Typography>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth={fullWidth}
            size="small"
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            error={!!error}
            disabled={disabled}
            placeholder={placeholder}
            multiline={multiline}
            rows={multiline ? rows : undefined}
            InputProps={{
              ...(maxLength && { inputProps: { maxLength } }),
              ...(startAdornment && { startAdornment }),
              ...(endAdornment && { endAdornment }),
            }}
            sx={{ maxWidth: fullWidth ? undefined : 300 }}
          />
          {(error || helperText) && (
            <FormHelperText error={!!error}>
              {error || helperText}
            </FormHelperText>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', mb: 2, alignItems: 'center', ...sx }}>
      <Typography sx={{ minWidth: labelWidth, pt: 1 }}>
        {label}:
      </Typography>
      <Typography sx={{ fontWeight: value ? 'normal' : 'italic', pt: 1, mr: 1 }}>
        {value || 'N/A'}
      </Typography>
      {onEditClick && (
        <IconButton size="small" onClick={onEditClick} sx={{ ml: 'auto' }}>
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

/**
 * Unified select field component for view/edit modes
 */
export const ViewEditSelect: React.FC<ViewEditSelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  isEditing,
  disabled = false,
  required = false,
  fullWidth = false,
  helperText,
  labelWidth = 150,
  multiple = false,
  renderValue,
  onEditClick,
  sx = {}
}) => {
  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      return value
        .map(v => options.find(opt => opt.value === v)?.label || v)
        .join(', ');
    }
    return options.find(opt => opt.value === value)?.label || value || 'N/A';
  };

  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', mb: 2, alignItems: 'flex-start', ...sx }}>
        <Typography sx={{ minWidth: labelWidth, pt: 1 }}>
          {required && '* '}{label}:
        </Typography>
        <Box sx={{ flex: 1 }}>
          <FormControl size="small" fullWidth={fullWidth} error={!!error} sx={{ maxWidth: fullWidth ? undefined : 200 }}>
            <InputLabel>{label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              multiple={multiple}
              renderValue={renderValue}
              label={label}
            >
              {options.map((option) => (
                <MenuItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || helperText) && (
              <FormHelperText>{error || helperText}</FormHelperText>
            )}
          </FormControl>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', mb: 2, alignItems: 'center', ...sx }}>
      <Typography sx={{ minWidth: labelWidth, pt: 1 }}>
        {label}:
      </Typography>
      <Typography sx={{ fontWeight: value ? 'normal' : 'italic', pt: 1, mr: 1 }}>
        {getDisplayValue()}
      </Typography>
      {onEditClick && (
        <IconButton size="small" onClick={onEditClick} sx={{ ml: 'auto' }}>
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

/**
 * Unified switch component for view/edit modes
 */
export const ViewEditSwitch: React.FC<ViewEditSwitchProps> = ({
  label,
  value,
  onChange,
  error,
  isEditing,
  disabled = false,
  required = false,
  helperText,
  labelWidth = 150,
  onEditClick,
  sx = {}
}) => {
  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', mb: 2, alignItems: 'center', ...sx }}>
        <Typography sx={{ minWidth: labelWidth }}>
          {required && '* '}{label}:
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label=""
        />
        {(error || helperText) && (
          <FormHelperText error={!!error}>
            {error || helperText}
          </FormHelperText>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', mb: 2, alignItems: 'center', ...sx }}>
      <Typography sx={{ minWidth: labelWidth }}>
        {label}:
      </Typography>
      <Chip 
        label={value ? 'Yes' : 'No'}
        size="small"
        color={value ? 'success' : 'default'}
        sx={{ mr: 1 }}
      />
      {onEditClick && (
        <IconButton size="small" onClick={onEditClick} sx={{ ml: 'auto' }}>
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

/**
 * Unified date field component for view/edit modes
 */
export const ViewEditDateField: React.FC<ViewEditDateFieldProps> = ({
  label,
  value,
  onChange,
  error,
  isEditing,
  disabled = false,
  required = false,
  fullWidth = false,
  helperText,
  labelWidth = 150,
  type = 'date',
  onEditClick,
  sx = {}
}) => {
  const formatDisplayValue = (val: string) => {
    if (!val) return 'N/A';
    
    try {
      const date = new Date(val);
      if (type === 'date') {
        return date.toLocaleDateString();
      } else if (type === 'datetime-local') {
        return date.toLocaleString();
      } else if (type === 'time') {
        return date.toLocaleTimeString();
      }
      return val;
    } catch {
      return val;
    }
  };

  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', mb: 2, alignItems: 'flex-start', ...sx }}>
        <Typography sx={{ minWidth: labelWidth, pt: 1 }}>
          {required && '* '}{label}:
        </Typography>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth={fullWidth}
            size="small"
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            error={!!error}
            disabled={disabled}
            sx={{ maxWidth: fullWidth ? undefined : 200 }}
          />
          {(error || helperText) && (
            <FormHelperText error={!!error}>
              {error || helperText}
            </FormHelperText>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', mb: 2, alignItems: 'center', ...sx }}>
      <Typography sx={{ minWidth: labelWidth, pt: 1 }}>
        {label}:
      </Typography>
      <Typography sx={{ fontWeight: value ? 'normal' : 'italic', pt: 1, mr: 1 }}>
        {formatDisplayValue(value)}
      </Typography>
      {onEditClick && (
        <IconButton size="small" onClick={onEditClick} sx={{ ml: 'auto' }}>
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

/**
 * Unified display-only field (read-only)
 */
export const ViewOnlyField: React.FC<{
  label: string;
  value: any;
  labelWidth?: number | string;
  renderValue?: (value: any) => React.ReactNode;
  sx?: object;
}> = ({
  label,
  value,
  labelWidth = 150,
  renderValue,
  sx = {}
}) => {
  return (
    <Box sx={{ display: 'flex', mb: 2, alignItems: 'center', ...sx }}>
      <Typography sx={{ minWidth: labelWidth, pt: 1 }}>
        {label}:
      </Typography>
      <Typography sx={{ fontWeight: value ? 'normal' : 'italic', pt: 1 }}>
        {renderValue ? renderValue(value) : (value || 'N/A')}
      </Typography>
    </Box>
  );
};

/**
 * Inline edit field - shows value with edit icon
 */
export const InlineEditField: React.FC<{
  label: string;
  value: any;
  isEditing: boolean;
  onEditClick: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode; // Edit form content
  labelWidth?: number | string;
  sx?: object;
}> = ({
  label,
  value,
  isEditing,
  onEditClick,
  onSave,
  onCancel,
  children,
  labelWidth = 150,
  sx = {}
}) => {
  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', mb: 2, alignItems: 'flex-start', ...sx }}>
        <Typography sx={{ minWidth: labelWidth, pt: 1 }}>
          {label}:
        </Typography>
        <Box sx={{ flex: 1 }}>
          {children}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Box
              component="button"
              onClick={onSave}
              sx={{
                px: 2,
                py: 0.5,
                fontSize: '0.875rem',
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                border: 'none',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              Save
            </Box>
            <Box
              component="button"
              onClick={onCancel}
              sx={{
                px: 2,
                py: 0.5,
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                color: 'text.primary',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              Cancel
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', mb: 2, alignItems: 'center', ...sx }}>
      <Typography sx={{ minWidth: labelWidth, pt: 1 }}>
        {label}:
      </Typography>
      <Typography sx={{ fontWeight: value ? 'bold' : 'italic', pt: 1, mr: 1 }}>
        {value || 'N/A'}
      </Typography>
      <Link
        component="button"
        onClick={onEditClick}
        sx={{ fontSize: '0.875rem', ml: 1 }}
      >
        Edit
      </Link>
    </Box>
  );
};
