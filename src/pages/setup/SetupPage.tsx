import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Breadcrumbs,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  Work as WorkIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";

interface SetupSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  onClick: () => void;
}

const SetupSection: React.FC<SetupSectionProps> = ({
  title,
  description,
  icon,
  onClick,
}) => (
  <Card
    sx={{
      height: "100%",
      cursor: "pointer",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: "rgba(50, 78, 141, 0.04)",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
      },
    }}
    onClick={onClick}
  >
    <CardContent sx={{ textAlign: "center", py: 3 }}>
      <Box sx={{ mb: 2, color: "#324E8D" }}>{icon}</Box>
      <Typography
        variant="h6"
        sx={{ mb: 2, color: "#333", fontWeight: "bold" }}
      >
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "#666", lineHeight: 1.5 }}>
        {description}
      </Typography>
    </CardContent>
    <CardActions sx={{ justifyContent: "center", pb: 2 }}>
      <Button
        variant="outlined"
        sx={{
          textTransform: "none",
          fontWeight: "bold",
          fontSize: "11px",
          padding: "4px 12px",
        }}
      >
        Manage
      </Button>
    </CardActions>
  </Card>
);

const SetupPage: React.FC = () => {
  const navigate = useNavigate();

  const setupSections = [
    {
      title: "Plans",
      description:
        "Manage subscription plans, packages, and pricing tiers for your platform.",
      icon: <ReceiptIcon sx={{ fontSize: 48 }} />,
      path: ROUTES.SETUP_PLANS,
    },
    {
      title: "Jobs",
      description:
        "Monitor background jobs, scheduled tasks, and system processes.",
      icon: <WorkIcon sx={{ fontSize: 48 }} />,
      path: "/setup/jobs",
    },
    {
      title: "System Events",
      description:
        "View system events, logs, and monitor platform health and performance.",
      icon: <EventIcon sx={{ fontSize: 48 }} />,
      path: ROUTES.SYSTEM_EVENTS,
    },
    {
      title: "Configuration",
      description:
        "Configure system settings, feature flags, and global preferences.",
      icon: <SettingsIcon sx={{ fontSize: 48 }} />,
      path: "/setup/configuration",
    },
  ];

  const handleSectionClick = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs separator="›" sx={{ fontSize: "14px", color: "#333" }}>
          <Typography sx={{ color: "#333", fontSize: "14px" }}>
            System
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ mb: 2 }}>
          System
        </Typography>
        <Typography variant="body1" sx={{ color: "#666", maxWidth: "600px" }}>
          Configure and manage system settings, subscription plans, background
          jobs, and monitor platform health. Use these tools to customize your
          Opinion platform administration.
        </Typography>
      </Box>

      {/* Setup Sections Grid */}
      <Grid container spacing={3}>
        {setupSections.map((section, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
            <SetupSection
              title={section.title}
              description={section.description}
              icon={section.icon}
              path={section.path}
              onClick={() => handleSectionClick(section.path)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 5 }}>
        <Paper
          elevation={1}
          sx={{
            p: 3,
            backgroundColor: "#F9F9F9",
            border: "1px solid #E2E2E2",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(ROUTES.SETUP_PLANS)}
              sx={{ textTransform: "none" }}
            >
              Manage Plans
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(ROUTES.SYSTEM_EVENTS)}
              sx={{ textTransform: "none" }}
            >
              View System Events
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/setup/jobs")}
              sx={{ textTransform: "none" }}
            >
              Check Background Jobs
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* System Status Overview */}
      <Box sx={{ mt: 4 }}>
        <Paper
          elevation={1}
          sx={{
            p: 3,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E2E2",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
            System Status
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ color: "#67A54B", fontWeight: "bold" }}
                >
                  Online
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  System Status
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ color: "#324E8D", fontWeight: "bold" }}
                >
                  4
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Active Plans
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ color: "#f7931e", fontWeight: "bold" }}
                >
                  2
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Running Jobs
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ color: "#67A54B", fontWeight: "bold" }}
                >
                  99.9%
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Uptime
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default SetupPage;
