import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { PageTabs } from '../../components/common';
import { TabDefinition } from '../../components/common/PageTabs';

const InvoicesPage: React.FC = () => {
  // Simple placeholder tab content
  const placeholderContent = (
    <Paper sx={{ p: 3 }}>
      <Typography>
        This is a placeholder for the main invoices list page. 
        Currently, invoices are accessible through individual account details pages.
      </Typography>
    </Paper>
  );

  // Define tab configurations
  const tabs: TabDefinition[] = [
    {
      key: 'overview',
      label: 'Overview',
      component: placeholderContent
    }
  ];

  return (
    <PageTabs
      tabs={tabs}
      entityName="Invoices"
      className="content-container"
    />
  );
};

export default InvoicesPage;
