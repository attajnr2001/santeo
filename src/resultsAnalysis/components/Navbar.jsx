import React, { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { auth } from "../helpers/firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  // Handle menu open/close
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("user"); // Clear localStorage
      dispatch({ type: "LOGOUT" });
      navigate("/");
    } catch (error) {
      setError("Failed to logout. Please try again.");
    }
    handleClose();
  };

  // Handle password change dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
    handleClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOldPassword("");
    setNewPassword("");
  };

  // Handle password change
  const handlePasswordChange = async () => {
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, oldPassword);

      // First reauthenticate
      await reauthenticateWithCredential(user, credential);

      // Then update password
      await updatePassword(user, newPassword);

      setSuccess("Password successfully updated!");
      handleCloseDialog();
    } catch (error) {
      let errorMessage = "Failed to change password.";
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect.";
      } else if (error.code === "auth/weak-password") {
        errorMessage =
          "New password is too weak. It should be at least 6 characters.";
      }
      setError(errorMessage);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              letterSpacing: 1,
              display: "flex",
              alignItems: "center"
            }}
          >
            <img
              src="/icon.jpg"
              alt="Santeo Logo"
              style={{
                height: "30px", // Adjust this value to match your desired logo size
                marginRight: "10px", // Add some spacing between logo and text
                objectFit: "contain",
              }}
            />
            SANTEO
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              color="inherit"
              sx={{
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              sx={{
                textTransform: "none",
                fontSize: "1rem",
              }}
              onClick={handleClick}
              aria-controls={open ? "settings-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              Settings
            </Button>
            <Menu
              id="settings-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "settings-button",
              }}
            >
              <MenuItem onClick={handleOpenDialog}>Change Password</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Password Change Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handlePasswordChange}>Change Password</Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccess("")}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
