import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { Container } from "@mui/material";

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <Container sx={{ mb: 5 }}>
        <Outlet />
      </Container>
    </div>
  );
};

export default Dashboard;
