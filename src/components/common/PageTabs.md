# PageTabs Component

A reusable tabbed interface component that provides URL synchronization, breadcrumb integration, and consistent styling across the application.

## Features

- ✅ **URL Synchronization**: Automatically syncs active tab with URL parameters
- ✅ **Breadcrumb Integration**: Updates breadcrumbs when tabs change
- ✅ **Built-in Alerts**: Success and error message support
- ✅ **Responsive Design**: Mobile-friendly scrollable tabs
- ✅ **Consistent Styling**: Matches application design system
- ✅ **TypeScript Support**: Full type safety

## Installation

```typescript
import { PageTabs, TabDefinition } from '../../components/common';
```

## Basic Usage

```typescript
import React from 'react';
import { PageTabs, TabDefinition } from '../../components/common';
import { Box } from '@mui/material';

const MyPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tabs: TabDefinition[] = [
    {
      key: 'overview',
      label: 'Overview',
      component: <OverviewTab />
    },
    {
      key: 'settings',
      label: 'Settings',
      component: <SettingsTab />
    },
    {
      key: 'history',
      label: 'History',
      component: <HistoryTab />
    }
  ];

  return (
    <Box className="content-container">
      <PageTabs
        tabs={tabs}
        entityName="User Profile"
        error={error}
        success={success}
        onErrorClose={() => setError(null)}
        onSuccessClose={() => setSuccess(null)}
      />
    </Box>
  );
};
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `TabDefinition[]` | **Required** | Array of tab configurations |
| `entityName` | `string` | `undefined` | Entity name for breadcrumb integration |
| `defaultTab` | `number` | `0` | Index of the default active tab |
| `error` | `string \| null` | `null` | Error message to display |
| `success` | `string \| null` | `null` | Success message to display |
| `onErrorClose` | `() => void` | `undefined` | Callback when error alert is closed |
| `onSuccessClose` | `() => void` | `undefined` | Callback when success alert is closed |
| `className` | `string` | `undefined` | CSS class name for the container |
| `sx` | `any` | `undefined` | Material-UI sx props for styling |

### TabDefinition Interface

```typescript
interface TabDefinition {
  key: string;      // URL parameter key (e.g., 'details', 'messages')
  label: string;    // Display label for the tab
  component: ReactNode;  // React component to render in the tab panel
}
```

## URL Synchronization

The component automatically handles URL synchronization:

- **Default tab**: No URL parameter (e.g., `/users/123`)
- **Other tabs**: Adds tab parameter (e.g., `/users/123?tab=messages`)
- **Browser navigation**: Back/forward buttons work correctly
- **Direct links**: Users can bookmark and share specific tabs

### URL Examples

```
/users/123           → Shows default tab (index 0)
/users/123?tab=messages  → Shows 'messages' tab
/accounts/456?tab=billing → Shows 'billing' tab
```

## Breadcrumb Integration

When `entityName` is provided, the component automatically updates breadcrumbs:

```typescript
// Updates breadcrumbs with current tab
setBreadcrumbData({
  entityName: entityName,
  currentTab: currentTabKey
});
```

### Breadcrumb Examples

```typescript
// User page breadcrumbs
entityName="John Doe"
// Results in: Home > Users > John Doe > Messages

// Account page breadcrumbs  
entityName="Acme Corp"
// Results in: Home > Accounts > Acme Corp > Billing
```

## Advanced Usage

### With State Management

```typescript
const UserDetailsPage: React.FC = () => {
  const { id: userId } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    setSuccess('User updated successfully');
  };

  const tabs: TabDefinition[] = [
    {
      key: 'details',
      label: 'User Details',
      component: <UserDetailsTab 
        user={user} 
        onUserUpdate={handleUserUpdate} 
        onError={setError}
      />
    },
    {
      key: 'messages',
      label: 'Messages',
      component: <UserMessagesTab 
        userId={userId!} 
        onError={setError}
      />
    }
  ];

  return (
    <Box className="content-container">
      <PageTabs
        tabs={tabs}
        entityName={user?.displayName || user?.userName}
        error={error}
        success={success}
        onErrorClose={() => setError(null)}
        onSuccessClose={() => setSuccess(null)}
      />
    </Box>
  );
};
```

### With Custom Styling

```typescript
<PageTabs
  tabs={tabs}
  entityName="Account Settings"
  className="custom-tabs"
  sx={{
    '& .MuiTab-root': {
      fontSize: '16px',
      fontWeight: 600,
    },
    '& .MuiTabs-indicator': {
      height: '3px',
      backgroundColor: 'primary.main',
    }
  }}
/>
```

### With Dynamic Tabs

```typescript
const DynamicTabsPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  
  // Conditionally include tabs based on user permissions
  const tabs: TabDefinition[] = [
    {
      key: 'profile',
      label: 'Profile',
      component: <ProfileTab user={user} />
    },
    ...(user?.isAdmin ? [{
      key: 'admin',
      label: 'Admin Settings',
      component: <AdminSettingsTab />
    }] : []),
    {
      key: 'preferences',
      label: 'Preferences',
      component: <PreferencesTab />
    }
  ];

  return (
    <PageTabs
      tabs={tabs}
      entityName={user?.name}
    />
  );
};
```

## Error Handling

The component provides built-in error and success message handling:

```typescript
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);

// In your tab components
const handleAction = async () => {
  try {
    await someApiCall();
    setSuccess('Action completed successfully');
  } catch (err) {
    setError('Failed to complete action');
  }
};

<PageTabs
  tabs={tabs}
  error={error}
  success={success}
  onErrorClose={() => setError(null)}
  onSuccessClose={() => setSuccess(null)}
/>
```

## Best Practices

### Tab Key Naming

Use lowercase, hyphenated keys for consistency:

```typescript
// ✅ Good
{ key: 'user-details', label: 'User Details' }
{ key: 'billing-history', label: 'Billing History' }

// ❌ Avoid
{ key: 'UserDetails', label: 'User Details' }
{ key: 'billing_history', label: 'Billing History' }
```

### Entity Naming

Use descriptive entity names for better breadcrumbs:

```typescript
// ✅ Good
entityName={user.displayName || user.userName}  // "John Doe"
entityName={account.accountName}                // "Acme Corporation"

// ❌ Avoid
entityName={`User ${user.id}`}                 // "User 123"
entityName="Entity"                             // Too generic
```

### Tab Organization

Order tabs by importance and frequency of use:

```typescript
const tabs: TabDefinition[] = [
  // Most important/frequently used first
  { key: 'overview', label: 'Overview', component: <Overview /> },
  { key: 'details', label: 'Details', component: <Details /> },
  
  // Less frequently used
  { key: 'history', label: 'History', component: <History /> },
  { key: 'settings', label: 'Settings', component: <Settings /> },
  
  // Administrative/dangerous actions last
  { key: 'admin', label: 'Admin', component: <AdminPanel /> }
];
```

### Performance Optimization

For heavy components, consider lazy loading:

```typescript
import { lazy, Suspense } from 'react';

const LazyHistoryTab = lazy(() => import('./HistoryTab'));

const tabs: TabDefinition[] = [
  {
    key: 'history',
    label: 'History',
    component: (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyHistoryTab />
      </Suspense>
    )
  }
];
```

## Migration Guide

### From Manual Tab Implementation

**Before:**
```typescript
const [activeTab, setActiveTab] = useState(0);
const [searchParams, setSearchParams] = useSearchParams();

const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
  setActiveTab(newValue);
  // Manual URL handling...
};

return (
  <Box>
    <Tabs value={activeTab} onChange={handleTabChange}>
      <Tab label="Details" />
      <Tab label="Messages" />
    </Tabs>
    {activeTab === 0 && <DetailsTab />}
    {activeTab === 1 && <MessagesTab />}
  </Box>
);
```

**After:**
```typescript
const tabs: TabDefinition[] = [
  { key: 'details', label: 'Details', component: <DetailsTab /> },
  { key: 'messages', label: 'Messages', component: <MessagesTab /> }
];

return <PageTabs tabs={tabs} />;
```

## Troubleshooting

### Common Issues

1. **Tabs not syncing with URL**
   - Ensure tab keys are unique and URL-friendly
   - Check that `useSearchParams` is available in the component context

2. **Breadcrumbs not updating**
   - Verify `entityName` prop is provided
   - Check breadcrumb context is available

3. **Tab content not rendering**
   - Ensure tab components are valid React elements
   - Check for any errors in tab component render methods

### Debugging

Enable debug logging by checking browser developer tools:

```typescript
// The component logs tab changes
console.log('Tab changed to:', tabKey);
```

## Version History

- **v1.0.0**: Initial implementation with URL sync and breadcrumb integration
- **Current**: Enhanced TypeScript support and documentation
