import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Chip,
  Tooltip,
  InputAdornment,
  Paper,
} from "@mui/material";
import {
  GridColDef,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { StyledDataGrid, StyledDataGridToolbar } from "../../components/common";
import {
  Search as SearchIcon,
  GetApp as ExportIcon,
} from "@mui/icons-material";
import {
  Survey,
  FilterParams,
  PaginationParams,
} from "../../types";
import { opinionApiService as ApiService } from "../../services";
import { formatDate } from "../../utils";
import SurveyFormDialog from "./SurveyFormDialog";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";

const SurveysPage: React.FC = () => {
  // State management - simplified like Users page
  const [loading, setLoading] = useState(false);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination model for DataGrid
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  // Dialog states
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    survey?: Survey;
    mode: "create" | "edit" | "view";
  }>({ open: false, mode: "create" });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    survey?: Survey;
  }>({ open: false });


  // Get status chip component
  const getStatusChip = (status: Survey["status"], isActive: boolean) => {
    if (!isActive) {
      return (
        <Chip
          label="Inactive"
          color="default"
          size="small"
          variant="outlined"
        />
      );
    }

    switch (status) {
      case "draft":
        return (
          <Chip label="Draft" color="default" size="small" variant="outlined" />
        );
      case "active":
        return <Chip label="Active" color="success" size="small" />;
      case "paused":
        return <Chip label="Paused" color="warning" size="small" />;
      case "completed":
        return <Chip label="Completed" color="primary" size="small" />;
      case "archived":
        return (
          <Chip label="Archived" color="info" size="small" variant="outlined" />
        );
      case "closed":
        return <Chip label="Closed" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  // Get completion percentage
  const getCompletionPercentage = (responses: number, target?: number) => {
    if (!target || target === 0) return 0;
    return Math.min(100, Math.round((responses / target) * 100));
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "opinionId",
      headerName: "#",
      width: 80,
      align: "right",
      headerAlign: "right",
      sortable: true,
      type: "number",
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "14px" }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "name",
      headerName: "Survey Title",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" noWrap>
            {params.row.name || params.row.title}
          </Typography>
          {params.row.description && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "accountName",
      headerName: "Account",
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value || `Account ${params.row.accountId}`}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) =>
        getStatusChip(params.row.status, params.row.isActive),
    },
    {
      field: "completed",
      headerName: "Responses",
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" fontWeight="medium">
            {(params.value || 0).toLocaleString()}
          </Typography>
          {params.row.started && (
            <Typography variant="caption" color="text.secondary">
              / {params.row.started.toLocaleString()}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "completionRate",
      headerName: "Progress",
      width: 100,
      renderCell: (params) => {
        const percentage = params.value || 0;
        return (
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Typography variant="body2" sx={{ minWidth: 35 }}>
              {percentage}%
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: 6,
                bgcolor: "grey.300",
                borderRadius: 1,
                mx: 1,
                position: "relative",
              }}
            >
              <Box
                sx={{
                  width: `${percentage}%`,
                  height: "100%",
                  bgcolor:
                    percentage < 30
                      ? "error.main"
                      : percentage < 70
                        ? "warning.main"
                        : "success.main",
                  borderRadius: 1,
                }}
              />
            </Box>
          </Box>
        );
      },
    },
    {
      field: "insertDate",
      headerName: "Created",
      width: 120,
      renderCell: (params) => (
        <Tooltip title={new Date(params.value).toLocaleString()}>
          <Typography variant="body2" color="text.secondary">
            {formatDate(params.value)}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "publishDate",
      headerName: "Published",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value ? formatDate(params.value) : "—"}
        </Typography>
      ),
    },
  ];

  // Data fetching function
  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        top: paginationModel.pageSize,
        from: undefined,
        to: undefined,
        accountId: null, // null for all accounts
      };

      const response = await ApiService.getSurveys(params);

      if (response.success) {
        // Handle different response structures - the API returns { list: Survey[] }
        const surveyList = response.data?.list || response.data?.data || [];
        const surveysWithId = surveyList.map((survey) => ({
          ...survey,
          id: survey.opinionId || survey.surveyId, // Use opinionId first, fallback to surveyId
        }));

        setSurveys(surveysWithId);
        setTotalCount(response.data?.pagination?.total || surveyList.length);
      } else {
        setError(response.error?.message || "Failed to fetch surveys");
        setSurveys([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
      setError("Network error occurred");
      setSurveys([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchQuery]);

  // Set page title on mount

  // Load data on mount and when dependencies change
  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  // Handle pagination
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  // CRUD handlers
  const handleCreate = () => {
    setFormDialog({ open: true, mode: "create" });
  };

  const handleView = (survey: Survey) => {
    setFormDialog({ open: true, survey, mode: "view" });
  };

  const handleEdit = (survey: Survey) => {
    setFormDialog({ open: true, survey, mode: "edit" });
  };

  const handleDelete = (survey: Survey) => {
    setDeleteDialog({ open: true, survey });
  };

  const handleStatusToggle = async (survey: Survey) => {
    try {
      const newStatus = survey.status === "active" ? "paused" : "active";
      // In a real app, you'd call an API endpoint to update status
      console.log(`Toggle survey ${survey.surveyId} status to ${newStatus}`);
      fetchSurveys(); // Refresh data
    } catch (error) {
      console.error("Error toggling survey status:", error);
    }
  };

  // Form handlers
  const handleFormSave = async (surveyData: Partial<Survey>) => {
    try {
      if (formDialog.mode === "create") {
        await ApiService.createSurvey(surveyData);
      } else if (formDialog.mode === "edit" && formDialog.survey) {
        await ApiService.updateSurvey(formDialog.survey.surveyId, surveyData);
      }

      setFormDialog({ open: false, mode: "create" });
      fetchSurveys();
    } catch (error) {
      console.error("Error saving survey:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.survey) return;

    try {
      await ApiService.deleteSurvey(deleteDialog.survey.surveyId);
      setDeleteDialog({ open: false });
      fetchSurveys();
    } catch (error) {
      console.error("Error deleting survey:", error);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Search Toolbar */}
      <StyledDataGridToolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => console.log("Export surveys")}
            disabled={surveys.length === 0}
          >
            Export
          </Button>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search surveys..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: 300,
              "& .MuiInputBase-root": {
                fontSize: "13px",
              },
            }}
          />
          {searchQuery && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSearchChange("")}
            >
              Clear
            </Button>
          )}
        </Box>
      </StyledDataGridToolbar>

      {/* Data Grid */}
      <Paper sx={{ borderRadius: 0 }}>
        <StyledDataGrid
          rows={surveys}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          paginationMode="server"
          rowCount={totalCount}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick={false}
        />
      </Paper>

      {/* Survey Form Dialog */}
      <SurveyFormDialog
        open={formDialog.open}
        survey={formDialog.survey}
        mode={formDialog.mode}
        onClose={() => setFormDialog({ open: false, mode: "create" })}
        onSave={handleFormSave}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete Survey"
        message={
          deleteDialog.survey
            ? `Are you sure you want to delete "${deleteDialog.survey.title}"? This action cannot be undone and will also delete all associated responses.`
            : ""
        }
      />
    </Box>
  );
};

export default SurveysPage;
