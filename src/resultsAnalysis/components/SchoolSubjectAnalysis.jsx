import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import { exportToPDF, exportToExcel } from "../utils/analysisHelpers";

const SchoolSubjectAnalysis = ({ data }) => {
  const [subjectAnalysis, setSubjectAnalysis] = useState([]);

  const SUBJECT_COLUMNS = {
    F: "English Language",
    G: "Social Studies",
    H: "R.M.E",
    I: "Mathematics",
    J: "Integrated Science",
    K: "I.C.T",
    L: "French",
    M: "Gh. Language",
    N: "B.D.T",
  };

  useEffect(() => {
    if (data && data.length > 0) {
      const analysis = processSubjectData(data);
      setSubjectAnalysis(analysis);
    }
  }, [data]);

  const processSubjectData = (rows) => {
    const analysis = {};

    // Initialize analysis object for each subject
    Object.values(SUBJECT_COLUMNS).forEach((subject) => {
      analysis[subject] = {
        subjectName: subject,
        noPresented: 0,
        noPass: 0,
        percentage: 0,
        boysPresented: 0,
        boysPass: 0,
        boysPercentage: 0,
        girlsPresented: 0,
        girlsPass: 0,
        girlsPercentage: 0,
        average: 0,
        position: 0,
        totalGrades: 0,
      };
    });

    // Process each row
    rows.forEach((row) => {
      const gender = row.C;

      Object.entries(SUBJECT_COLUMNS).forEach(([col, subject]) => {
        const grade = parseInt(row[col]);
        if (!isNaN(grade)) {
          const subjectData = analysis[subject];

          // Update total counts
          subjectData.noPresented++;
          subjectData.totalGrades += grade;
          if (grade <= 6) subjectData.noPass++;

          // Update gender-specific counts
          if (gender === "M") {
            subjectData.boysPresented++;
            if (grade <= 6) subjectData.boysPass++;
          } else if (gender === "F") {
            subjectData.girlsPresented++;
            if (grade <= 6) subjectData.girlsPass++;
          }
        }
      });
    });

    // Calculate percentages and averages
    Object.values(analysis).forEach((subject) => {
      subject.percentage = (
        (subject.noPass / subject.noPresented) *
        100
      ).toFixed(2);
      subject.boysPercentage = (
        (subject.boysPass / subject.boysPresented) *
        100
      ).toFixed(2);
      subject.girlsPercentage = (
        (subject.girlsPass / subject.girlsPresented) *
        100
      ).toFixed(2);
      subject.average = (subject.totalGrades / subject.noPresented).toFixed(2);
    });

    // Calculate positions based on average scores
    const sortedSubjects = Object.values(analysis).sort(
      (a, b) => a.average - b.average
    );
    sortedSubjects.forEach((subject, index) => {
      subject.position = index + 1;
    });

    return Object.values(analysis);
  };

  const handleExport = (format) => {
    const exportData = subjectAnalysis.map((subject) => ({
      "Subject Name": subject.subjectName,
      "No. Presented": subject.noPresented,
      "No. Pass": subject.noPass,
      Percentage: subject.percentage + "%",
      "Boys Presented": subject.boysPresented,
      "Boys Pass": subject.boysPass,
      "Boys Percentage": subject.boysPercentage + "%",
      "Girls Presented": subject.girlsPresented,
      "Girls Pass": subject.girlsPass,
      "Girls Percentage": subject.girlsPercentage + "%",
      Average: subject.average,
      Position: subject.position,
    }));

    if (format === "pdf") {
      const tableData = subjectAnalysis.map((subject) => [
        subject.subjectName,
        subject.noPresented,
        subject.noPass,
        subject.percentage + "%",
        subject.boysPresented,
        subject.boysPass,
        subject.boysPercentage + "%",
        subject.girlsPresented,
        subject.girlsPass,
        subject.girlsPercentage + "%",
        subject.average,
        subject.position,
      ]);

      exportToPDF(tableData, "School Subject Analysis", [
        "Subject",
        "No. Presented",
        "No. Pass",
        "Percentage",
        "Boys Presented",
        "Boys Pass",
        "Boys %",
        "Girls Presented",
        "Girls Pass",
        "Girls %",
        "Average",
        "Position",
      ]);
    } else {
      exportToExcel(exportData, "School Subject Analysis", "subject-analysis");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3 }}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h5">School Subject Analysis</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => handleExport("pdf")}
          >
            Export PDF
          </Button>
          
        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small" sx={{ whiteSpace: "nowrap" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ color: "white" }}>Subject Name</TableCell>
              <TableCell sx={{ color: "white" }} align="center" colSpan={3}>
                TOTAL
              </TableCell>
              <TableCell sx={{ color: "white" }} align="center" colSpan={3}>
                BOYS
              </TableCell>
              <TableCell sx={{ color: "white" }} align="center" colSpan={3}>
                GIRLS
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                Average
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                Position
              </TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ color: "white" }}></TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                No. Presented
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                No. Pass
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                Percentage
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                Presented
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                Pass
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                Percentage
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                Presented
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                Pass
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                Percentage
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right"></TableCell>
              <TableCell sx={{ color: "white" }} align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjectAnalysis.map((subject) => (
              <TableRow
                key={subject.subjectName}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                }}
              >
                <TableCell>{subject.subjectName}</TableCell>
                <TableCell align="right">{subject.noPresented}</TableCell>
                <TableCell align="right">{subject.noPass}</TableCell>
                <TableCell align="right">{subject.percentage}%</TableCell>
                <TableCell align="right">{subject.boysPresented}</TableCell>
                <TableCell align="right">{subject.boysPass}</TableCell>
                <TableCell align="right">{subject.boysPercentage}%</TableCell>
                <TableCell align="right">{subject.girlsPresented}</TableCell>
                <TableCell align="right">{subject.girlsPass}</TableCell>
                <TableCell align="right">{subject.girlsPercentage}%</TableCell>
                <TableCell align="right">{subject.average}</TableCell>
                <TableCell align="right">{subject.position}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SchoolSubjectAnalysis;
