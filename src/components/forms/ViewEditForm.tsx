import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export interface ViewEditFormProps {
  /** Form title */
  title?: string;
  /** Form subtitle */
  subtitle?: string;
  /** Whether form is in edit mode */
  isEditing: boolean;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Whether save operation is in progress */
  isSaving: boolean;
  /** Whether refresh operation is in progress */
  isRefreshing: boolean;
  /** Current error message */
  error: string | null;
  /** Current success message */
  success: string | null;
  /** Form content */
  children: React.ReactNode;
  /** Actions to render (save, cancel, etc.) */
  actions?: React.ReactNode;
  /** Whether to wrap in Card component */
  card?: boolean;
  /** Whether to wrap in Paper component */
  paper?: boolean;
  /** Custom styling */
  sx?: object;
  /** Card/Paper styling */
  containerSx?: object;
  /** Event handlers */
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onRefresh?: () => void;
  /** Custom save button text */
  saveButtonText?: string;
  /** Custom cancel button text */
  cancelButtonText?: string;
  /** Custom edit button text */
  editButtonText?: string;
  /** Hide default actions */
  hideActions?: boolean;
  /** Show refresh button */
  showRefresh?: boolean;
  /** Disable save button */
  disableSave?: boolean;
  /** Loading state for entire form */
  loading?: boolean;
}

/**
 * Unified container component for view/edit forms
 * Provides consistent layout, actions, and messaging across all forms
 */
export const ViewEditForm: React.FC<ViewEditFormProps> = ({
  title,
  subtitle,
  isEditing,
  isDirty,
  isSaving,
  isRefreshing,
  error,
  success,
  children,
  actions,
  card = false,
  paper = false,
  sx = {},
  containerSx = {},
  onEdit,
  onSave,
  onCancel,
  onRefresh,
  saveButtonText = 'Save Changes',
  cancelButtonText = 'Cancel',
  editButtonText = 'Edit',
  hideActions = false,
  showRefresh = false,
  disableSave = false,
  loading = false,
}) => {
  // Default actions
  const defaultActions = (
    <Box display="flex" gap={1} alignItems="center">
      {isEditing ? (
        <>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
            onClick={onSave}
            disabled={!isDirty || isSaving || disableSave}
          >
            {isSaving ? 'Saving...' : saveButtonText}
          </Button>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={isSaving}
          >
            {cancelButtonText}
          </Button>
        </>
      ) : (
        <>
          {onEdit && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={onEdit}
            >
              {editButtonText}
            </Button>
          )}
          {showRefresh && onRefresh && (
            <Button
              variant="outlined"
              startIcon={isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </>
      )}
    </Box>
  );

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200} sx={sx}>
        <CircularProgress />
      </Box>
    );
  }

  // Form content
  const formContent = (
    <Box sx={sx}>
      {/* Header */}
      {(title || subtitle || (!hideActions && (onEdit || onSave))) && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            {title && (
              <Typography variant="h6" component="h2">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {!hideActions && (actions || defaultActions)}
        </Box>
      )}

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => {}}>
          {success}
        </Alert>
      )}

      {/* Form Content */}
      {children}
    </Box>
  );

  // Wrap in Card if requested
  if (card) {
    return (
      <Card sx={containerSx}>
        <CardContent>
          {formContent}
        </CardContent>
        {!hideActions && isEditing && (
          <>
            <Divider />
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              {actions || defaultActions}
            </CardActions>
          </>
        )}
      </Card>
    );
  }

  // Wrap in Paper if requested
  if (paper) {
    return (
      <Paper sx={{ p: 3, ...containerSx }}>
        {formContent}
      </Paper>
    );
  }

  // Default wrapper
  return formContent;
};

export default ViewEditForm;
