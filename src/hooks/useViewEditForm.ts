import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

export interface ViewEditFormOptions<T> {
  /** Initial data for the form */
  initialData: T;
  /** Function to save the form data */
  onSave: (data: T) => Promise<void>;
  /** Function to load fresh data (optional) */
  onRefresh?: () => Promise<T>;
  /** Validation function (optional) */
  validate?: (data: T) => Record<string, string>;
  /** Success message after save */
  successMessage?: string;
  /** Whether form starts in edit mode */
  initialEditMode?: boolean;
  /** Auto-save delay in milliseconds (optional) */
  autoSaveDelay?: number;
}

export interface ViewEditFormState<T> {
  /** Current form data */
  data: T;
  /** Whether form is in edit mode */
  isEditing: boolean;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Whether save operation is in progress */
  isSaving: boolean;
  /** Whether refresh operation is in progress */
  isRefreshing: boolean;
  /** Current validation errors */
  errors: Record<string, string>;
  /** Current error message */
  error: string | null;
  /** Current success message */
  success: string | null;
}

export interface ViewEditFormActions<T> {
  /** Update form data */
  updateData: (updates: Partial<T> | ((prev: T) => T)) => void;
  /** Enter edit mode */
  startEditing: () => void;
  /** Save changes and exit edit mode */
  save: () => Promise<void>;
  /** Cancel changes and exit edit mode */
  cancel: () => void;
  /** Reset form to initial/fresh data */
  reset: () => void;
  /** Refresh data from source */
  refresh: () => Promise<void>;
  /** Set edit mode */
  setEditMode: (editing: boolean) => void;
  /** Clear errors */
  clearErrors: () => void;
  /** Set field error */
  setFieldError: (field: string, error: string) => void;
  /** Clear field error */
  clearFieldError: (field: string) => void;
}

/**
 * Unified hook for managing view/edit form state and operations
 * Provides consistent patterns for all view/edit forms across the application
 */
export function useViewEditForm<T extends Record<string, any>>(
  options: ViewEditFormOptions<T>
): ViewEditFormState<T> & ViewEditFormActions<T> {
  const {
    initialData,
    onSave,
    onRefresh,
    validate,
    successMessage = 'Changes saved successfully',
    initialEditMode = false,
    autoSaveDelay
  } = options;

  // Form state
  const [data, setData] = useState<T>(initialData);
  const [originalData, setOriginalData] = useState<T>(initialData);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Refs for auto-save
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(initialData);

  // Calculate derived state
  const isDirty = JSON.stringify(data) !== JSON.stringify(originalData);

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData);
    setOriginalData(initialData);
    previousDataRef.current = initialData;
  }, [initialData]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveDelay || !isEditing || !isDirty || isSaving) {
      return;
    }

    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout
    autoSaveTimeoutRef.current = setTimeout(() => {
      save();
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [data, isEditing, isDirty, autoSaveDelay]);

  const updateData = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    setData(prev => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      return newData;
    });
    
    // Clear success message when data changes
    if (success) {
      setSuccess(null);
    }
  }, [success]);

  const validate_data = useCallback((dataToValidate: T): Record<string, string> => {
    return validate ? validate(dataToValidate) : {};
  }, [validate]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  }, []);

  const save = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Validate data
      const validationErrors = validate_data(data);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setError('Please correct the errors below');
        return;
      }

      // Clear validation errors
      setErrors({});

      // Save data
      await onSave(data);

      // Update original data
      setOriginalData({ ...data });
      previousDataRef.current = { ...data };

      // Set success message
      setSuccess(successMessage);
      toast.success(successMessage);

      // Exit edit mode
      setIsEditing(false);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save changes';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave, validate_data, successMessage]);

  const cancel = useCallback(() => {
    // Restore original data
    setData({ ...originalData });
    
    // Clear states
    setErrors({});
    setError(null);
    setSuccess(null);
    
    // Exit edit mode
    setIsEditing(false);
  }, [originalData]);

  const reset = useCallback(() => {
    setData({ ...originalData });
    setErrors({});
    setError(null);
    setSuccess(null);
  }, [originalData]);

  const refresh = useCallback(async () => {
    if (!onRefresh) return;

    try {
      setIsRefreshing(true);
      setError(null);

      const freshData = await onRefresh();
      
      setData(freshData);
      setOriginalData(freshData);
      previousDataRef.current = freshData;
      
      // Clear states
      setErrors({});
      setSuccess(null);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to refresh data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  const setEditMode = useCallback((editing: boolean) => {
    if (editing) {
      startEditing();
    } else {
      cancel();
    }
  }, [startEditing, cancel]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setError(null);
  }, []);

  const setFieldError = useCallback((field: string, errorMsg: string) => {
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    // State
    data,
    isEditing,
    isDirty,
    isSaving,
    isRefreshing,
    errors,
    error,
    success,
    
    // Actions
    updateData,
    startEditing,
    save,
    cancel,
    reset,
    refresh,
    setEditMode,
    clearErrors,
    setFieldError,
    clearFieldError,
  };
}

export default useViewEditForm;
