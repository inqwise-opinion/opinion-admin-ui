import React, { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Collapse,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Business,
  Poll,
  HowToVote,
  CollectionsBookmark,
  Payment,
  Assessment,
  Settings,
  CreditCard,
  AccountCircle,
  Logout,
  MenuBook,
  Article,
  ContentCopy,
  ExpandLess,
  ExpandMore,
  Receipt,
  Work,
  Event,
} from "@mui/icons-material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { UI_CONSTANTS, MENU_ITEMS, ROUTES, MenuItemType } from "../constants";
import Breadcrumb from "../components/common/Breadcrumb";
import { useBreadcrumbContext } from "../contexts/BreadcrumbContext";
import { useBreadcrumbs } from "../utils/breadcrumbUtils";

interface MainLayoutProps {
  children?: React.ReactNode;
}

const iconMap: Record<string, React.ElementType> = {
  Dashboard,
  People,
  Business,
  Poll,
  HowToVote,
  CollectionsBookmark,
  Payment,
  Assessment,
  Settings,
  CreditCard,
  MenuBook,
  Article,
  ContentCopy,
  Receipt,
  Work,
  Event,
};

const MainLayout: React.FC<MainLayoutProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [stickyTabsElement, setStickyTabsElement] =
    useState<HTMLElement | null>(null);
  const [originalTabsTop, setOriginalTabsTop] = useState<number>(0);
  const [isTabsSticky, setIsTabsSticky] = useState(false);

  // Breadcrumb integration
  const { customBreadcrumbs, breadcrumbData } = useBreadcrumbContext();
  const autoBreadcrumbs = useBreadcrumbs(location.pathname, {
    customItems: customBreadcrumbs || undefined,
    ...breadcrumbData,
  });

  // Handle sticky tabs logic
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Handle sticky tabs logic
      const appBar = document.querySelector(".MuiAppBar-root");
      const tabsElement = document.querySelector(".MuiTabs-root");
      if (appBar && tabsElement) {
        const appBarRect = appBar.getBoundingClientRect();
        const appBarBottom = appBarRect.bottom;

        if (!isTabsSticky) {
          // Not sticky yet - check if tabs should become sticky
          const tabsRect = tabsElement.getBoundingClientRect();
          const isTouchingPanel = tabsRect.top <= appBarBottom;

          if (isTouchingPanel) {
            // Store the original position before making sticky
            const scrollTop =
              window.pageYOffset || document.documentElement.scrollTop;
            setOriginalTabsTop(tabsRect.top + scrollTop);
            setIsTabsSticky(true);
          }
        } else {
          // Already sticky - check if should unstick
          // Calculate where the tabs would naturally be if not sticky
          const naturalTabsTop = originalTabsTop - currentScrollY;

          // Unstick if the natural position would be below the AppBar bottom
          // This means we've scrolled back up enough that tabs would be visible
          if (naturalTabsTop > appBarBottom) {
            setIsTabsSticky(false);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isTabsSticky, originalTabsTop]);

  // Monitor for tabs elements and set up sticky behavior
  React.useEffect(() => {
    const findTabsElement = () => {
      // Look for MUI Tabs components in the content area
      const contentArea = document.querySelector('[component="main"]');
      if (contentArea) {
        const tabsElement = contentArea.querySelector(".MuiTabs-root");
        if (tabsElement && tabsElement !== stickyTabsElement) {
          const tabsContainer = tabsElement.closest(
            ".MuiBox-root",
          ) as HTMLElement;
          const targetElement = tabsContainer || (tabsElement as HTMLElement);

          setStickyTabsElement(targetElement);

          // Calculate the original position
          const rect = targetElement.getBoundingClientRect();
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          setOriginalTabsTop(rect.top + scrollTop);
        }
      }
    };

    // Initial search
    findTabsElement();

    // Set up a mutation observer to detect when tabs are added to the DOM
    const observer = new MutationObserver(() => {
      findTabsElement();
    });

    const contentArea = document.querySelector('[component="main"]');
    if (contentArea) {
      observer.observe(contentArea, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [stickyTabsElement]);

  // Apply sticky styles to tabs element
  React.useEffect(() => {
    const tabsElement = document.querySelector(".MuiTabs-root");
    const tabsContainer = tabsElement?.closest(".MuiBox-root") as HTMLElement;
    const targetElement = tabsContainer || (tabsElement as HTMLElement);

    if (targetElement) {
      if (isTabsSticky) {
        // Make tabs sticky at bottom of main panel
        targetElement.style.position = "fixed";
        targetElement.style.top = "64px"; // Bottom of AppBar
        targetElement.style.left = drawerCollapsed
          ? `${UI_CONSTANTS.DRAWER_WIDTH_COLLAPSED}px`
          : `${UI_CONSTANTS.DRAWER_WIDTH}px`;
        targetElement.style.right = "0";
        targetElement.style.zIndex = "1200"; // Below AppBar but above content
        targetElement.style.backgroundColor = "#fff";
        targetElement.style.borderBottom = "1px solid #e0e0e0";
        targetElement.style.paddingLeft = "24px";
        targetElement.style.paddingRight = "24px";
        targetElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        targetElement.style.transition = "left 0.3s ease"; // Add smooth transition

        // Add padding to the next sibling to prevent content from hiding under sticky tabs
        const nextSibling = targetElement.nextElementSibling as HTMLElement;
        if (nextSibling) {
          const tabsHeight = targetElement.offsetHeight;
          nextSibling.style.paddingTop = `${tabsHeight + 20}px`; // 20px extra spacing
        }
      } else {
        // Remove sticky styles
        targetElement.style.position = "";
        targetElement.style.top = "";
        targetElement.style.left = "";
        targetElement.style.right = "";
        targetElement.style.zIndex = "";
        targetElement.style.backgroundColor = "";
        targetElement.style.borderBottom = "";
        targetElement.style.paddingLeft = "";
        targetElement.style.paddingRight = "";
        targetElement.style.boxShadow = "";
        targetElement.style.transition = ""; // Remove transition

        // Remove padding from next sibling
        const nextSibling = targetElement.nextElementSibling as HTMLElement;
        if (nextSibling) {
          nextSibling.style.paddingTop = "";
        }
      }
    }
  }, [isTabsSticky, drawerCollapsed]);

  // Clean up sticky styles when component unmounts or tabs element changes
  React.useEffect(() => {
    return () => {
      if (stickyTabsElement) {
        stickyTabsElement.style.position = "";
        stickyTabsElement.style.top = "";
        stickyTabsElement.style.left = "";
        stickyTabsElement.style.right = "";
        stickyTabsElement.style.zIndex = "";
        stickyTabsElement.style.backgroundColor = "";
        stickyTabsElement.style.borderBottom = "";
        stickyTabsElement.style.paddingLeft = "";
        stickyTabsElement.style.paddingRight = "";
        stickyTabsElement.style.boxShadow = "";
      }
    };
  }, [stickyTabsElement]);

  // Trigger DataGrid resize when drawer state changes
  React.useEffect(() => {
    // Small delay to allow CSS transitions to complete before triggering resize
    const timer = setTimeout(() => {
      try {
        // Trigger resize event to make DataGrids recalculate their dimensions
        window.dispatchEvent(new Event('resize'));
      } catch (error) {
        console.warn('Error dispatching resize event:', error);
      }
    }, 350); // Slightly longer than the CSS transition duration
    
    return () => clearTimeout(timer);
  }, [drawerCollapsed]);

  // Auto-expand System menu when on setup routes
  React.useEffect(() => {
    if (location.pathname.startsWith("/setup")) {
      setExpandedItems((prev) => {
        if (!prev.includes("setup")) {
          return [...prev, "setup"];
        }
        return prev;
      });
    }
  }, [location.pathname]);


  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < 960) {
      setMobileOpen(false);
    }
  };

  const handleDrawerCollapse = () => {
    setDrawerCollapsed(!drawerCollapsed);
    // Clear expanded items when collapsing
    if (!drawerCollapsed) {
      setExpandedItems([]);
    }
  };

  const handleExpandClick = (itemKey: string) => {
    // Don't allow expansion when drawer is collapsed
    if (drawerCollapsed) return;

    setExpandedItems((prev) =>
      prev.includes(itemKey)
        ? prev.filter((key) => key !== itemKey)
        : [...prev, itemKey],
    );
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const renderMenuItem = (item: MenuItemType, level = 0) => {
    const IconComponent = iconMap[item.icon];
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.key);
    const active = isActive(item.path);

    // Safety check for icon component
    if (!IconComponent) {
      console.warn(`Icon "${item.icon}" not found in iconMap for menu item "${item.label}"`);
    }

    return (
      <React.Fragment key={item.key}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleExpandClick(item.key);
              } else {
                handleMenuItemClick(item.path);
              }
            }}
            selected={active && !hasChildren}
            sx={{
              pl: drawerCollapsed ? 1 : 2 + level * 2,
              minHeight: 48,
              justifyContent: drawerCollapsed ? "center" : "flex-start",
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                "& .MuiListItemIcon-root": {
                  color: "inherit",
                },
              },
            }}
            title={drawerCollapsed ? item.label : undefined}
          >
            <ListItemIcon sx={{ minWidth: drawerCollapsed ? 0 : 40 }}>
              {IconComponent ? React.createElement(IconComponent) : null}
            </ListItemIcon>
            {!drawerCollapsed && (
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 16, // Increased from 14
                  fontWeight: active ? 600 : 400,
                }}
              />
            )}
            {!drawerCollapsed &&
              hasChildren &&
              (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {!drawerCollapsed && hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerWidth = drawerCollapsed
    ? UI_CONSTANTS.DRAWER_WIDTH_COLLAPSED
    : UI_CONSTANTS.DRAWER_WIDTH;

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar>
        {!drawerCollapsed ? (
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 600, flexGrow: 1 }}
          >
            Opinion Admin
          </Typography>
        ) : (
          <Box sx={{ flexGrow: 1 }} />
        )}
        <IconButton
          onClick={handleDrawerCollapse}
          size="small"
          sx={{
            display: { xs: "none", md: "inline-flex" },
            color: "text.secondary",
          }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List sx={{ pt: 1 }}>
          {MENU_ITEMS.map((item) => renderMenuItem(item))}
        </List>
      </Box>
      <Divider />
      {!drawerCollapsed && (
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            © 2024 Inqwise Ltd
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ 
      display: "flex",
      width: '100%',
      minWidth: 0, // Allow shrinking
      maxWidth: '100vw', // Prevent overflow
      overflowX: 'hidden', // Prevent horizontal scroll
    }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { 
            xs: '100%', // Full width on mobile
            md: `calc(100% - ${drawerWidth}px)` 
          },
          ml: { md: `${drawerWidth}px` },
          maxWidth: '100vw', // Prevent overflow
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#ECEFF6",
          color: "#333",
          boxShadow: "none",
          borderBottom: "1px solid #DEDEDE",
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Breadcrumbs in Title Area */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              minWidth: 0,
              height: "100%", // Take full height of toolbar
            }}
          >
            <Breadcrumb
              items={
                autoBreadcrumbs.length > 0
                  ? autoBreadcrumbs
                  : [{ label: "Home", path: "/" }]
              }
              sx={{
                mb: 0, // Remove default margin-bottom
                display: "flex",
                alignItems: "center",
                "& .MuiBreadcrumbs-root": {
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiBreadcrumbs-ol": {
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiLink-root": {
                  color: "#333",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                },
                "& .MuiTypography-root": {
                  color: "#333",
                  fontWeight: 600,
                },
              }}
            />
          </Box>

          {/* User Menu */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="user-menu"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
              <AccountCircle />
            </Avatar>
          </IconButton>

          <Menu
            id="user-menu"
            anchorEl={userMenuAnchor}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
          >
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleUserMenuClose();
                navigate(ROUTES.SETTINGS);
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: UI_CONSTANTS.DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              transition: (theme) =>
                theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 }, // Responsive padding
          width: { 
            xs: '100%', // Full width on mobile
            md: `calc(100% - ${drawerWidth}px)` 
          },
          minWidth: 0, // Allow shrinking
          maxWidth: '100vw', // Prevent overflow
          minHeight: "100vh",
          backgroundColor: "grey.50",
          overflowX: 'hidden', // Prevent horizontal scroll
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar /> {/* This creates space for the fixed AppBar */}
        <Box
          sx={{
            width: '100%',
            minWidth: 0, // Allow content to shrink
            overflowX: 'hidden', // Prevent horizontal scroll
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
