# Breadcrumb Layout Components

The Opinion Admin UI features a comprehensive breadcrumb navigation system that provides users with clear navigation paths and context awareness throughout the application. The breadcrumbs are permanently displayed in the global title area of the AppBar and automatically adapt to the current route and context.

## Overview

The breadcrumb system consists of several interconnected components:
- **Breadcrumb Component**: The visual breadcrumb component
- **BreadcrumbContext**: Global state management for breadcrumb data
- **BreadcrumbUtils**: Utility functions for generating breadcrumbs
- **MainLayout Integration**: Permanent display in the AppBar

## Architecture

### Component Hierarchy
```
MainLayout (AppBar)
├── Breadcrumb Component
│   ├── MUI Breadcrumbs
│   └── Navigation Links
├── BreadcrumbContext (State Management)
└── BreadcrumbUtils (Logic)
```

### Key Features
- ✅ **Permanent Display**: Always visible in the global AppBar title area
- ✅ **Automatic Generation**: Route-based breadcrumb generation
- ✅ **Dynamic Content**: Supports user names, account names, and contextual data
- ✅ **Custom Override**: Pages can set custom breadcrumbs
- ✅ **Responsive Design**: Adapts to different screen sizes
- ✅ **Accessible**: Proper ARIA labels and keyboard navigation

## Components

### 1. Breadcrumb Component (`src/components/common/Breadcrumb.tsx`)

The main visual component that renders the breadcrumb navigation.

#### Props
```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[];
  sx?: any; // MUI sx prop for styling
}

interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}
```

#### Usage
```tsx
import Breadcrumb from '../components/common/Breadcrumb';

<Breadcrumb
  items={[
    { label: 'Users', path: '/users' },
    { label: 'John Doe', path: '/users/123' },
    { label: 'User Details' } // Last item without path (current page)
  ]}
  sx={{ mb: 0 }} // Custom styling
/>
```

#### Features
- **Interactive Links**: Clickable navigation items (except the last one)
- **Hover Effects**: Visual feedback on hover
- **Custom Styling**: Supports MUI sx prop for customization
- **NavigateNext Icon**: Uses MUI icons for separators

### 2. BreadcrumbContext (`src/contexts/BreadcrumbContext.tsx`)

Global state management for breadcrumb data and page titles.

#### Context Interface
```typescript
interface BreadcrumbContextType {
  customBreadcrumbs: BreadcrumbItem[] | null;
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  clearBreadcrumbs: () => void;
  setBreadcrumbData: (data: BreadcrumbData) => void;
  breadcrumbData: BreadcrumbData;
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

interface BreadcrumbData {
  userName?: string;
  accountName?: string;
  collectorName?: string;
  currentTab?: string;
}
```

#### Hooks

##### `useBreadcrumbContext()`
Access the full breadcrumb context.

```tsx
import { useBreadcrumbContext } from '../contexts/BreadcrumbContext';

const { 
  customBreadcrumbs, 
  setBreadcrumbs, 
  breadcrumbData, 
  setBreadcrumbData 
} = useBreadcrumbContext();
```

##### `useSetBreadcrumbs()`
Convenient hook for pages to set breadcrumbs.

```tsx
import { useSetBreadcrumbs } from '../contexts/BreadcrumbContext';

const { setBreadcrumbs, setBreadcrumbData, clearBreadcrumbs } = useSetBreadcrumbs();

// Set custom breadcrumbs
setBreadcrumbs([
  { label: 'Custom', path: '/custom' },
  { label: 'Page' }
]);

// Set dynamic data for automatic generation
setBreadcrumbData({
  userName: 'John Doe',
  currentTab: 'details'
});
```

### 3. BreadcrumbUtils (`src/utils/breadcrumbUtils.ts`)

Utility functions for generating breadcrumbs automatically based on routes.

#### Key Functions

##### `useBreadcrumbs(pathname, data)`
Main function used by MainLayout to generate breadcrumbs.

```typescript
const breadcrumbs = useBreadcrumbs('/users/123', {
  userName: 'John Doe',
  currentTab: 'messages'
});
// Returns: [{ label: 'Users', path: '/users' }, { label: 'John Doe' }, { label: 'Messages' }]
```

##### `generateBreadcrumbs(pathname, customItems)`
Generate automatic breadcrumbs from route path.

##### `generateUserDetailsBreadcrumbs(userName, currentTab)`
Generate breadcrumbs for user detail pages.

##### `generateAccountDetailsBreadcrumbs(accountName, currentTab)`
Generate breadcrumbs for account detail pages.

##### `generateCollectorDetailsBreadcrumbs(collectorName, accountName)`
Generate breadcrumbs for collector detail pages.

#### Route Configuration
The system uses a route configuration to automatically generate breadcrumbs:

```typescript
const routeConfigs: RouteConfig[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/users', label: 'Users' },
  { path: '/users/:id', label: 'User Details', parent: '/users', dynamic: true },
  { path: '/accounts', label: 'Accounts' },
  { path: '/accounts/:id', label: 'Account Details', parent: '/accounts', dynamic: true },
  // ... more routes
];
```

## Integration with MainLayout

The breadcrumbs are permanently integrated into the MainLayout's AppBar:

```tsx
// src/layouts/MainLayout.tsx
<AppBar>
  <Toolbar>
    {/* Breadcrumbs in Title Area */}
    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
      <Breadcrumb
        items={autoBreadcrumbs.length > 0 ? autoBreadcrumbs : [{ label: "Home", path: "/" }]}
        sx={{
          mb: 0, // Remove default margin for proper centering
          display: "flex",
          alignItems: "center",
          // ... styling for AppBar integration
        }}
      />
    </Box>
  </Toolbar>
</AppBar>
```

### Key Integration Features
- **Permanent Display**: Always visible, no scroll-based hiding
- **Vertical Centering**: Properly aligned with AppBar elements
- **Responsive**: Adapts to drawer collapse/expand states
- **Consistent Styling**: Matches AppBar theme and colors

## Usage Patterns

### 1. Automatic Breadcrumbs (Default)
Most pages use automatic breadcrumb generation based on the current route:

```tsx
// No code needed - breadcrumbs are generated automatically
// For route: /users/123
// Displays: Users > User Details
```

### 2. Dynamic Data Enhancement
Pages can provide additional data to enhance automatic breadcrumbs:

```tsx
import { useSetBreadcrumbs } from '../contexts/BreadcrumbContext';
import { useEffect } from 'react';

const UserDetailsPage = ({ userId }) => {
  const { setBreadcrumbData } = useSetBreadcrumbs();
  
  useEffect(() => {
    // Fetch user data and set breadcrumb context
    fetchUser(userId).then(user => {
      setBreadcrumbData({
        userName: user.name,
        currentTab: 'details'
      });
    });
  }, [userId, setBreadcrumbData]);

  // Component renders automatically show: Users > John Doe > User Details
};
```

### 3. Custom Breadcrumbs Override
Pages can set completely custom breadcrumbs:

```tsx
import { useSetBreadcrumbs } from '../contexts/BreadcrumbContext';
import { useEffect } from 'react';

const CustomPage = () => {
  const { setBreadcrumbs } = useSetBreadcrumbs();
  
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Settings', path: '/settings' },
      { label: 'Advanced', path: '/settings/advanced' },
      { label: 'Custom Configuration' } // Current page
    ]);
    
    // Cleanup on unmount
    return () => clearBreadcrumbs();
  }, [setBreadcrumbs]);
};
```

### 4. Tab-Aware Breadcrumbs
For pages with tabs, breadcrumbs can reflect the current tab:

```tsx
const AccountDetailsPage = ({ accountId, activeTab }) => {
  const { setBreadcrumbData } = useSetBreadcrumbs();
  
  useEffect(() => {
    fetchAccount(accountId).then(account => {
      setBreadcrumbData({
        accountName: account.name,
        currentTab: activeTab // 'details', 'users', 'billing', etc.
      });
    });
  }, [accountId, activeTab, setBreadcrumbData]);
  
  // Breadcrumbs automatically show: Accounts > Acme Corp > Billing
};
```

## Styling and Theming

### Default Styling
The breadcrumbs use consistent styling that matches the AppBar theme:

```typescript
const defaultStyles = {
  color: '#333',
  fontWeight: 600,
  fontSize: '14px',
  '&:hover': {
    textDecoration: 'underline',
    color: '#f7931e' // Brand orange
  }
};
```

### AppBar Integration Styles
Special styling for AppBar integration:

```typescript
const appBarStyles = {
  mb: 0, // Remove default margin
  display: 'flex',
  alignItems: 'center',
  '& .MuiBreadcrumbs-root': {
    display: 'flex',
    alignItems: 'center'
  },
  '& .MuiBreadcrumbs-ol': {
    display: 'flex',
    alignItems: 'center'
  }
};
```

### Custom Styling
Pages can override styles using the `sx` prop:

```tsx
<Breadcrumb
  items={breadcrumbs}
  sx={{
    '& .MuiLink-root': {
      color: 'primary.main',
      fontSize: '16px'
    }
  }}
/>
```

## Accessibility

The breadcrumb system includes proper accessibility features:

- **ARIA Labels**: `aria-label="breadcrumb"` on navigation
- **Semantic HTML**: Uses proper navigation and list elements
- **Keyboard Navigation**: Links are keyboard accessible
- **Screen Reader Support**: Clear navigation structure

## Best Practices

### 1. Keep Breadcrumbs Concise
- Maximum 4-5 levels deep
- Use clear, descriptive labels
- Avoid overly long text

### 2. Handle Loading States
```tsx
const UserDetailsPage = ({ userId }) => {
  const [user, setUser] = useState(null);
  const { setBreadcrumbData } = useSetBreadcrumbs();
  
  useEffect(() => {
    if (user) {
      setBreadcrumbData({
        userName: user.name,
        currentTab: 'details'
      });
    }
  }, [user, setBreadcrumbData]);
};
```

### 3. Clean Up on Unmount
```tsx
useEffect(() => {
  // Set breadcrumbs
  setBreadcrumbs(customBreadcrumbs);
  
  return () => {
    clearBreadcrumbs(); // Clean up when component unmounts
  };
}, []);
```

### 4. Use Meaningful Labels
```tsx
// Good
{ label: 'User Details', path: '/users/123' }

// Avoid
{ label: 'Details', path: '/users/123' }
{ label: 'ID: 123', path: '/users/123' }
```

## Migration Notes

### From Previous Implementation
The current breadcrumb system has been updated with the following changes:

1. **Permanent Display**: Breadcrumbs no longer hide/show based on scroll
2. **AppBar Integration**: Moved from content area to global title area
3. **Improved Centering**: Better vertical alignment in AppBar
4. **Enhanced Context**: More robust state management with BreadcrumbContext

### Breaking Changes
- Removed scroll-based `isScrolledUp` behavior
- Breadcrumbs now permanently in AppBar instead of content area
- `pageTitle` context may not be used in some scenarios

## Troubleshooting

### Common Issues

#### Breadcrumbs Not Updating
```tsx
// Ensure you're using the context correctly
const { setBreadcrumbData } = useSetBreadcrumbs();

// And data is set after async operations
useEffect(() => {
  fetchData().then(data => {
    setBreadcrumbData({ userName: data.name });
  });
}, []);
```

#### Styling Issues
```tsx
// Override default margin for custom layouts
<Breadcrumb
  items={items}
  sx={{ mb: 0 }} // Remove default margin
/>
```

#### Navigation Not Working
```tsx
// Ensure paths are correct
{ label: 'Users', path: '/users' } // Correct
{ label: 'Users', path: 'users' }  // Missing leading slash
```

### Performance Considerations
- Breadcrumb generation is optimized and cached
- Context updates are debounced to prevent excessive re-renders
- Route matching uses efficient regex patterns

## Examples

### Complete Implementation Example
```tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSetBreadcrumbs } from '../contexts/BreadcrumbContext';

const UserDetailsPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setBreadcrumbData, clearBreadcrumbs } = useSetBreadcrumbs();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.getUser(userId);
        setUser(userData);
        
        // Set breadcrumb data for automatic generation
        setBreadcrumbData({
          userName: userData.name,
          currentTab: 'details'
        });
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Cleanup on unmount
    return () => {
      clearBreadcrumbs();
    };
  }, [userId, setBreadcrumbData, clearBreadcrumbs]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Page content - breadcrumbs are automatically shown in AppBar */}
      <h1>{user.name}</h1>
      {/* ... rest of component */}
    </div>
  );
};

export default UserDetailsPage;
```

This comprehensive breadcrumb system provides a robust, accessible, and user-friendly navigation experience throughout the Opinion Admin UI application.
