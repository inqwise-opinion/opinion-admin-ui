# Refactoring Opportunities: Code Unification & Global Patterns

## 🎯 **Executive Summary**

**Total Refactoring Opportunities**: 45+  
**Estimated Code Reduction**: ~30-40%  
**Duplicate Functions Found**: 25+  
**Reusable Components**: 15+  
**Unified Patterns**: 20+  

---

## 🔄 **1. Date Formatting Functions (HIGH IMPACT)**

### **Current State: MASSIVE DUPLICATION**
Found **20+ duplicate date formatting functions** across components:

#### **Files with duplicate `formatOriginalDate`:**
- `src/pages/accounts/AccountsPage.tsx` (lines 109-144)
- `src/pages/accounts/AccountDetailsPage.tsx` (lines 331-354) 
- `src/components/UserDetails/UserHistoryTab.tsx` (lines 84+)
- `src/components/UserDetails/UserSecurityTab.tsx` (lines 84+)
- `src/components/accounts/ChargesTab.tsx` (lines 196+)
- `src/pages/surveys/SurveysPage.tsx` (lines 50+)
- `src/pages/invoices/InvoiceListPage.tsx` (lines 174+)
- `src/pages/BillingPage.tsx` (lines 194+)
- `src/components/UserDetails/UserBillingTab.tsx` (lines 73+)
- **...15+ more files**

### **Refactoring Action:**
```typescript
// ✅ SOLUTION: Unify in utils/dateUtils.ts (already exists, needs expansion)

// ADD these missing variants:
export const formatOriginalDateWithJSX = (dateStr: string): React.ReactNode => {
  // For DataGrid cells that need JSX styling
};

export const formatTableDate = (dateStr: string): string => {
  // Consistent string format for all tables
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  // For date range displays
};
```

**Impact**: Eliminate ~500 lines of duplicate code across 20+ files

---

## 🔄 **2. Error Handling Patterns (HIGH IMPACT)**

### **Current State: REPETITIVE ERROR HANDLING**
Found **40+ files** with identical error handling patterns:

```typescript
// DUPLICATE PATTERN (found in 40+ files):
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    // API call
  } catch (err) {
    setError('Failed to load data');
  } finally {
    setLoading(false);
  }
};
```

### **Refactoring Action:**
```typescript
// ✅ SOLUTION: Create unified data fetching hooks

// hooks/useAsyncData.ts
export const useAsyncData = <T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
};

// Usage in components:
const { data: accounts, loading, error, refetch } = useAsyncData(
  () => apiService.getAccounts(params),
  [params]
);
```

**Impact**: Eliminate ~1200 lines of duplicate error handling code

---

## 🔄 **3. DataGrid Column Definitions (HIGH IMPACT)**

### **Current State: REPEATED COLUMN PATTERNS**
Found **8+ files** with similar DataGrid column structures:

#### **Common Patterns:**
- Account ID columns (right-aligned numbers)
- Date columns with formatOriginalDate
- Status columns with chip styling
- Action columns with buttons
- Link columns with navigation

### **Refactoring Action:**
```typescript
// ✅ SOLUTION: Create reusable column factories

// components/common/DataGridColumns.tsx
export const createIdColumn = (field: string, headerName: string = '#') => ({
  field,
  headerName,
  width: 46,
  align: 'right' as const,
  headerAlign: 'right' as const,
  sortable: true,
  type: 'number' as const,
  renderCell: (params: any) => (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
      <Typography variant="body2">{params.value}</Typography>
    </Box>
  ),
});

export const createDateColumn = (field: string, headerName: string) => ({
  field,
  headerName,
  width: 160,
  sortable: true,
  type: 'string' as const,
  renderCell: (params: any) => (
    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
      {formatTableDate(params.value || '')}
    </Typography>
  ),
});

export const createLinkColumn = (
  field: string, 
  headerName: string, 
  getLinkPath: (row: any) => string
) => ({
  field,
  headerName,
  flex: 1,
  minWidth: 150,
  sortable: true,
  renderCell: (params: any) => (
    <Link
      component={RouterLink}
      to={getLinkPath(params.row)}
      sx={{ color: 'primary.main', textDecoration: 'none' }}
    >
      {params.value || ''}
    </Link>
  ),
});

// Usage:
const columns = [
  createIdColumn('accountId'),
  createLinkColumn('accountName', 'Account', (row) => `/accounts/${row.accountId}`),
  createDateColumn('insertDate', 'Create Date'),
];
```

**Impact**: Eliminate ~400 lines of duplicate column definitions

---

## 🔄 **4. Form Validation Schemas (MEDIUM IMPACT)**

### **Current State: SCATTERED VALIDATION**
Found **12+ files** with similar form validation patterns using Yup:

### **Refactoring Action:**
```typescript
// ✅ SOLUTION: Create reusable validation schemas

// utils/validationSchemas.ts
export const commonValidations = {
  email: yup.string().email('Invalid email').required('Email is required'),
  requiredString: (fieldName: string) => 
    yup.string().required(`${fieldName} is required`),
  optionalString: yup.string().nullable(),
  positiveNumber: (fieldName: string) =>
    yup.number().positive(`${fieldName} must be positive`).required(),
  phoneNumber: yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
    .nullable(),
};

export const createUserValidationSchema = () => yup.object({
  firstName: commonValidations.requiredString('First name'),
  lastName: commonValidations.requiredString('Last name'), 
  email: commonValidations.email,
  phone: commonValidations.phoneNumber,
});

export const createAccountValidationSchema = () => yup.object({
  accountName: commonValidations.requiredString('Account name'),
  ownerId: commonValidations.positiveNumber('Owner'),
  // ... other fields
});
```

**Impact**: Eliminate ~200 lines of duplicate validation code

---

## 🔄 **5. Alert/Notification Components (MEDIUM IMPACT)**

### **Current State: REPEATED ALERT PATTERNS**
Found **25+ files** with identical Alert usage:

```typescript
// DUPLICATE PATTERN:
{error && (
  <Alert severity="error" onClose={clearAlert} sx={{ mb: 2 }}>
    {error}
  </Alert>
)}
{success && (
  <Alert severity="success" onClose={clearAlert} sx={{ mb: 2 }}>
    {success}
  </Alert>
)}
```

### **Refactoring Action:**
```typescript
// ✅ SOLUTION: Create reusable AlertContainer

// components/common/AlertContainer.tsx
interface AlertContainerProps {
  error?: string | null;
  success?: string | null;
  onClearError?: () => void;
  onClearSuccess?: () => void;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({
  error,
  success,
  onClearError,
  onClearSuccess
}) => (
  <>
    {error && (
      <Alert severity="error" onClose={onClearError} sx={{ mb: 2 }}>
        {error}
      </Alert>
    )}
    {success && (
      <Alert severity="success" onClose={onClearSuccess} sx={{ mb: 2 }}>
        {success}
      </Alert>
    )}
  </>
);

// hooks/useAlerts.ts
export const useAlerts = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);
  const clearAll = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    error, success, setError, setSuccess,
    clearError, clearSuccess, clearAll
  };
};
```

**Impact**: Eliminate ~150 lines of duplicate alert code

---

## 🔄 **6. Form Dialog Components (MEDIUM IMPACT)**

### **Current State: SIMILAR DIALOG STRUCTURES**
Found **6+ dialog components** with nearly identical structures:

- `UserFormDialog.tsx`
- `AccountFormDialog.tsx`
- `SurveyFormDialog.tsx`
- `InvoiceDetailsPage.tsx` (dialog sections)

### **Refactoring Action:**
```typescript
// ✅ SOLUTION: Create reusable FormDialog base

// components/common/FormDialog.tsx
interface FormDialogProps<T> {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (data: T) => void;
  initialData?: T;
  validationSchema?: any;
  loading?: boolean;
  children: React.ReactNode;
}

export const FormDialog = <T extends Record<string, any>>({
  open, onClose, title, onSubmit, initialData,
  validationSchema, loading, children
}: FormDialogProps<T>) => {
  // Common dialog logic, form handling, etc.
};
```

**Impact**: Eliminate ~300 lines of duplicate dialog code

---

## 🔄 **7. Table/List Components (HIGH IMPACT)**

### **Current State: REPEATED TABLE PATTERNS**
Found **10+ files** with similar table structures:

### **Refactoring Action:**
```typescript
// ✅ SOLUTION: Create unified DataTable component

// components/common/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: GridColDef[];
  loading?: boolean;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export const DataTable = <T extends Record<string, any>>({
  data, columns, loading, error, pagination, filters, actions, onRowClick
}: DataTableProps<T>) => {
  return (
    <Box>
      {filters && (
        <Paper sx={{ p: 2, mb: 2 }}>
          {filters}
        </Paper>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Paper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h6">
            {/* Auto-generated title based on data */}
          </Typography>
          {actions}
        </Box>
        
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          // ... common DataGrid props
        />
      </Paper>
    </Box>
  );
};
```

**Impact**: Eliminate ~600 lines of duplicate table code

---

## 🔄 **8. Search & Filter Components (MEDIUM IMPACT)**

### **Current State: REPEATED FILTER PATTERNS**

### **Refactoring Action:**
```typescript
// ✅ SOLUTION: Create reusable SearchFilters

// components/common/SearchFilters.tsx
interface SearchFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    type: 'select' | 'date' | 'text';
    options?: Array<{ value: string; label: string }>;
    value: any;
    onChange: (value: any) => void;
  }>;
  actions?: React.ReactNode;
}
```

**Impact**: Eliminate ~200 lines of duplicate filter code

---

## 🔄 **9. Status/Badge Components (LOW IMPACT)**

### **Current State: SCATTERED STATUS DISPLAYS**

### **Refactoring Action:**
```typescript
// ✅ SOLUTION: Create unified StatusChip

// components/common/StatusChip.tsx
interface StatusChipProps {
  status: string;
  variant?: 'account' | 'user' | 'invoice' | 'survey';
  size?: 'small' | 'medium';
}

const STATUS_CONFIG = {
  account: {
    enabled: { color: 'success', label: 'Active' },
    disabled: { color: 'error', label: 'Inactive' },
    // ...
  },
  // ... other variants
};
```

**Impact**: Eliminate ~100 lines of duplicate status code

---

## 🔄 **10. Loading States (MEDIUM IMPACT)**

### **Current State: INCONSISTENT LOADING INDICATORS**

### **Refactoring Action:**
```typescript
// ✅ SOLUTION: Unified loading system

// components/common/LoadingStates.tsx
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  // Consistent skeleton for all tables
);

export const CardSkeleton = () => (
  // Consistent skeleton for cards
);

export const PageLoader = () => (
  // Full-page loading state
);
```

**Impact**: Eliminate ~150 lines of inconsistent loading code

---

## 📊 **Refactoring Priority Matrix**

| Category | Files Affected | Lines Saved | Effort | Priority |
|----------|----------------|-------------|---------|----------|
| Date Formatting | 20+ | ~500 | Low | 🚨 **CRITICAL** |
| Error Handling | 40+ | ~1200 | Medium | 🚨 **CRITICAL** |  
| DataGrid Columns | 8+ | ~400 | Low | 🔥 **HIGH** |
| Form Validation | 12+ | ~200 | Low | 🔥 **HIGH** |
| Alert Components | 25+ | ~150 | Low | 🟡 **MEDIUM** |
| Table Components | 10+ | ~600 | High | 🟡 **MEDIUM** |
| Form Dialogs | 6+ | ~300 | Medium | 🟡 **MEDIUM** |
| Search Filters | 8+ | ~200 | Medium | 🟢 **LOW** |
| Status Components | 15+ | ~100 | Low | 🟢 **LOW** |
| Loading States | 20+ | ~150 | Low | 🟢 **LOW** |

---

## 🎯 **Recommended Implementation Order**

### **Phase 1: Quick Wins (1-2 days)**
1. **Unify Date Formatting** - Move all `formatOriginalDate` to `utils/dateUtils.ts`
2. **Create AlertContainer** - Replace all Alert patterns
3. **Create StatusChip** - Unify all status displays

### **Phase 2: High Impact (3-5 days)**  
1. **Create useAsyncData hook** - Replace all error handling patterns
2. **Create DataGrid column factories** - Unify all table columns
3. **Create validation schemas** - Centralize form validation

### **Phase 3: Component Unification (5-7 days)**
1. **Create DataTable component** - Replace repetitive table code  
2. **Create FormDialog base** - Unify all dialog components
3. **Create SearchFilters component** - Standardize filtering

### **Phase 4: Final Polish (2-3 days)**
1. **Unify loading states** - Consistent skeleton screens
2. **Create design system tokens** - Centralize spacing/colors
3. **Documentation & examples** - Usage guides for unified components

---

## 📁 **Proposed New File Structure**

```
src/
├── components/
│   ├── common/           # ✨ NEW: Unified components
│   │   ├── DataTable.tsx
│   │   ├── FormDialog.tsx
│   │   ├── AlertContainer.tsx
│   │   ├── StatusChip.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── LoadingStates.tsx
│   │   └── DataGridColumns.tsx
│   └── ...existing components
├── hooks/                # ✨ EXPANDED: More reusable hooks
│   ├── useAsyncData.ts   # ✨ NEW
│   ├── useAlerts.ts      # ✨ NEW  
│   ├── useTableData.ts   # ✨ NEW
│   └── ...existing hooks
├── utils/                # ✨ EXPANDED: More utilities
│   ├── dateUtils.ts      # ✨ ENHANCED
│   ├── validationSchemas.ts # ✨ NEW
│   ├── apiHelpers.ts     # ✨ NEW
│   └── ...existing utils
└── constants/
    ├── designTokens.ts   # ✨ NEW: Spacing, shadows, etc.
    └── ...existing constants
```

---

## 💡 **Expected Outcomes**

### **Code Reduction:**
- **~3,800 lines removed** through refactoring
- **~30-40% reduction** in component code complexity
- **Consistent patterns** across all components

### **Maintainability:**
- **Single source of truth** for common patterns
- **Easier bug fixes** - fix once, apply everywhere
- **Consistent UX** - unified components = consistent behavior

### **Developer Experience:**
- **Faster development** - reusable components
- **Less duplication** - copy-paste reduced by 80%
- **Better testing** - test reusable components once

### **Performance:**
- **Smaller bundle size** - less duplicate code
- **Better tree-shaking** - centralized utilities
- **Consistent loading** - unified async patterns

This refactoring would transform the codebase from duplicate patterns to a clean, maintainable, and scalable architecture while preserving all existing functionality.
