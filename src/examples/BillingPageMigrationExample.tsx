/**
 * MIGRATION EXAMPLE: BillingPage using standardized TabContainer
 * 
 * This example shows how to migrate BillingPage.tsx to use the new standardized
 * TabContainer and useTabNavigation hook instead of custom implementations.
 * 
 * Key improvements:
 * 1. Removes duplicate TabPanel implementation
 * 2. Uses enhanced useTabNavigation hook with URL persistence
 * 3. Standardized accessibility attributes
 * 4. Consistent styling across all tab implementations
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Link,
  Pagination,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { opinionApiService } from "../services";
import { TabContainer, TabConfig } from "../components/common";
import { useTabNavigation } from "../hooks/useTabNavigation";

interface Invoice {
  invoiceId: number;
  invoiceDate: string;
  fromDate: string;
  toDate: string;
  accountId: number;
  accountName: string;
  statusId: number;
  amount: number;
}

// Custom tab names for this page
const BILLING_TAB_NAMES = ['invoices', 'uninvoiced'] as const;

const BillingPageMigrated: React.FC = () => {
  const navigate = useNavigate();

  // Use the enhanced useTabNavigation hook
  const { activeTab, handleTabChange } = useTabNavigation({
    tabNames: BILLING_TAB_NAMES,
    persistInUrl: true,
    urlParamName: 'tab',
    onTabChange: (newTab, oldTab) => {
      // Clear selections when switching tabs
      setSelectedInvoices([]);
      setCurrentPage(1);
      console.log(`Tab changed from ${oldTab} to ${newTab}`);
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [activeTab]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tab 0 = Invoice List (all statuses), Tab 1 = UnInvoiced List (draft only)
      const statusId = activeTab === 1 ? 1 : null;
      const response = await opinionApiService.getAllInvoices({ statusId });

      setInvoices(response.list || []);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      setError("Failed to load invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(filteredInvoices.map((invoice) => invoice.invoiceId));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (invoiceId: number, checked: boolean) => {
    if (checked) {
      setSelectedInvoices((prev) => [...prev, invoiceId]);
    } else {
      setSelectedInvoices((prev) => prev.filter((id) => id !== invoiceId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedInvoices.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    try {
      await opinionApiService.deleteBillingInvoices(selectedInvoices);
      setDeleteDialogOpen(false);
      setSelectedInvoices([]);
      loadInvoices();
    } catch (err) {
      console.error("Failed to delete invoices:", err);
      setError("Failed to delete invoices");
    }
  };

  const getInvoiceStatus = (statusId: number): string => {
    switch (statusId) {
      case 1:
        return "Draft";
      case 2:
        return "Open";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (
    statusId: number,
  ): "default" | "primary" | "success" => {
    switch (statusId) {
      case 1:
        return "default";
      case 2:
        return "primary";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceId.toString().includes(searchTerm) ||
      invoice.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getInvoiceStatus(invoice.statusId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, filteredInvoices.length);

  // Create invoice table component
  const createInvoiceTable = (showDraftsOnly: boolean = false) => (
    <>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="error"
          disabled={selectedInvoices.length === 0}
          onClick={handleDeleteSelected}
          sx={{ mr: 2 }}
        >
          Delete ({selectedInvoices.length})
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedInvoices.length === paginatedInvoices.length &&
                      paginatedInvoices.length > 0
                    }
                    indeterminate={
                      selectedInvoices.length > 0 &&
                      selectedInvoices.length < paginatedInvoices.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell align="right" sx={{ width: 60 }}>
                  #
                </TableCell>
                <TableCell>Invoice Date</TableCell>
                <TableCell>From Date</TableCell>
                <TableCell>To Date</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices
                .filter(invoice => !showDraftsOnly || invoice.statusId === 1)
                .map((invoice) => (
                <TableRow key={invoice.invoiceId}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedInvoices.includes(invoice.invoiceId)}
                      onChange={(e) =>
                        handleSelectInvoice(invoice.invoiceId, e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell align="right">{invoice.invoiceId}</TableCell>
                  <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                  <TableCell>{formatDate(invoice.fromDate)}</TableCell>
                  <TableCell>{formatDate(invoice.toDate)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/accounts/${invoice.accountId}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/accounts/${invoice.accountId}`);
                      }}
                    >
                      {invoice.accountName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getInvoiceStatus(invoice.statusId)}
                      color={getStatusColor(invoice.statusId)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );

  // Configure tabs using the new TabConfig interface
  const tabs: TabConfig[] = [
    {
      label: "Invoice List",
      content: createInvoiceTable(false),
    },
    {
      label: "UnInvoiced List", 
      content: createInvoiceTable(true),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Billing
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Use the standardized TabContainer */}
      <TabContainer
        tabs={tabs}
        value={activeTab}
        onChange={handleTabChange}
        id="billing-tabs"
        variant="standard"
        divider={true}
        sx={{ mb: 2 }}
      />

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedInvoices.length} selected
            invoice(s)?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingPageMigrated;
