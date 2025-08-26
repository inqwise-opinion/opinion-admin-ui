import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Alert,
  MenuItem,
  Link,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Search as SearchIcon } from "@mui/icons-material";
import { StyledDataGridToolbar } from "../../components/common";
import {
  Account,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
} from "../../types";
import { opinionApiService as apiService } from "../../services";
import { debounce } from "../../utils";
const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination and filtering
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "enabled" | "disabled"
  >("all");

  // Load accounts data
  const loadAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: PaginationParams & {
        search?: string;
        status?: string;
        fromDate?: string;
        toDate?: string;
      } = {
        page: paginationModel.page + 1, // API is 1-based
        limit: paginationModel.pageSize,
        // Match original JSP - no date filtering by default (loads all accounts)
        // fromDate and toDate can be added later if needed
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response: ApiResponse<PaginatedResponse<Account>> =
        await apiService.getAccounts(params);
      setAccounts(response.data.data);
      setTotalCount(response.data.pagination.total);
    } catch (err) {
      setError("Failed to load accounts");
      console.error("Error loading accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = debounce(loadAccounts, 500);

  // Set page title on mount

  // Load accounts on mount and when filters change
  useEffect(() => {
    loadAccounts();
  }, [paginationModel, statusFilter]);

  // Handle search query changes
  useEffect(() => {
    if (searchQuery === "") {
      loadAccounts();
    } else {
      debouncedSearch();
    }
  }, [searchQuery]);

  // Clear alerts
  const clearAlert = () => {
    setError(null);
    setSuccess(null);
  };

  // Get account status text based on isActive flag
  const getAccountStatus = (isActive: boolean) => {
    return isActive ? "Enabled" : "Disabled";
  };

  const formatDateDisplay = (
    dateString: string,
  ): { date: string; time: string } => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    return {
      date: date.toLocaleDateString("en-US", dateOptions),
      time: date.toLocaleTimeString("en-US", timeOptions),
    };
  };

  // Define grid columns to match original JSP structure
  const columns: GridColDef[] = [
    {
      field: "accountId",
      headerName: "#",
      width: 46,
      align: "right",
      headerAlign: "right",
      sortable: true,
      type: "number",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            justifyContent: "flex-end",
          }}
        >
          <Typography sx={{ fontSize: "14px" }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "accountName",
      headerName: "Account",
      flex: 1,
      minWidth: 200,
      sortable: true,
      type: "string",
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => navigate(`/accounts/${params.row.accountId}`)}
          title={params.value || ""}
          sx={{
            color: "#324E8D",
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
              color: "#f7931e",
            },
          }}
        >
          {params.value || ""}
        </Link>
      ),
    },
    {
      field: "servicePackageName",
      headerName: "Current Plan",
      width: 100,
      sortable: true,
      type: "string",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography sx={{ fontSize: "14px" }}>{params.value || ""}</Typography>
        </Box>
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 80,
      sortable: true,
      type: "string",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography sx={{ fontSize: "14px" }}>
            {getAccountStatus(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "insertDate",
      headerName: "Create Date",
      width: 160,
      sortable: true,
      type: "string",
      renderCell: (params) => {
        if (!params.value) return null;
        const { date, time } = formatDateDisplay(params.value);
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Box component="span">
              {date}
              <Box
                component="b"
                className="hours"
                sx={{ fontWeight: "bold", color: "#666" }}
              >
                {" " + time}
              </Box>
            </Box>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={clearAlert} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={clearAlert} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <StyledDataGridToolbar>
        <TextField
          size="small"
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            minWidth: 250,
            "& .MuiInputBase-root": {
              fontSize: "13px",
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as typeof statusFilter)
          }
          sx={{ 
            minWidth: 120,
            "& .MuiInputBase-root": {
              fontSize: "13px",
            },
          }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="enabled">Enabled</MenuItem>
          <MenuItem value="disabled">Disabled</MenuItem>
        </TextField>
      </StyledDataGridToolbar>

      {/* Data Grid */}
      <Paper>
        <DataGrid
          rows={accounts}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          rowCount={totalCount}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          disableRowSelectionOnClick
          getRowId={(row) => row.accountId}
          rowHeight={40}
          columnHeaderHeight={40}
          sx={{
            border: "1px solid #BBBBBB",
            borderRadius: 0,
            "& .MuiDataGrid-main": {
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f4f4f4",
                background: "linear-gradient(to bottom, #f9f9f9, #f4f4f4)",
                borderBottom: "1px solid #BBBBBB",
                minHeight: "40px !important",
                maxHeight: "40px !important",
                lineHeight: "40px",
              },
              "& .MuiDataGrid-columnHeader": {
                borderRight: "1px solid #BBBBBB",
                padding: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#333",
                textShadow: "0 1px 0 #FFFFFF",
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                },
                cursor: "pointer",
                userSelect: "none",
                "&:last-child": {
                  borderRight: "none",
                },
                "&:hover": {
                  backgroundColor: "#E8E8E8 !important",
                },
                "&:focus": {
                  outline: "none",
                },
                "&:focus-within": {
                  outline: "none",
                },
              },
              "& .MuiDataGrid-row": {
                minHeight: "40px !important",
                maxHeight: "40px !important",
                "&:nth-of-type(even)": {
                  backgroundColor: "#FFFFFF",
                },
                "&:nth-of-type(odd)": {
                  backgroundColor: "#F9F9F9",
                },
                "&:hover": {
                  backgroundColor: "rgba(50, 78, 141, 0.04) !important",
                },
              },
              "& .MuiDataGrid-cell": {
                borderRight: "1px solid #E2E2E2",
                borderBottom: "1px solid #E2E2E2",
                padding: "8px",
                fontSize: "14px",
                color: "#333",
                lineHeight: "24px",
                "&:last-child": {
                  borderRight: "none",
                },
                "&:focus": {
                  outline: "none",
                },
                "&:focus-within": {
                  outline: "none",
                },
              },
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#F9F9F9 !important",
              borderTop: "1px solid #E2E2E2 !important",
              minHeight: "40px !important",
              borderBottomLeftRadius: "0 !important",
              borderBottomRightRadius: "0 !important",
              
              "& .MuiDataGrid-selectedRowCount": {
                display: "none !important",
              },
              
              "& .MuiTablePagination-root": {
                fontSize: "13px !important",
                color: "#333",
              },
              
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                fontSize: "13px !important",
                color: "#333",
                margin: 0,
              },
              
              // Remove borders from all pagination dropdown containers
              "& .MuiInputBase-root.MuiTablePagination-select": {
                border: "none !important",
                borderRadius: "4px !important",
                backgroundColor: "#f5f5f5 !important",
                boxShadow: "0 0 0 1px #BBBBBB !important",
                
                "&:hover": {
                  backgroundColor: "#FFFFFF !important",
                  boxShadow: "0 0 0 1px #999 !important",
                },
                
                "&:focus-within": {
                  backgroundColor: "#FFFFFF !important",
                  boxShadow: "0 0 0 1px #999 !important",
                },
                
                "&::before, &::after": {
                  display: "none !important",
                },
              },
              
              // Style the inner select element
              "& .MuiSelect-select.MuiTablePagination-select": {
                border: "none !important",
                borderRadius: "4px !important",
                backgroundColor: "transparent !important",
                fontSize: "13px !important",
                color: "#333 !important",
                padding: "6px 8px !important",
                paddingRight: "24px !important",
                minHeight: "auto !important",
                boxSizing: "border-box !important",
                
                "&:focus": {
                  backgroundColor: "transparent !important",
                  outline: "none !important",
                  boxShadow: "none !important",
                },
              },
              
              // Additional catch-all for any remaining pagination select elements
              "& .MuiTablePagination-select": {
                border: "none !important",
                outline: "none !important",
                boxShadow: "none !important",
                
                "&::before, &::after": {
                  display: "none !important",
                },
              },
              
              "& .MuiIconButton-root": {
                color: "#333",
                fontSize: "13px",
                
                "&.Mui-disabled": {
                  color: "#ccc !important",
                  backgroundColor: "transparent",
                  cursor: "not-allowed",
                },
              },
              
              // Target pagination buttons specifically
              "& .MuiTablePagination-actions": {
                "& .MuiIconButton-root": {
                  color: "#333",
                  
                  "&.Mui-disabled": {
                    color: "#ccc !important",
                    backgroundColor: "transparent",
                    cursor: "not-allowed",
                  },
                  
                  "&:hover:not(.Mui-disabled)": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                },
              },
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: "transparent",
            },
            "& .MuiDataGrid-overlay": {
              backgroundColor: "transparent",
            },
            // Override default DataGrid row striping
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "#FFFFFF !important",
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#F9F9F9 !important",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(50, 78, 141, 0.04) !important",
            },
            // Ensure header styling overrides
            "& .MuiDataGrid-columnHeaderRow": {
              minHeight: "40px !important",
              maxHeight: "40px !important",
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default AccountsPage;
