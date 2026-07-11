import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddTaskIcon from "@mui/icons-material/AddTask";
import ViewListIcon from "@mui/icons-material/ViewList";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 220;

export type AdminPage = "dashboard" | "create" | "view";
export type EmployeePage = "dashboard" | "my-work";

interface LayoutProps {
  children: ReactNode;
  view: "admin" | "employee";
  onViewChange: (view: "admin" | "employee") => void;
  adminPage: AdminPage;
  onAdminPageChange: (page: AdminPage) => void;
  employeePage: EmployeePage;
  onEmployeePageChange: (page: EmployeePage) => void;
}

function Layout({
  children,
  view,
  adminPage,
  onAdminPageChange,
  employeePage,
  onEmployeePageChange,
}: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { logout } = useAuth();

  const handleAdminNav = (page: AdminPage) => {
    onAdminPageChange(page);
    if (isMobile) setMobileOpen(false);
  };

  const handleEmployeeNav = (page: EmployeePage) => {
    onEmployeePageChange(page);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setLogoutOpen(false);
    if (isMobile) setMobileOpen(false);
  };

  const navList = (
    <List sx={{ px: 1, mt: 1 }}>
      {view === "admin" && (
        <>
          <ListItemButton
            selected={adminPage === "dashboard"}
            onClick={() => handleAdminNav("dashboard")}
            sx={{
              borderRadius: 2,
              mb: 0.6,
              py: 1,
              px: 1.2,
              color: "text.secondary",
              "&.Mui-selected": {
                bgcolor: "rgba(37, 99, 235, 0.12)",
                color: "primary.main",
                fontWeight: 700,
              },
              "&:hover": { bgcolor: "rgba(15, 23, 42, 0.04)" },
            }}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton
            selected={adminPage === "create"}
            onClick={() => handleAdminNav("create")}
            sx={{
              borderRadius: 2,
              mb: 0.6,
              py: 1,
              px: 1.2,
              color: "text.secondary",
              "&.Mui-selected": {
                bgcolor: "rgba(37, 99, 235, 0.12)",
                color: "primary.main",
                fontWeight: 700,
              },
              "&:hover": { bgcolor: "rgba(15, 23, 42, 0.04)" },
            }}
          >
            <ListItemIcon>
              <AddTaskIcon />
            </ListItemIcon>
            <ListItemText primary="Create Task" />
          </ListItemButton>
          <ListItemButton
            selected={adminPage === "view"}
            onClick={() => handleAdminNav("view")}
            sx={{
              borderRadius: 2,
              mb: 0.6,
              py: 1,
              px: 1.2,
              color: "text.secondary",
              "&.Mui-selected": {
                bgcolor: "rgba(37, 99, 235, 0.12)",
                color: "primary.main",
                fontWeight: 700,
              },
              "&:hover": { bgcolor: "rgba(15, 23, 42, 0.04)" },
            }}
          >
            <ListItemIcon>
              <ViewListIcon />
            </ListItemIcon>
            <ListItemText primary="View Tasks" />
          </ListItemButton>
        </>
      )}
      {view === "employee" && (
        <>
          <ListItemButton
            selected={employeePage === "dashboard"}
            onClick={() => handleEmployeeNav("dashboard")}
            sx={{
              borderRadius: 2,
              mb: 0.6,
              py: 1,
              px: 1.2,
              color: "text.secondary",
              "&.Mui-selected": {
                bgcolor: "rgba(37, 99, 235, 0.12)",
                color: "primary.main",
                fontWeight: 700,
              },
              "&:hover": { bgcolor: "rgba(15, 23, 42, 0.04)" },
            }}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton
            selected={employeePage === "my-work"}
            onClick={() => handleEmployeeNav("my-work")}
            sx={{
              borderRadius: 2,
              mb: 0.6,
              py: 1,
              px: 1.2,
              color: "text.secondary",
              "&.Mui-selected": {
                bgcolor: "rgba(37, 99, 235, 0.12)",
                color: "primary.main",
                fontWeight: 700,
              },
              "&:hover": { bgcolor: "rgba(15, 23, 42, 0.04)" },
            }}
          >
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="My Work" />
          </ListItemButton>
        </>
      )}

      <Box sx={{ mt: 2, pt: 1.5 }}>
        <Divider sx={{ mb: 1.2 }} />
        <ListItemButton
          onClick={() => setLogoutOpen(true)}
          sx={{
            borderRadius: 2,
            py: 1,
            px: 1.2,
            color: "error.main",
            bgcolor: "rgba(211, 47, 47, 0.06)",
            "&:hover": { bgcolor: "rgba(211, 47, 47, 0.12)" },
          }}
        >
          <ListItemIcon sx={{ color: "error.main", minWidth: 36 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </List>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          zIndex: 1201,
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 2px 18px rgba(15, 23, 42, 0.04)",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: { xs: 64, md: 72 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "primary.main",
                letterSpacing: "-0.02em",
              }}
              noWrap
            >
              Task Manager
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid rgba(15, 23, 42, 0.06)",
              backgroundColor: "rgba(248, 250, 252, 0.96)",
            },
          }}
        >
          <Toolbar />
          <Box sx={{ px: 1.5, py: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1,
                color: "text.secondary",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Navigation
            </Typography>
            {navList}
          </Box>
        </Drawer>
      )}

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid rgba(15, 23, 42, 0.06)",
              backgroundColor: "rgba(248, 250, 252, 0.96)",
            },
          }}
        >
          <Toolbar />
          <Box sx={{ px: 1.5, py: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1,
                color: "text.secondary",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Navigation
            </Typography>
            {navList}
          </Box>
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          background:
            "radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 32%), #f7f8fa",
        }}
      >
        <Toolbar />
        {children}
      </Box>

      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <DialogTitle>Log out?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to log out of your account?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLogoutOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Layout;
