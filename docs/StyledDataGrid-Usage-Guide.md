# StyledDataGrid Usage Guide

## Overview

This document provides a comprehensive guide for implementing and using the `StyledDataGrid` component in the Opinion Admin UI application. The `StyledDataGrid` is a modernized wrapper around MUI's DataGrid that provides consistent styling, enhanced functionality, and improved user experience.

## Table of Contents

1. [Basic Implementation](#basic-implementation)
2. [Modern Patterns](#modern-patterns)
3. [Column Management](#column-management)
4. [Pagination & Selection](#pagination--selection)
5. [Toolbar Integration](#toolbar-integration)
6. [Advanced Features](#advanced-features)
7. [Migration from Legacy Tables](#migration-from-legacy-tables)
8. [Best Practices](#best-practices)

## Basic Implementation

### Required Imports

```typescript
import {
  GridColDef,
  GridRowParams,
  GridActionsCellItem,
  GridPaginationModel,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
import { StyledDataGrid, StyledDataGridToolbar } from './common';
```

### State Management

```typescript
// Pagination state (modern approach)
const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
  page: 0,
  pageSize: 10,
});

// Column visibility state
const [columnVisibilityModel, setColumnVisibilityModel] = useState({
  id: true,
  name: true,
  status: true,
  actions: true,
  // ... other columns
});

// Selection state (if needed)
const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
```

## Modern Patterns

### 1. Pagination Handler

```typescript
const handlePaginationModelChange = (model: GridPaginationModel) => {
  setPaginationModel(model);
};
```

### 2. Search/Filter Integration

```typescript
const handleFilterChange = (value: string) => {
  setSearchTerm(value);
  setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
};
```

### 3. Data Mapping for DataGrid

```typescript
// Map data to include required 'id' field
const filteredData = rawData.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase())
).map(item => ({
  ...item,
  id: item.uniqueIdentifier // DataGrid requires 'id' field
}));
```

## Column Management

### Column Definition Structure

```typescript
const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: '#',
    width: 80,
    type: 'number',
    headerAlign: 'right',
    align: 'right',
    renderCell: (params) => (
      <Link
        component="button"
        onClick={() => navigate(`/details/${params.row.id}`)}
        sx={{ textDecoration: 'none' }}
      >
        {params.row.id}
      </Link>
    )
  },
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      // Custom rendering with fade effect
      <Box sx={{ 
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '30px',
          height: '100%',
          background: 'linear-gradient(to right, transparent, white)',
          pointerEvents: 'none',
        }
      }}>
        <Link
          component="button"
          onClick={() => navigate(`/details/${params.row.id}`)}
          sx={{ 
            textDecoration: 'none',
            display: 'block',
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            pr: '30px',
          }}
          title={params.row.name}
        >
          {params.row.name}
        </Link>
      </Box>
    )
  },
  {
    field: 'status',
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
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 80,
    getActions: (params: GridRowParams) => [
      <GridActionsCellItem
        key="view"
        icon={<ViewIcon />}
        label="View Details"
        onClick={() => navigate(`/details/${params.row.id}`)}
      />
    ]
  }
];
```

### Column Visibility Management

```typescript
// Column visibility handlers
const handleColumnToggle = (field: string) => {
  setColumnVisibilityModel(prev => ({
    ...prev,
    [field]: !prev[field as keyof typeof prev]
  }));
};

const handleShowAllColumns = () => {
  setColumnVisibilityModel({
    id: true,
    name: true,
    status: true,
    actions: true,
    // ... all columns set to true
  });
};

const handleHideAllColumns = () => {
  setColumnVisibilityModel({
    id: true, // Keep essential columns
    name: true,
    status: false,
    actions: true,
    // ... optional columns set to false
  });
};
```

## Pagination & Selection

### Basic DataGrid Props

```typescript
<StyledDataGrid
  rows={filteredData}
  columns={columns}
  loading={loading}
  paginationModel={paginationModel}
  onPaginationModelChange={handlePaginationModelChange}
  pageSizeOptions={[5, 10, 25, 50, 100]}
  getRowId={(row) => row.uniqueIdentifier}
  columnVisibilityModel={columnVisibilityModel}
  onColumnVisibilityModelChange={setColumnVisibilityModel}
  // Selection props (optional)
  rowSelectionModel={selectedRows}
  onRowSelectionModelChange={setSelectedRows}
  checkboxSelection
  disableRowSelectionOnClick
/>
```

### Without Selection (Read-only)

```typescript
<StyledDataGrid
  rows={filteredData}
  columns={columns}
  loading={loading}
  paginationModel={paginationModel}
  onPaginationModelChange={handlePaginationModelChange}
  disableRowSelectionOnClick
  pageSizeOptions={[10, 25, 50, 100]}
  getRowId={(row) => row.id}
/>
```

## Toolbar Integration

### Basic Toolbar with Search

```typescript
slots={{
  toolbar: () => (
    <StyledDataGridToolbar>
      <TextField
        size="small"
        placeholder="Search..."
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
  ),
}}
```

### Enhanced Toolbar with Column Management

```typescript
slots={{
  toolbar: () => (
    <StyledDataGridToolbar>
      <TextField
        size="small"
        placeholder="Search..."
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
      <Button
        size="small"
        startIcon={<ViewColumnIcon />}
        onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
        sx={{ ml: 'auto' }}
      >
        Manage Columns
      </Button>
    </StyledDataGridToolbar>
  ),
}}
```

## Advanced Features

### Column Management Menu

```typescript
<Menu
  anchorEl={columnMenuAnchor}
  open={Boolean(columnMenuAnchor)}
  onClose={() => setColumnMenuAnchor(null)}
  PaperProps={{
    sx: { minWidth: 250, maxHeight: 400 }
  }}
>
  <MenuItem onClick={handleShowAllColumns} sx={{ fontWeight: 'bold' }}>
    Show All Columns
  </MenuItem>
  <MenuItem onClick={handleHideAllColumns} sx={{ fontWeight: 'bold' }}>
    Hide All Columns
  </MenuItem>
  <Divider />
  {Object.entries(columnDisplayNames).map(([field, displayName]) => {
    const isEssential = field === 'id' || field === 'name' || field === 'actions';
    return (
      <MenuItem key={field} sx={{ py: 0.5 }}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={columnVisibilityModel[field]}
              onChange={() => !isEssential && handleColumnToggle(field)}
              disabled={isEssential}
            />
          }
          label={
            <Typography 
              variant="body2" 
              sx={{ 
                color: isEssential ? 'text.secondary' : 'text.primary',
                fontStyle: isEssential ? 'italic' : 'normal'
              }}
            >
              {displayName} {isEssential && '(required)'}
            </Typography>
          }
          sx={{ m: 0, width: '100%' }}
        />
      </MenuItem>
    );
  })}
</Menu>
```

### Custom Styling

```typescript
sx={{ 
  height: '100%',
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '& .MuiDataGrid-cell--textLeft': {
    textAlign: 'left',
  }
}}
```

## Migration from Legacy Tables

### Before (Legacy MUI Table)

```typescript
// Old approach with separate states
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);
const [sortField, setSortField] = useState('name');
const [sortDirection, setSortDirection] = useState('asc');

// Manual sorting/pagination logic
const sortedData = data.sort((a, b) => {
  // Complex sorting logic...
});

const paginatedData = sortedData.slice(
  page * rowsPerPage,
  page * rowsPerPage + rowsPerPage
);

// Complex JSX with Table components
<Table>
  <TableHead>
    <TableRow>
      <TableCell>
        <TableSortLabel /* ... */>Name</TableSortLabel>
      </TableCell>
      // ... more cells
    </TableRow>
  </TableHead>
  <TableBody>
    {paginatedData.map(row => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        // ... more cells
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### After (Modern StyledDataGrid)

```typescript
// Modern approach with single pagination state
const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
  page: 0,
  pageSize: 10,
});

// Simple column definitions
const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  // ... more columns
];

// Clean JSX
<StyledDataGrid
  rows={data}
  columns={columns}
  paginationModel={paginationModel}
  onPaginationModelChange={setPaginationModel}
  // DataGrid handles sorting, pagination, etc. automatically
/>
```

## Best Practices

### 1. Essential Columns
Always keep these columns visible and prevent users from hiding them:
- ID/identifier column
- Primary name/title column  
- Actions column

### 2. Column Widths
- Use `flex: 1` for flexible columns that should expand
- Use fixed `width` for columns with consistent content (IDs, status chips)
- Use `minWidth` to prevent columns from becoming too narrow

### 3. Cell Rendering
- Use `renderCell` for custom formatting, links, and interactive elements
- Apply fade effects for long text content to improve UX
- Use `Chip` components for status indicators

### 4. Performance
- Implement proper `getRowId` when your data doesn't have an `id` field
- Use `loading` prop to show loading states
- Consider server-side pagination for large datasets

### 5. Accessibility
- Always provide meaningful `title` attributes for truncated content
- Use proper semantic elements (Links for navigation)
- Ensure adequate color contrast for status indicators

### 6. State Management
- Reset pagination page to 0 when filtering
- Use descriptive state variable names
- Initialize states with sensible defaults

### 7. User Experience
- Provide visual feedback for interactive elements
- Use consistent styling across all DataGrid implementations
- Include helpful tooltips and labels

## Common Patterns

### Search Integration
```typescript
// Filter data and reset pagination
const filteredData = data.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase())
);

const handleSearch = (value: string) => {
  setSearchTerm(value);
  setPaginationModel(prev => ({ ...prev, page: 0 }));
};
```

### Loading States
```typescript
// Show loading during data fetch
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchData();
      setData(data);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

### Error Handling
```typescript
// Display errors gracefully
if (error) {
  return (
    <Alert severity="error">
      {error}
    </Alert>
  );
}
```

## Conclusion

The `StyledDataGrid` provides a modern, consistent, and feature-rich alternative to legacy MUI Table implementations. By following these patterns and best practices, you can create highly functional and user-friendly data displays that integrate seamlessly with the Opinion Admin UI design system.

Key benefits:
- ✅ Consistent styling across the application
- ✅ Built-in sorting, filtering, and pagination
- ✅ Column management capabilities
- ✅ Improved performance and maintainability
- ✅ Enhanced user experience with modern interactions
