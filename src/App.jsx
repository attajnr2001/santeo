import React from "react";
import theme from "./resultsAnalysis/helpers/Theme";
import { ThemeProvider } from "@mui/material/styles";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Login from "./resultsAnalysis/pages/Login";
import Dashboard from "./resultsAnalysis/pages/Dashboard";
import Home from "./resultsAnalysis/components/Home";
import ProtectedRoute from "./resultsAnalysis/components/ProtectedRoute";
import { AuthContextProvider } from "./resultsAnalysis/context/AuthContext";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="" element={<Home />} />
        </Route>
      </>
    )
  );

  return (
    <AuthContextProvider>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthContextProvider>
  );
};

export default App;
