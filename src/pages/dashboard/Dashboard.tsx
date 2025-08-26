import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { People, Business, Poll, Navigation } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import opinionApiService from "../../services";
import { User, UserHistory, PaginationParams, FilterParams } from "../../types";
import { formatDate, getErrorMessage } from "../../utils";
import { DATE_FORMATS, ROUTES } from "../../constants";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [activeUserHistory, setActiveUserHistory] = useState<UserHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [recentUsersLoading, setRecentUsersLoading] = useState(false);
  const [activeUsersLoading, setActiveUsersLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range: yesterday to today
      const now = new Date();
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);

      // Format date as expected by backend: "Aug 12, 2025 00:00"
      const fromDate =
        yesterday.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }) + " 00:00";

      // Load recent users with fromDate filter (matches original JSP)
      const recentUsersParams: PaginationParams & FilterParams = {
        page: 1,
        limit: 100, // Original uses pagingStart: 100
        sortBy: "insertDate",
        sortOrder: "desc",
        fromDate, // This matches the original getUsers({ fromDate: dateRange[0] + ' 00:00' })
      };

      console.log(
        "Dashboard: Loading recent users with params:",
        recentUsersParams,
      );
      const recentUsersResponse =
        await opinionApiService.getRecentUsers(recentUsersParams);
      if (recentUsersResponse.success) {
        setRecentUsers(recentUsersResponse.data.data);
        console.log(
          "Dashboard: Recent users loaded:",
          recentUsersResponse.data.data.length,
        );
      }

      // Load active user history with typeIds and productId (matches original JSP)
      const activeUsersParams: PaginationParams & FilterParams = {
        page: 1,
        limit: 10, // Original uses pagingStart: 10
        sortBy: "insertDate",
        sortOrder: "desc",
        typeIds: [1, 6], // This matches the original getUserHistory({ typeIds: [1, 6] })
        productId: 1, // This matches the original getUserHistory({ productId: 1 })
      };

      console.log(
        "Dashboard: Loading active user history with params:",
        activeUsersParams,
      );
      const activeUsersResponse =
        await opinionApiService.getActiveUserHistory(activeUsersParams);
      if (activeUsersResponse.success) {
        setActiveUserHistory(activeUsersResponse.data.data);
        console.log(
          "Dashboard: Active user history loaded:",
          activeUsersResponse.data.data.length,
        );
      }
    } catch (err) {
      console.error("Dashboard: Error loading data:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Recent Users Table Columns
  const recentUsersColumns: GridColDef[] = [
    {
      field: "userId",
      headerName: "#",
      width: 80,
      type: "number",
    },
    {
      field: "userName",
      headerName: "Username",
      width: 150,
      renderCell: (params) => (
        <Typography
          component="a"
          href={`/users/${params.row.userId}`}
          sx={{
            color: "primary.main",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "countryName",
      headerName: "Country",
      width: 130,
    },
    {
      field: "provider",
      headerName: "Provider",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Typography variant="body2">{params.value || ""}</Typography>
        </Box>
      ),
    },
    {
      field: "insertDate",
      headerName: "Create Date",
      width: 160,
      sortable: true,
      renderCell: (params) => {
        if (!params.value) return null;

        // Parse the date from the format "Aug 13, 2025 00:00:00"
        const dateStr = params.value;
        let formattedDate = dateStr;
        let timeStr = "";

        try {
          // Check if it's in the format like "Aug 13, 2025 00:00:00"
          if (dateStr.includes(",") && dateStr.includes(":")) {
            const parts = dateStr.split(" ");
            if (parts.length >= 4) {
              // Format: "Aug 13, 2025" + time part
              const datePart = `${parts[0]} ${parts[1]} ${parts[2]}`; // "Aug 13, 2025"
              const timePart = parts[3]; // "00:00:00"
              formattedDate = datePart;
              timeStr = timePart;
            }
          } else {
            // Try to parse as ISO date
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              formattedDate = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              });
              // Format time as 24-hour HH:MM:SS
              timeStr = date.toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
            }
          }
        } catch (e) {
          // Fallback to original string
          console.warn("Date parsing error:", e);
        }

        return (
          <Box
            sx={{
              lineHeight: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography
              component="div"
              variant="body2"
              sx={{ mb: 0, mt: 0, lineHeight: 1.1, fontSize: "0.875rem" }}
            >
              {formattedDate}
            </Typography>
            {timeStr && (
              <Typography
                component="div"
                variant="caption"
                fontWeight="bold"
                sx={{
                  mt: 0,
                  mb: 0,
                  lineHeight: 1,
                  fontSize: "0.75rem",
                  color: "#999",
                }}
              >
                {timeStr}
              </Typography>
            )}
          </Box>
        );
      },
    },
  ];

  // Active Users Table Columns (No sorting like original JSP)
  const activeUsersColumns: GridColDef[] = [
    {
      field: "id",
      headerName: "#",
      width: 80,
      type: "number",
      sortable: false,
    },
    {
      field: "userName",
      headerName: "Username",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Typography
          component="a"
          href={`/users/${params.row.userId}`}
          sx={{
            color: "primary.main",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "typeName",
      headerName: "Operation Type",
      width: 150,
      sortable: false,
    },
    {
      field: "countryName",
      headerName: "Country",
      width: 130,
      sortable: false,
    },
    {
      field: "clientIp",
      headerName: "IP Address",
      width: 120,
      sortable: false,
    },
    {
      field: "insertDate",
      headerName: "Date",
      width: 160,
      sortable: false,
      renderCell: (params) => {
        if (!params.value) return null;

        // Parse the date from ISO format to match the original format
        const dateStr = params.value;
        let formattedDate = dateStr;
        let timeStr = "";

        try {
          // Parse ISO date string
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            });
            // Format time as 24-hour HH:MM:SS
            timeStr = date.toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          }
        } catch (e) {
          console.warn("Date parsing error in Active Users:", e);
        }

        return (
          <Box
            sx={{
              lineHeight: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography
              component="div"
              variant="body2"
              sx={{ mb: 0, mt: 0, lineHeight: 1.1, fontSize: "0.875rem" }}
            >
              {formattedDate}
            </Typography>
            {timeStr && (
              <Typography
                component="div"
                variant="caption"
                fontWeight="bold"
                sx={{
                  mt: 0,
                  mb: 0,
                  lineHeight: 1,
                  fontSize: "0.75rem",
                  color: "#999",
                }}
              >
                {timeStr}
              </Typography>
            )}
          </Box>
        );
      },
    },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>

      {/* Quick Navigation */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Access
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <People sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6">Users</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Manage user accounts and permissions
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(ROUTES.USERS)}
                  sx={{ textTransform: "none" }}
                >
                  Go to Users
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Business sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6">Accounts</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Manage client accounts and plans
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(ROUTES.ACCOUNTS)}
                  sx={{ textTransform: "none" }}
                >
                  Go to Accounts
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Poll sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6">Surveys</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Create and manage surveys
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(ROUTES.SURVEYS)}
                  sx={{ textTransform: "none" }}
                >
                  Go to Surveys
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Navigation sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6">Navigation</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Learn about navigation features
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate("/navigation")}
                  sx={{ textTransform: "none" }}
                >
                  View Guide
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tables */}
      <Grid container spacing={3}>
        {/* Recent Users Table */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2, height: 500 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Today At a Glance
            </Typography>
            <Box sx={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={recentUsers}
                columns={recentUsersColumns}
                getRowId={(row) => row.userId}
                loading={recentUsersLoading}
                hideFooter
                disableRowSelectionOnClick
                sx={{
                  border: 0,
                  "& .MuiDataGrid-footerContainer": {
                    display: "none",
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Active Users Table */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2, height: 500 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Active Users
            </Typography>
            <Box sx={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={activeUserHistory}
                columns={activeUsersColumns}
                getRowId={(row) => row.id}
                loading={activeUsersLoading}
                hideFooter
                disableRowSelectionOnClick
                sx={{
                  border: 0,
                  "& .MuiDataGrid-footerContainer": {
                    display: "none",
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
