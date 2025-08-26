import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
import { opinionApiService } from "../../services";

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`invoice-tabpanel-${index}`}
      aria-labelledby={`invoice-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState(0);
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
  }, [currentTab]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tab 0 = Invoice List (all statuses), Tab 1 = UnInvoiced List (draft only)
      const statusId = currentTab === 1 ? 1 : null;
      const response = await opinionApiService.getAllInvoices({ statusId });

      setInvoices(response.data?.list || []);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      setError("Failed to load invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setSelectedInvoices([]);
    setCurrentPage(1);
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

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Invoice List" />
          <Tab label="UnInvoiced List" />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
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
                  <TableCell sx={{ width: 120 }}>Invoice Date</TableCell>
                  <TableCell sx={{ width: 180 }}>Billing Period</TableCell>
                  <TableCell>Invoice</TableCell>
                  <TableCell sx={{ width: 160 }}>Account</TableCell>
                  <TableCell sx={{ width: 100 }}>Status</TableCell>
                  <TableCell align="right" sx={{ width: 100 }}>
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.invoiceId}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedInvoices.includes(invoice.invoiceId)}
                          onChange={(e) =>
                            handleSelectInvoice(
                              invoice.invoiceId,
                              e.target.checked,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell align="right">{invoice.invoiceId}</TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>
                        {formatDate(invoice.fromDate)} -{" "}
                        {formatDate(invoice.toDate)}
                      </TableCell>
                      <TableCell>
                        <Link
                          component="button"
                          onClick={() =>
                            navigate(`/invoices/${invoice.invoiceId}`)
                          }
                        >
                          Invoice #{invoice.invoiceId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          component="button"
                          onClick={() =>
                            navigate(
                              `/accounts/${invoice.accountId}?tab=invoices`,
                            )
                          }
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer with search, pagination, and controls */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography variant="body2">
                  <strong>{startIndex}</strong> - <strong>{endIndex}</strong> of{" "}
                  <strong>{filteredInvoices.length}</strong>
                </Typography>
              </Grid>

              <Grid item xs={12} sm={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Show rows</InputLabel>
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    label="Show rows"
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {/* Same table structure but filtered for draft invoices */}
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
                  <TableCell sx={{ width: 120 }}>Invoice Date</TableCell>
                  <TableCell sx={{ width: 180 }}>Billing Period</TableCell>
                  <TableCell>Invoice</TableCell>
                  <TableCell sx={{ width: 160 }}>Account</TableCell>
                  <TableCell sx={{ width: 100 }}>Status</TableCell>
                  <TableCell align="right" sx={{ width: 100 }}>
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No uninvoiced records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.invoiceId}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedInvoices.includes(invoice.invoiceId)}
                          onChange={(e) =>
                            handleSelectInvoice(
                              invoice.invoiceId,
                              e.target.checked,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell align="right">{invoice.invoiceId}</TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>
                        {formatDate(invoice.fromDate)} -{" "}
                        {formatDate(invoice.toDate)}
                      </TableCell>
                      <TableCell>
                        <Link
                          component="button"
                          onClick={() =>
                            navigate(`/invoices/${invoice.invoiceId}`)
                          }
                        >
                          Invoice #{invoice.invoiceId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          component="button"
                          onClick={() =>
                            navigate(
                              `/accounts/${invoice.accountId}?tab=invoices`,
                            )
                          }
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer - same as first tab */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography variant="body2">
                  <strong>{startIndex}</strong> - <strong>{endIndex}</strong> of{" "}
                  <strong>{filteredInvoices.length}</strong>
                </Typography>
              </Grid>

              <Grid item xs={12} sm={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Show rows</InputLabel>
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    label="Show rows"
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedInvoices.length} selected
          invoice(s)? This action cannot be undone.
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

export default InvoiceListPage;
