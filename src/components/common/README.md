# Common Components

This directory contains reusable UI components used throughout the Opinion Admin application.

## Components

### PageTabs

A reusable tabbed interface component with URL synchronization and breadcrumb integration.

**Quick Start:**
```typescript
import { PageTabs, TabDefinition } from './common';

const tabs: TabDefinition[] = [
  { key: 'overview', label: 'Overview', component: <OverviewTab /> },
  { key: 'settings', label: 'Settings', component: <SettingsTab /> }
];

<PageTabs tabs={tabs} entityName="User Profile" />
```

📖 **[Full Documentation](./PageTabs.md)**

### StyledDataGrid

Customized Material-UI DataGrid with application-specific styling.

```typescript
import { StyledDataGrid } from './common';

<StyledDataGrid
  rows={data}
  columns={columns}
  autoHeight
  pageSizeOptions={[5, 10, 25, 50, 100]}
/>
```

### StyledDataGridToolbar

Toolbar component for DataGrid with consistent styling.

```typescript
import { StyledDataGridToolbar } from './common';

<StyledDataGridToolbar>
  <TextField placeholder="Search..." />
  <Button variant="outlined">Filter</Button>
</StyledDataGridToolbar>
```

### TabPanel & TabContainer (Legacy)

Legacy tab components - **use PageTabs for new implementations**.

## Usage Guidelines

1. **Prefer PageTabs** for new tabbed interfaces
2. **Use StyledDataGrid** for all data tables
3. **Follow TypeScript** interfaces and prop types
4. **Check documentation** before implementing new patterns

## Contributing

When adding new common components:

1. Create the component file
2. Add comprehensive TypeScript types
3. Export from `index.ts`
4. Write documentation
5. Add usage examples
6. Update this README
