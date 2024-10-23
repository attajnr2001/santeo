import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import { exportToPDF, exportToExcel } from "../utils/analysisHelpers";

const SubjectsGradeAnalysis = ({ data }) => {
  const [subjectsData, setSubjectsData] = useState({});

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
      const processedData = processResults(data);
      setSubjectsData(processedData);
    }
  }, [data]);

  const processResults = (rows) => {
    const subjectGrades = {};

    // Initialize subject grades structure
    Object.values(SUBJECT_COLUMNS).forEach((subject) => {
      subjectGrades[subject] = {};
      // Initialize grade counts (1-9)
      for (let grade = 1; grade <= 9; grade++) {
        subjectGrades[subject][grade] = {
          boys: 0,
          girls: 0,
          total: 0,
        };
      }
    });

    // Process each row
    rows.forEach((row) => {
      const gender = row.C === "M" ? "boys" : "girls";

      // Process each subject column
      Object.entries(SUBJECT_COLUMNS).forEach(([col, subject]) => {
        const grade = parseInt(row[col]);
        if (!isNaN(grade) && grade >= 1 && grade <= 9) {
          subjectGrades[subject][grade][gender] += 1;
          subjectGrades[subject][grade].total += 1;
        }
      });
    });

    return subjectGrades;
  };

  const handleExport = (format) => {
    // Transform data for export
    const exportData = Object.entries(subjectsData).flatMap(
      ([subject, grades]) =>
        Object.entries(grades).map(([grade, counts]) => ({
          Subject: subject,
          Grade: grade,
          Girls: counts.girls,
          Boys: counts.boys,
          Total: counts.total,
        }))
    );

    if (format === "pdf") {
      const tableData = exportData.map((row) => [
        row.Subject,
        row.Grade,
        row.Girls,
        row.Boys,
        row.Total,
      ]);

      exportToPDF(tableData, "Subjects Grade Analysis", [
        "Subject",
        "Grade",
        "Girls",
        "Boys",
        "Total",
      ]);
    } else {
      exportToExcel(
        exportData,
        "Subjects Grade Analysis",
        "subjects-grade-analysis"
      );
    }
  };

  const SubjectTable = ({ subject, gradeData }) => {
    const grades = Object.keys(gradeData)
      .map(Number)
      .sort((a, b) => a - b);

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {subject}
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{ whiteSpace: "nowrap" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.light" }}>
                <TableCell sx={{ color: "white" }}>Grade</TableCell>
                <TableCell sx={{ color: "white" }} align="right">
                  Girls
                </TableCell>
                <TableCell sx={{ color: "white" }} align="right">
                  Boys
                </TableCell>
                <TableCell sx={{ color: "white" }} align="right">
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.map((grade) => (
                <TableRow
                  key={grade}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                  }}
                >
                  <TableCell>{grade}</TableCell>
                  <TableCell align="right">{gradeData[grade].girls}</TableCell>
                  <TableCell align="right">{gradeData[grade].boys}</TableCell>
                  <TableCell align="right">{gradeData[grade].total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
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
        <Typography variant="h5">Subjects Grade Analysis</Typography>
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

      {Object.entries(subjectsData).map(([subject, gradeData]) => (
        <SubjectTable key={subject} subject={subject} gradeData={gradeData} />
      ))}
    </Box>
  );
};

export default SubjectsGradeAnalysis;
