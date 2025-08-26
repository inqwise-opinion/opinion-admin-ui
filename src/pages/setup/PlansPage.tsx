import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Alert,
  InputAdornment,
  Link,
  Paper,
  TextField,
} from "@mui/material";
import {
  GridColDef,
} from "@mui/x-data-grid";
import {
  Search as SearchIcon,
} from "@mui/icons-material";
import { StyledDataGrid, StyledDataGridToolbar } from "../../components/common";
import { Package } from "../../types";
import opinionApiService from "../../services";

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management - simplified like CollectorsPage
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Format date for display
  const formatDateTime = (dateString: string): React.ReactNode => {
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

    const dateStr = date.toLocaleDateString("en-US", dateOptions);
    const timeStr = date.toLocaleTimeString("en-US", timeOptions);

    return (
      <>
        {dateStr}
        <Box component="b" sx={{ fontWeight: "bold", color: "#666", ml: 1 }}>
          {timeStr}
        </Box>
      </>
    );
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "packageId",
      headerName: "#",
      width: 80,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "packageName",
      headerName: "Plan",
      width: 220,
      renderCell: (params) => {
        const packageId = params.row.packageId;
        return (
          <Link
            component="button"
            onClick={() => navigate(`/setup/plans/${packageId}`)}
            color="primary"
            underline="hover"
            sx={{ 
              fontWeight: "medium",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left"
            }}
          >
            {params.value}
          </Link>
        );
      },
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2">{params.value || ""}</Typography>
      ),
    },
    {
      field: "insertDate",
      headerName: "Create Date",
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" component="div">
          {formatDateTime(params.value)}
        </Typography>
      ),
    },
  ];

  // Fetch packages
  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await opinionApiService.getPackages(1, false);
      if (response.success && response.data?.list) {
        setPackages(response.data.list || []);
      } else {
        setError(response.error?.message || "Failed to fetch plans");
        setPackages([]);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      setError("An error occurred while fetching plans");
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Filter packages based on search query
  const filteredPackages = packages.filter(
    (pkg) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        pkg.packageName.toLowerCase().includes(searchLower) ||
        (pkg.description || "").toLowerCase().includes(searchLower)
      );
    }
  );

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Toolbar */}
      <StyledDataGridToolbar>
        <TextField
          size="small"
          placeholder="Search plans..."
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
      </StyledDataGridToolbar>

      {/* Data Grid */}
      <Paper sx={{ borderRadius: 0 }}>
        <StyledDataGrid
          rows={filteredPackages}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.packageId}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
            sorting: {
              sortModel: [{ field: "insertDate", sort: "desc" }],
            },
          }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
        />
      </Paper>
    </Box>
  );
};

export default PlansPage;
