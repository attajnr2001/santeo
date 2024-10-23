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

const SchoolSubjectAnalysis = ({
  data,
  headers,
  subjectGrades,
  genderData,
}) => {
  const [subjectAnalysis, setSubjectAnalysis] = useState([]);

  useEffect(() => {
    if (data && data.length > 0 && headers && subjectGrades && genderData) {
      // Process the Subject-wise Grade Distribution data
      console.log("Processing data for analysis");

      // Process the subject data
      const analysis = Object.entries(subjectGrades).map(
        ([subject, grades]) => {
          const noPresented = grades.length;
          const noPass = grades.filter((grade) => grade <= 6).length;
          const totalGrades = grades.reduce((sum, grade) => sum + grade, 0);

          // Get gender-specific grades from genderData
          const boysGrades = genderData[subject].M;
          const girlsGrades = genderData[subject].F;

          const boysPresented = boysGrades.length;
          const boysPass = boysGrades.filter((grade) => grade <= 6).length;

          const girlsPresented = girlsGrades.length;
          const girlsPass = girlsGrades.filter((grade) => grade <= 6).length;

          return {
            subjectName: subject,
            noPresented,
            noPass,
            percentage: noPresented
              ? ((noPass / noPresented) * 100).toFixed(2)
              : "0.00",
            boysPresented,
            boysPass,
            boysPercentage: boysPresented
              ? ((boysPass / boysPresented) * 100).toFixed(2)
              : "0.00",
            girlsPresented,
            girlsPass,
            girlsPercentage: girlsPresented
              ? ((girlsPass / girlsPresented) * 100).toFixed(2)
              : "0.00",
            average: noPresented
              ? (totalGrades / noPresented).toFixed(2)
              : "0.00",
          };
        }
      );

      // Sort by average and assign positions
      const sortedAnalysis = analysis
        .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
        .map((subject, index) => ({
          ...subject,
          position: index + 1,
        }));

      console.log("Processed Analysis:", sortedAnalysis);
      setSubjectAnalysis(sortedAnalysis);
    }
  }, [data, headers, subjectGrades, genderData]);

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
          <Button
            variant="outlined"
            startIcon={<TableViewIcon />}
            onClick={() => handleExport("excel")}
          >
            Export Excel
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
