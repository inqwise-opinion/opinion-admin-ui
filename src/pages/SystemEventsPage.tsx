import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Alert,
  Chip,
  InputAdornment,
  Paper,
  TextField,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { StyledDataGrid, StyledDataGridToolbar } from "../components/common";
import { SystemEvent, ApiResponse } from "../types";
import { opinionApiService as ApiService } from "../services";

const SystemEventsPage: React.FC = () => {
  const navigate = useNavigate();

  // State management - simplified like other pages
  const [loading, setLoading] = useState(false);
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Get severity icon and color
  const getSeverityChip = (severity: SystemEvent["severity"]) => {
    const config = {
      low: {
        color: "success" as const,
        icon: <InfoIcon sx={{ fontSize: 16 }} />,
        label: "Low",
      },
      medium: {
        color: "info" as const,
        icon: <NotificationsIcon sx={{ fontSize: 16 }} />,
        label: "Medium",
      },
      high: {
        color: "warning" as const,
        icon: <WarningIcon sx={{ fontSize: 16 }} />,
        label: "High",
      },
      critical: {
        color: "error" as const,
        icon: <ErrorIcon sx={{ fontSize: 16 }} />,
        label: "Critical",
      },
    };

    const { color, icon, label } = config[severity];
    return (
      <Chip
        label={label}
        color={color}
        size="small"
        icon={icon}
        sx={{
          fontSize: "12px",
          height: "24px",
          "& .MuiChip-icon": {
            marginLeft: "4px",
            marginRight: "-2px",
          },
        }}
      />
    );
  };

  // Format date display - matching the original format style
  const formatDateDisplay = (dateString: string): React.ReactNode => {
    if (!dateString) return "--";

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
      <Box component="span">
        {dateStr}
        <Box
          component="b"
          className="hours"
          sx={{ fontWeight: "bold", color: "#666" }}
        >
          {" " + timeStr}
        </Box>
      </Box>
    );
  };

  // Get recipients display - placeholder since original shows "Recipients" column
  const getRecipientsDisplay = (event: SystemEvent): string => {
    // This could be based on eventType or additionalData
    // For now, return a placeholder based on event type
    if (event.eventType.toLowerCase().includes("email")) {
      return "Email Recipients";
    } else if (event.eventType.toLowerCase().includes("user")) {
      return "User Notifications";
    } else if (event.eventType.toLowerCase().includes("admin")) {
      return "Admin Notifications";
    }
    return "System";
  };

  // DataGrid columns - matching original HTML structure
  const columns: GridColDef[] = [
    {
      field: "eventId",
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
      field: "eventType",
      headerName: "Event Name",
      width: 220,
      sortable: true,
      type: "string",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography sx={{ fontSize: "14px", fontWeight: "medium" }}>
            {params.value || ""}
          </Typography>
        </Box>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 300,
      sortable: true,
      type: "string",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography
            sx={{
              fontSize: "14px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={params.value || ""}
          >
            {params.value || ""}
          </Typography>
        </Box>
      ),
    },
    {
      field: "recipients",
      headerName: "Recipients",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography sx={{ fontSize: "14px" }}>
            {getRecipientsDisplay(params.row)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "severity",
      headerName: "Severity",
      width: 100,
      sortable: true,
      renderCell: (params) => getSeverityChip(params.value),
    },
    {
      field: "insertDate",
      headerName: "Modify Date",
      width: 126,
      sortable: true,
      type: "string",
      renderCell: (params) => {
        if (!params.value) return null;
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            {formatDateDisplay(params.value)}
          </Box>
        );
      },
    },
  ];

  // Fetch system events
  const fetchSystemEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getSystemEvents({
        page: 1,
        limit: 1000,
      });

      if (response.success && response.data) {
        // Handle both PaginatedResponse and { list } formats
        const events = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).list || (response.data as any).data || [];
        setSystemEvents(events);
      } else {
        setError("Failed to load system events");
        setSystemEvents([]);
      }
    } catch (error) {
      console.error("Error fetching system events:", error);
      setError("Failed to load system events");
      setSystemEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemEvents();
  }, [fetchSystemEvents]);

  // Filter system events by search term
  const filteredSystemEvents = systemEvents.filter((event) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      event.eventType.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.severity.toLowerCase().includes(searchLower) ||
      getRecipientsDisplay(event).toLowerCase().includes(searchLower)
    );
  });

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
          placeholder="Search system events..."
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
          rows={filteredSystemEvents}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.eventId}
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

export default SystemEventsPage;
