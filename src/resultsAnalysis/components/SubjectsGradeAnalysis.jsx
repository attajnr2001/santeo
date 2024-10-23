import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
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

const SubjectsGradeAnalysis = ({
  data,
  headers,
  subjectGrades,
  genderData,
}) => {
  const [subjectsData, setSubjectsData] = useState({});

  useEffect(() => {
    if (data && data.length > 0 && headers && genderData) {
      const processedData = processResults();
      setSubjectsData(processedData);
    }
  }, [data, headers, genderData]);

  const processResults = () => {
    const subjectGradesData = {};

    // Get all subjects from headers
    Object.values(headers).forEach((subject) => {
      subjectGradesData[subject] = {};
      // Initialize grades 1-9 for each subject
      for (let grade = 1; grade <= 9; grade++) {
        subjectGradesData[subject][grade] = {
          boys: 0,
          girls: 0,
          total: 0,
        };
      }
    });

    // Process the data
    data.forEach((row) => {
      Object.entries(headers).forEach(([col, subject]) => {
        const grade = parseInt(row[col]);
        const gender = row["F"]; // Gender column

        if (!isNaN(grade) && grade >= 1 && grade <= 9) {
          if (gender === "M") {
            subjectGradesData[subject][grade].boys += 1;
          } else if (gender === "F") {
            subjectGradesData[subject][grade].girls += 1;
          }
          subjectGradesData[subject][grade].total += 1;
        }
      });
    });

    return subjectGradesData;
  };

  const SubjectTable = ({ subject, gradeData }) => {
    const grades = Object.keys(gradeData)
      .map(Number)
      .sort((a, b) => a - b);

    // Calculate totals for the subject
    const totals = grades.reduce(
      (acc, grade) => {
        acc.girls += gradeData[grade].girls;
        acc.boys += gradeData[grade].boys;
        acc.total += gradeData[grade].total;
        return acc;
      },
      { girls: 0, boys: 0, total: 0 }
    );

    return (
      <Box className="mb-6">
        <Typography variant="h6" className="mb-2 font-bold">
          {subject}
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small" sx={{ whiteSpace: "nowrap" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.light" }}>
                <TableCell className="text-white font-bold">Grade</TableCell>
                <TableCell className="text-white font-bold text-right">
                  Girls
                </TableCell>
                <TableCell className="text-white font-bold text-right">
                  Boys
                </TableCell>
                <TableCell className="text-white font-bold text-right">
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade} className="hover:bg-gray-50">
                  <TableCell>{grade}</TableCell>
                  <TableCell align="right">{gradeData[grade].girls}</TableCell>
                  <TableCell align="right">{gradeData[grade].boys}</TableCell>
                  <TableCell align="right">{gradeData[grade].total}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-100 font-bold">
                <TableCell>Total</TableCell>
                <TableCell align="right">{totals.girls}</TableCell>
                <TableCell align="right">{totals.boys}</TableCell>
                <TableCell align="right">{totals.total}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box className="p-4">
      <Stack direction="row" className="mb-6 items-center justify-between">
        <Typography variant="h5" className="font-bold">
          Subjects Grade Analysis
        </Typography>
        <Stack direction="row" className="space-x-2">
          <Button variant="outlined" onClick={() => handleExport("pdf")}>
            <PictureAsPdfIcon />
            Export PDF
          </Button>
        </Stack>
      </Stack>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(subjectsData).map(([subject, gradeData]) => (
          <SubjectTable key={subject} subject={subject} gradeData={gradeData} />
        ))}
      </div>
    </Box>
  );
};

export default SubjectsGradeAnalysis;
