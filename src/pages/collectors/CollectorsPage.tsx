import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Alert,
  Chip,
  InputAdornment,
  Link,
  Paper,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  GridColDef,
  GridFooterContainer,
  GridFooter,
} from "@mui/x-data-grid";
import {
  Search as SearchIcon,
} from "@mui/icons-material";
import { StyledDataGrid, StyledDataGridToolbar } from "../../components/common";
import { Collector, ApiResponse, CollectorFilter } from "../../types";
import { opinionApiService as ApiService } from "../../services";

const CollectorsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management - simplified like UsersPage
  const [loading, setLoading] = useState(false);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [includeExpired, setIncludeExpired] = useState(false);
  
  // Totals state
  const [totals, setTotals] = useState({
    started: 0,
    completed: 0,
    partial: 0,
    disqualified: 0,
    completionRate: 0,
  });

  // Set page title for breadcrumbs

  // Get collector type string
  const getCollectorType = (typeId: number): string => {
    switch (typeId) {
      case 1:
        return "Direct link";
      case 2:
        return "CINT panel";
      default:
        return "Unknown";
    }
  };

  // Get collector status string
  const getCollectorStatus = (statusId: number, typeId: number): string => {
    switch (statusId) {
      case 1:
        return typeId === 1 ? "Open" : "The panel is live";
      case 2:
        return typeId === 1 ? "Closed" : "Panel has been completed";
      case 3:
        return "Awaiting payment";
      case 4:
        return "Panel is being verified";
      case 5:
        return "The panel is live";
      case 6:
        return "Panel has been completed";
      case 7:
        return "Pending";
      case 8:
        return "Canceled";
      default:
        return "Unknown";
    }
  };

  // Get status chip
  const getStatusChip = (statusId: number, typeId: number) => {
    const status = getCollectorStatus(statusId, typeId);
    let color: "success" | "error" | "warning" | "info" | "default" = "default";

    switch (statusId) {
      case 1:
      case 5:
        color = "success";
        break;
      case 2:
      case 6:
        color = "info";
        break;
      case 3:
      case 4:
      case 7:
        color = "warning";
        break;
      case 8:
        color = "error";
        break;
    }

    return <Chip label={status} color={color} size="small" />;
  };

  // Format time taken
  const formatTimeTaken = (timeTaken?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }): string => {
    if (!timeTaken) return "--";

    const { days, hours, minutes, seconds } = timeTaken;

    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      return "Less than sec";
    }

    let result = "";
    if (days > 0) result += `${days} ${days > 1 ? "days" : "day"}, `;
    if (hours > 0) result += `${hours} ${hours > 1 ? "hours" : "hour"}, `;
    if (minutes > 0) result += `${minutes} ${minutes > 1 ? "mins" : "min"}, `;
    if (seconds > 0) result += `${seconds} ${seconds > 1 ? "secs" : "sec"}`;

    return result.replace(/, $/, "");
  };

  // Format last response date
  const formatLastResponseDate = (dateStr?: string): React.ReactNode => {
    if (!dateStr) return "--";

    const lastSpaceIndex = dateStr.lastIndexOf(" ");
    if (lastSpaceIndex === -1) return dateStr;

    const left = dateStr.substring(0, lastSpaceIndex + 1);
    const right = dateStr.substring(lastSpaceIndex + 1);

    return (
      <>
        {left}
        <strong style={{ fontWeight: "bold" }}>{right}</strong>
      </>
    );
  };

  // Calculate completion rate
  const calculateCompletionRate = (
    completed: number,
    started: number,
  ): string => {
    if (started === 0) return "0.00%";
    return ((completed / started) * 100).toFixed(2) + "%";
  };

  // Add commas to numbers
  const addCommas = (num: number): string => {
    return num.toLocaleString();
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "collectorId",
      headerName: "#",
      width: 80,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const collectorId = params.row.collectorId;
        const linkTo = `/collectors/${collectorId}`;
        return (
          <Link
            component="button"
            onClick={() => navigate(linkTo)}
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
      field: "sourceTypeId",
      headerName: "Type",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {getCollectorType(params.value)}
        </Typography>
      ),
    },
    {
      field: "statusId",
      headerName: "Status",
      width: 150,
      renderCell: (params) =>
        getStatusChip(params.value, params.row.sourceTypeId),
    },
    {
      field: "started",
      headerName: "Responses",
      width: 100,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <Typography variant="body2">{addCommas(params.value)}</Typography>
      ),
    },
    {
      field: "completed",
      headerName: "Completed",
      width: 100,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <Typography variant="body2">{addCommas(params.value)}</Typography>
      ),
    },
    {
      field: "completionRate",
      headerName: "Completion Rate",
      width: 130,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <Typography variant="body2">
          {calculateCompletionRate(params.row.completed, params.row.started)}
        </Typography>
      ),
    },
    {
      field: "partial",
      headerName: "Partial",
      width: 80,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <Typography variant="body2">{addCommas(params.value)}</Typography>
      ),
    },
    {
      field: "disqualified",
      headerName: "Disqualified",
      width: 100,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <Typography variant="body2">{addCommas(params.value || 0)}</Typography>
      ),
    },
    {
      field: "timeTaken",
      headerName: "Avg. Time Taken",
      width: 140,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <Typography variant="body2">{formatTimeTaken(params.value)}</Typography>
      ),
    },
    {
      field: "accountName",
      headerName: "Account",
      width: 150,
      renderCell: (params) => {
        const accountId = params.row.accountId;
        const linkTo = `/accounts/${accountId}?tab=collectors`;
        return (
          <Link
            component="button"
            onClick={() => navigate(linkTo)}
            color="primary"
            underline="hover"
            title={params.value}
            sx={{
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
      field: "opinionName",
      headerName: "Survey",
      width: 150,
      renderCell: (params) => {
        const accountId = params.row.accountId;
        const linkTo = `/accounts/${accountId}?tab=surveys`;
        return (
          <Link
            component="button"
            onClick={() => navigate(linkTo)}
            color="primary"
            underline="hover"
            title={`[${params.row.opinionTypeName}] ${params.value}`}
            sx={{
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
      field: "lastResponseDate",
      headerName: "Last Response Date",
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" component="div">
          {formatLastResponseDate(params.value)}
        </Typography>
      ),
    },
  ];

  // Custom footer with totals row
  const CustomFooter = () => {
    return (
      <GridFooterContainer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            px: 2,
            py: 1,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            Total - all collectors
          </Typography>
          <Box sx={{ display: "flex", gap: 4, alignItems: "center" }}>
            <Typography variant="body2">
              Responses: {addCommas(totals.started)}
            </Typography>
            <Typography variant="body2">
              Completed: {addCommas(totals.completed)}
            </Typography>
            <Typography variant="body2">
              Rate: {totals.completionRate.toFixed(2)}%
            </Typography>
            <Typography variant="body2">
              Partial: {addCommas(totals.partial)}
            </Typography>
            <Typography variant="body2">
              Disqualified: {addCommas(totals.disqualified)}
            </Typography>
          </Box>
        </Box>
        <GridFooter />
      </GridFooterContainer>
    );
  };

  // Fetch collectors
  const fetchCollectors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: CollectorFilter = {
        includeExpired,
        top: 100,
      };

      const response: ApiResponse<{ list: Collector[] }> =
        await ApiService.getAllCollectors(filters);

      if (response.success && response.data) {
        const collectorsData = response.data.list || [];

        // Calculate totals
        const calculatedTotals = collectorsData.reduce(
          (acc, collector) => ({
            started: acc.started + collector.started,
            completed: acc.completed + collector.completed,
            partial: acc.partial + collector.partial,
            disqualified: acc.disqualified + (collector.disqualified || 0),
            completionRate: 0, // Will be calculated after
          }),
          {
            started: 0,
            completed: 0,
            partial: 0,
            disqualified: 0,
            completionRate: 0,
          },
        );

        // Calculate overall completion rate
        calculatedTotals.completionRate =
          calculatedTotals.started > 0 ? (calculatedTotals.completed / calculatedTotals.started) * 100 : 0;

        setCollectors(collectorsData);
        setTotals(calculatedTotals);
      } else {
        setError(response.error?.message || "Failed to fetch collectors");
        setCollectors([]);
        setTotals({
          started: 0,
          completed: 0,
          partial: 0,
          disqualified: 0,
          completionRate: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching collectors:", error);
      setError("An error occurred while fetching collectors");
      setCollectors([]);
      setTotals({
        started: 0,
        completed: 0,
        partial: 0,
        disqualified: 0,
        completionRate: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [includeExpired]);

  // Load data on mount and when filters change
  useEffect(() => {
    fetchCollectors();
  }, [fetchCollectors]);

  // Filter collectors by search term
  const filteredCollectors = collectors.filter((collector) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      collector.name.toLowerCase().includes(searchLower) ||
      collector.accountName.toLowerCase().includes(searchLower) ||
      collector.opinionName.toLowerCase().includes(searchLower) ||
      getCollectorType(collector.sourceTypeId)
        .toLowerCase()
        .includes(searchLower) ||
      getCollectorStatus(collector.statusId, collector.sourceTypeId)
        .toLowerCase()
        .includes(searchLower)
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
          placeholder="Search collectors..."
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
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Include Expired</InputLabel>
          <Select
            value={includeExpired ? "yes" : "no"}
            label="Include Expired"
            onChange={(e) => setIncludeExpired(e.target.value === "yes")}
            sx={{
              "& .MuiInputBase-root": {
                fontSize: "13px",
              },
            }}
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
          </Select>
        </FormControl>
      </StyledDataGridToolbar>

      {/* Data Grid */}
      <Paper sx={{ borderRadius: 0 }}>
        <StyledDataGrid
          rows={filteredCollectors}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.collectorId}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          slots={{
            footer: CustomFooter,
          }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
            sorting: {
              sortModel: [{ field: "lastResponseDate", sort: "desc" }],
            },
          }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
        />
      </Paper>
    </Box>
  );
};

export default CollectorsPage;
