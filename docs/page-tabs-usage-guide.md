# PageTabs Component - Developer Usage Guide

A comprehensive guide for developers implementing the standardized `PageTabs` component in the Opinion Admin UI. This component provides consistent tabbed navigation with URL synchronization, breadcrumb integration, and built-in error handling.

## Overview

The `PageTabs` component was created to standardize tab navigation across the application, replacing multiple inconsistent tab implementations with a single, feature-rich solution.

### Key Benefits
- ✅ **URL Synchronization**: Automatic browser history and bookmarkable tab states
- ✅ **Breadcrumb Integration**: Seamless updates to navigation breadcrumbs
- ✅ **Consistent UX**: Unified styling and behavior across all pages
- ✅ **Built-in Alerts**: Success and error message handling
- ✅ **Mobile Responsive**: Scrollable tabs for smaller screens
- ✅ **TypeScript Support**: Full type safety and intelliSense
- ✅ **Accessibility**: ARIA attributes and keyboard navigation

## Installation & Import

```typescript
// Import the component and interfaces
import { PageTabs, TabDefinition } from '../components/common';
```

## Basic Implementation

### 1. Define Tab Configuration

```typescript
import React, { useState } from 'react';
import { PageTabs, TabDefinition } from '../components/common';

const MyPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Define your tabs
  const tabs: TabDefinition[] = [
    {
      key: 'details',           // URL parameter key
      label: 'User Details',    // Display label
      component: <UserDetailsTab />  // React component
    },
    {
      key: 'messages',
      label: 'Messages',
      component: <UserMessagesTab />
    },
    {
      key: 'history',
      label: 'Activity History',
      component: <UserHistoryTab />
    }
  ];

  return (
    <PageTabs
      tabs={tabs}
      entityName="John Doe"  // For breadcrumbs
      error={error}
      success={success}
      onErrorClose={() => setError(null)}
      onSuccessClose={() => setSuccess(null)}
    />
  );
};
```

### 2. URL Behavior

The component automatically handles URL synchronization:

- **Default tab**: `/users/123` (no tab parameter)
- **Other tabs**: `/users/123?tab=messages`, `/users/123?tab=history`
- **Browser navigation**: Back/forward buttons work correctly
- **Bookmarkable**: Users can bookmark and share specific tabs

## Component API

### Props Interface

```typescript
interface PageTabsProps {
  tabs: TabDefinition[];           // Required: Array of tab configurations
  entityName?: string;             // Optional: For breadcrumb updates
  defaultTab?: number;             // Optional: Default active tab index (0)
  error?: string | null;           // Optional: Error message to display
  success?: string | null;         // Optional: Success message to display
  onErrorClose?: () => void;       // Optional: Error alert close handler
  onSuccessClose?: () => void;     // Optional: Success alert close handler
  className?: string;              // Optional: CSS class for container
  sx?: any;                        // Optional: MUI sx styling props
}
```

### TabDefinition Interface

```typescript
interface TabDefinition {
  key: string;        // URL parameter key (lowercase, URL-friendly)
  label: string;      // Display label for the tab
  component: ReactNode;  // React component to render in tab panel
}
```

## Real-World Implementation Examples

### 👥 User Details Page

```typescript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageTabs, TabDefinition } from '../components/common';
import { UserDetailsTab, UserMessagesTab, UserHistoryTab } from './tabs';

const UserDetailsPage: React.FC = () => {
  const { id: userId } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    fetchUser(userId!)
      .then(setUser)
      .catch(() => setError('Failed to load user'));
  }, [userId]);

  const tabs: TabDefinition[] = [
    {
      key: 'details',
      label: 'User Details',
      component: (
        <UserDetailsTab 
          user={user} 
          onSuccess={(msg) => setSuccess(msg)}
          onError={(msg) => setError(msg)}
        />
      )
    },
    {
      key: 'messages',
      label: 'Messages',
      component: <UserMessagesTab userId={userId!} />
    },
    {
      key: 'history',
      label: 'Activity History', 
      component: <UserHistoryTab userId={userId!} />
    }
  ];

  return (
    <div className="content-container">
      <PageTabs
        tabs={tabs}
        entityName={user?.displayName || user?.userName}
        error={error}
        success={success}
        onErrorClose={() => setError(null)}
        onSuccessClose={() => setSuccess(null)}
      />
    </div>
  );
};
```

### 🏢 Account Details Page

```typescript
const AccountDetailsPage: React.FC = () => {
  const { id: accountId } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tabs: TabDefinition[] = [
    {
      key: 'details',
      label: 'Account Details',
      component: (
        <AccountDetailsTab 
          account={account} 
          onUpdate={(updated) => {
            setAccount(updated);
            setSuccess('Account updated successfully');
          }}
        />
      )
    },
    {
      key: 'users',
      label: 'Users',
      component: <AccountUsersTab accountId={accountId!} />
    },
    {
      key: 'billing',
      label: 'Billing',
      component: <AccountBillingTab accountId={accountId!} />
    }
  ];

  return (
    <PageTabs
      tabs={tabs}
      entityName={account?.accountName}
      defaultTab={0}
      error={error}
      success={success}
      onErrorClose={() => setError(null)}
      onSuccessClose={() => setSuccess(null)}
    />
  );
};
```

### 💳 Billing Page with State Management

```typescript
const BillingPage: React.FC = () => {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset state when tabs change
  const handleTabChange = () => {
    setSelectedInvoices([]);
    setCurrentPage(1);
  };

  const tabs: TabDefinition[] = [
    {
      key: 'invoices',
      label: 'Invoice List',
      component: (
        <InvoiceListTab 
          selectedInvoices={selectedInvoices}
          onSelectionChange={setSelectedInvoices}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )
    },
    {
      key: 'uninvoiced',
      label: 'Uninvoiced Items',
      component: <UninvoicedTab />
    },
    {
      key: 'transactions',
      label: 'Transaction History',
      component: <TransactionHistoryTab />
    }
  ];

  return (
    <PageTabs
      tabs={tabs}
      error={error}
      success={success}
      onErrorClose={() => setError(null)}
      onSuccessClose={() => setSuccess(null)}
      // Add custom behavior on tab change
      sx={{
        '& .MuiTab-root': {
          minWidth: 120,
          fontSize: '14px'
        }
      }}
    />
  );
};
```

## Advanced Usage Patterns

### 🔧 Conditional Tabs

Show/hide tabs based on user permissions or data state:

```typescript
const tabs: TabDefinition[] = [
  {
    key: 'details',
    label: 'Details',
    component: <DetailsTab />
  },
  // Conditionally include admin tab
  ...(user?.isAdmin ? [{
    key: 'admin',
    label: 'Admin Settings',
    component: <AdminTab />
  }] : []),
  // Only show billing tab if account has billing enabled
  ...(account?.hasBilling ? [{
    key: 'billing',
    label: 'Billing',
    component: <BillingTab />
  }] : [])
];
```

### 🚀 Performance Optimization with Lazy Loading

```typescript
import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Lazy load heavy components
const LazyReportsTab = lazy(() => import('./ReportsTab'));
const LazyAnalyticsTab = lazy(() => import('./AnalyticsTab'));

const tabs: TabDefinition[] = [
  {
    key: 'overview',
    label: 'Overview',
    component: <OverviewTab /> // Immediate load
  },
  {
    key: 'reports',
    label: 'Reports',
    component: (
      <Suspense fallback={
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      }>
        <LazyReportsTab />
      </Suspense>
    )
  },
  {
    key: 'analytics',
    label: 'Analytics',
    component: (
      <Suspense fallback={<div>Loading analytics...</div>}>
        <LazyAnalyticsTab />
      </Suspense>
    )
  }
];
```

### 🎨 Custom Styling

```typescript
<PageTabs
  tabs={tabs}
  sx={{
    // Style the tab container
    '& .MuiTabs-root': {
      backgroundColor: 'grey.100',
      borderRadius: 1
    },
    // Style individual tabs
    '& .MuiTab-root': {
      fontSize: '16px',
      fontWeight: 600,
      textTransform: 'none',
      minWidth: 120,
      '&.Mui-selected': {
        color: 'primary.main'
      }
    },
    // Style the active tab indicator
    '& .MuiTabs-indicator': {
      height: 3,
      borderRadius: 1.5,
      backgroundColor: 'primary.main'
    },
    // Style tab panels
    '& .MuiBox-root[role="tabpanel"]': {
      padding: 0  // Remove default padding if needed
    }
  }}
/>
```

## Migration Guide

### From Custom Tab Implementation

#### ❌ Before (Manual Implementation)
```typescript
const [activeTab, setActiveTab] = useState(0);
const [searchParams, setSearchParams] = useSearchParams();

// Custom TabPanel component (duplicated across files)
function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Manual URL synchronization
const handleTabChange = (event, newValue) => {
  setActiveTab(newValue);
  const params = new URLSearchParams(searchParams);
  if (newValue === 1) {
    params.set('tab', 'messages');
  } else {
    params.delete('tab');
  }
  setSearchParams(params);
};

// Manual rendering
return (
  <Box>
    <Tabs value={activeTab} onChange={handleTabChange}>
      <Tab label="Details" />
      <Tab label="Messages" />
    </Tabs>
    <TabPanel value={activeTab} index={0}>
      <UserDetailsTab />
    </TabPanel>
    <TabPanel value={activeTab} index={1}>
      <UserMessagesTab />
    </TabPanel>
  </Box>
);
```

#### ✅ After (PageTabs Implementation)
```typescript
const tabs: TabDefinition[] = [
  {
    key: 'details',
    label: 'Details',
    component: <UserDetailsTab />
  },
  {
    key: 'messages', 
    label: 'Messages',
    component: <UserMessagesTab />
  }
];

return <PageTabs tabs={tabs} entityName={userName} />;
```

### Migration Steps

1. **Replace Tab Imports**:
   ```typescript
   // Remove old imports
   - import { Tabs, Tab, Box } from '@mui/material';
   
   // Add new import
   + import { PageTabs, TabDefinition } from '../components/common';
   ```

2. **Convert Tab State**:
   ```typescript
   // Remove manual state management
   - const [activeTab, setActiveTab] = useState(0);
   - const [searchParams, setSearchParams] = useSearchParams();
   ```

3. **Define Tab Configuration**:
   ```typescript
   + const tabs: TabDefinition[] = [
   +   { key: 'tab1', label: 'Tab 1', component: <Tab1Component /> },
   +   { key: 'tab2', label: 'Tab 2', component: <Tab2Component /> }
   + ];
   ```

4. **Replace Rendering Logic**:
   ```typescript
   // Replace complex manual rendering
   - <Tabs><Tab /></Tabs>
   - <TabPanel>...</TabPanel>
   
   // With simple PageTabs usage
   + <PageTabs tabs={tabs} />
   ```

## Best Practices

### 🏷️ Tab Key Naming

```typescript
// ✅ Good - lowercase, hyphenated
{ key: 'user-details', label: 'User Details' }
{ key: 'billing-history', label: 'Billing History' }
{ key: 'password-reset', label: 'Password Reset' }

// ❌ Avoid - camelCase, underscores, spaces
{ key: 'userDetails', label: 'User Details' }
{ key: 'billing_history', label: 'Billing History' }
{ key: 'password reset', label: 'Password Reset' }
```

### 📊 Entity Naming for Breadcrumbs

```typescript
// ✅ Good - descriptive, user-friendly
entityName={user.displayName || user.userName}     // "John Doe"
entityName={account.companyName}                   // "Acme Corp"
entityName={survey.title}                          // "Customer Satisfaction"

// ❌ Avoid - generic or technical names
entityName={`User ${user.id}`}                    // "User 123"
entityName="Entity"                                // Too generic
entityName={user.email}                           // Technical, not user-friendly
```

### 🎯 Tab Organization

Order tabs by importance and usage frequency:

```typescript
const tabs: TabDefinition[] = [
  // 1. Most important/overview first
  { key: 'overview', label: 'Overview', component: <Overview /> },
  
  // 2. Primary functionality
  { key: 'details', label: 'Details', component: <Details /> },
  { key: 'users', label: 'Users', component: <Users /> },
  
  // 3. Secondary features
  { key: 'reports', label: 'Reports', component: <Reports /> },
  { key: 'history', label: 'History', component: <History /> },
  
  // 4. Administrative/settings last
  { key: 'settings', label: 'Settings', component: <Settings /> },
  { key: 'admin', label: 'Admin', component: <Admin /> }
];
```

### ⚡ Performance Tips

1. **Use lazy loading for heavy tabs**:
   ```typescript
   const LazyAnalytics = lazy(() => import('./AnalyticsTab'));
   ```

2. **Memoize tab definitions** when they don't change:
   ```typescript
   const tabs = useMemo(() => [
     { key: 'details', label: 'Details', component: <DetailsTab /> }
   ], []);
   ```

3. **Pass minimal props** to tab components to avoid unnecessary re-renders

### 🧪 Testing Considerations

```typescript
// Test URL synchronization
it('should update URL when tab changes', () => {
  // Test implementation
});

// Test breadcrumb integration
it('should update breadcrumbs with entity name', () => {
  // Test implementation
});

// Test error handling
it('should display error messages', () => {
  // Test implementation
});
```

## Troubleshooting

### Common Issues

1. **Tabs not syncing with URL**
   - Ensure tab keys are unique and URL-friendly
   - Check `useSearchParams` is available in component context

2. **Breadcrumbs not updating**
   - Verify `entityName` prop is provided
   - Check breadcrumb context is properly configured

3. **Tab content not rendering**
   - Ensure tab components are valid React elements
   - Check console for component render errors

4. **Performance issues with many tabs**
   - Implement lazy loading for heavy components
   - Use `React.memo()` for tab components
   - Consider pagination for very large tab sets

### Debug Tips

- Check browser Network tab for failed API calls in tab components
- Use React DevTools to inspect component state and props
- Monitor console for any JavaScript errors
- Test URL changes manually to verify synchronization

## Support

For additional help:
- 📚 **Component Documentation**: See `src/components/common/PageTabs.md`
- 🐛 **Bug Reports**: Create issue in project repository
- 💡 **Feature Requests**: Discuss with development team
- 🤝 **Code Review**: Submit PR for complex implementations
