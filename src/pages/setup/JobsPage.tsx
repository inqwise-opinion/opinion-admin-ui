import React from "react";
import {
  Box,
  Paper,
  Typography,
  Alert,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from "@mui/material";
import {
  Work as WorkIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

interface JobCardProps {
  title: string;
  description: string;
  status: "running" | "paused" | "completed" | "failed";
  lastRun?: string;
  nextRun?: string;
}

const JobCard: React.FC<JobCardProps> = ({
  title,
  description,
  status,
  lastRun,
  nextRun,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "running":
        return {
          color: "success" as const,
          icon: <PlayIcon sx={{ fontSize: 16 }} />,
          label: "Running",
        };
      case "paused":
        return {
          color: "warning" as const,
          icon: <PauseIcon sx={{ fontSize: 16 }} />,
          label: "Paused",
        };
      case "completed":
        return {
          color: "info" as const,
          icon: <CompleteIcon sx={{ fontSize: 16 }} />,
          label: "Completed",
        };
      case "failed":
        return {
          color: "error" as const,
          icon: <ErrorIcon sx={{ fontSize: 16 }} />,
          label: "Failed",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid #E2E2E2",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "rgba(50, 78, 141, 0.04)",
          transform: "translateY(-1px)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <WorkIcon sx={{ color: "#324E8D", mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", flex: 1 }}>
            {title}
          </Typography>
          <Chip
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
            icon={statusConfig.icon}
          />
        </Box>
        <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
          {description}
        </Typography>
        {lastRun && (
          <Typography variant="caption" sx={{ color: "#999", display: "block" }}>
            Last run: {lastRun}
          </Typography>
        )}
        {nextRun && (
          <Typography variant="caption" sx={{ color: "#999", display: "block" }}>
            Next run: {nextRun}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button size="small" color="primary">
          View Details
        </Button>
        <Button size="small" color="secondary">
          {status === "running" ? "Pause" : "Start"}
        </Button>
      </CardActions>
    </Card>
  );
};

const JobsPage: React.FC = () => {
  // Mock job data for demonstration
  const jobs = [
    {
      title: "Data Cleanup Task",
      description: "Cleans up expired survey responses and temporary data",
      status: "running" as const,
      lastRun: "2 hours ago",
      nextRun: "In 22 hours",
    },
    {
      title: "Email Notifications",
      description: "Sends scheduled email notifications to users",
      status: "completed" as const,
      lastRun: "1 hour ago",
      nextRun: "In 23 hours",
    },
    {
      title: "Report Generation",
      description: "Generates daily analytics and summary reports",
      status: "paused" as const,
      lastRun: "Yesterday",
      nextRun: "Manual start required",
    },
    {
      title: "Database Backup",
      description: "Performs automated database backups",
      status: "failed" as const,
      lastRun: "3 hours ago",
      nextRun: "Retry in 1 hour",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, color: "#333", fontWeight: "bold" }}>
          Background Jobs
        </Typography>
        <Typography variant="body1" sx={{ color: "#666", maxWidth: "600px" }}>
          Monitor and manage background tasks, scheduled jobs, and automated processes.
          View job status, execution history, and control job scheduling.
        </Typography>
      </Box>

      {/* Status Overview */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: "#F9F9F9",
          border: "1px solid #E2E2E2",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
          Job Status Overview
        </Typography>
        <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{ color: "#67A54B", fontWeight: "bold" }}
            >
              1
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Running
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{ color: "#324E8D", fontWeight: "bold" }}
            >
              1
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Completed
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{ color: "#f7931e", fontWeight: "bold" }}
            >
              1
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Paused
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{ color: "#BA0A1C", fontWeight: "bold" }}
            >
              1
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Failed
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Development Notice */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Development in Progress:</strong> The Background Jobs management system is currently being developed. 
          This preview shows the planned interface and features. Job data shown here is for demonstration purposes only.
        </Typography>
      </Alert>

      {/* Jobs Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
        }}
      >
        {jobs.map((job, index) => (
          <JobCard key={index} {...job} />
        ))}
      </Box>
    </Box>
  );
};

export default JobsPage;
