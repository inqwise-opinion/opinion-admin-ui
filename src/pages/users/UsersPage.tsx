import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Link,
  Alert,
  IconButton,
  Paper,
  InputAdornment,
} from "@mui/material";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { StyledDataGrid, StyledDataGridToolbar } from "../../components/common";
import { Search as SearchIcon } from "@mui/icons-material";
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { User, ApiResponse, PaginationParams } from "../../types";
import { opinionApiService as apiService } from "../../services";

type SortField = 'userId' | 'userName' | 'countryName' | 'provider' | 'insertDate';
type SortDirection = 'asc' | 'desc';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination model for DataGrid
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: PaginationParams & {
        search?: string;
        status?: string;
      } = {
        page: 1,
        limit: 1000, // Fetch a large number to get all users for client-side handling
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response: ApiResponse<{ list: User[] }> =
        await apiService.getUsers(params);

      if (response.success && response.data?.list) {
        setUsers(response.data.list || []);
        setTotalCount(response.data.list.length);
      } else {
        setError("Failed to load users");
        setUsers([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  // Define grid columns to preserve original table structure
  const columns: GridColDef[] = [
    {
      field: "userId",
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
            paddingRight: "2px",
          }}
        >
          <Typography sx={{ fontSize: "14px" }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "userName",
      headerName: "Username",
      flex: 1,
      minWidth: 133,
      sortable: true,
      type: "string",
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => navigate(`/users/${params.row.userId}`)}
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
      field: "countryName",
      headerName: "Country",
      width: 124,
      sortable: true,
      type: "string",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography sx={{ fontSize: "14px" }}>{params.value || ""}</Typography>
        </Box>
      ),
    },
    {
      field: "provider",
      headerName: "Provider",
      width: 110,
      sortable: true,
      type: "string",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography sx={{ fontSize: "14px" }}>{params.value || ""}</Typography>
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
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Toolbar */}
      <StyledDataGridToolbar>
        <TextField
          size="small"
          placeholder="Search users..."
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
          rows={users}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="client"
          rowCount={totalCount}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          disableRowSelectionOnClick
          getRowId={(row) => row.userId}
        />
      </Paper>
    </Box>
  );
};

export default UsersPage;
