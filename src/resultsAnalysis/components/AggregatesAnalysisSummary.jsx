import React from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const AggregatesAnalysisSummary = ({ data = [] }) => {
  // Filter valid numeric data
  const getValidNumericData = () => {
    return data.filter(
      (item) =>
        item &&
        typeof item.aggregate === "number" &&
        !isNaN(item.aggregate) &&
        isFinite(item.aggregate) &&
        typeof item.total === "number" &&
        !isNaN(item.total) &&
        isFinite(item.total)
    );
  };

  const getTotalCandidates = () => {
    return (
      getValidNumericData().reduce((sum, item) => sum + item.total, 0) || 0
    );
  };

  const getTotalByGender = (gender) => {
    const key = gender.toLowerCase();
    return getValidNumericData().reduce((sum, item) => {
      const value = item[key];
      return sum + (typeof value === "number" && !isNaN(value) ? value : 0);
    }, 0);
  };

  const getPassingStudents = () => {
    return getValidNumericData().reduce((sum, item) => {
      return item.aggregate <= 36 ? sum + item.total : sum;
    }, 0);
  };

  const getPassingStudentsByGender = (gender) => {
    const key = gender.toLowerCase();
    return getValidNumericData().reduce((sum, item) => {
      const value = item[key];
      return item.aggregate <= 36
        ? sum + (typeof value === "number" && !isNaN(value) ? value : 0)
        : sum;
    }, 0);
  };

  const getPassPercentage = () => {
    const total = getTotalCandidates();
    return total ? ((getPassingStudents() / total) * 100).toFixed(2) : "0.00";
  };

  const getPassPercentageByGender = (gender) => {
    const total = getTotalByGender(gender);
    return total
      ? ((getPassingStudentsByGender(gender) / total) * 100).toFixed(2)
      : "0.00";
  };

  const getAverageAggregate = () => {
    const validData = getValidNumericData();
    const totalStudents = validData.reduce((sum, item) => sum + item.total, 0);

    if (!totalStudents) return "0.00";

    const weightedSum = validData.reduce(
      (sum, item) => sum + item.aggregate * item.total,
      0
    );

    return (weightedSum / totalStudents).toFixed(2);
  };

  const getValidAggregateRows = () => {
    // Sort data by aggregate score, only including valid numeric data
    return getValidNumericData().sort((a, b) => a.aggregate - b.aggregate);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("AGGREGATES ANALYSIS SUMMARY", 15, 15);

    // Summary table
    doc.autoTable({
      startY: 25,
      head: [["Description", "Value", "Description", "Value"]],
      body: [
        [
          "Total Number Of Candidates Presented",
          getTotalCandidates(),
          "Total Number Of Candidates Pass",
          getPassingStudents(),
        ],
        [
          "Total Number Of Girls Presented",
          getTotalByGender("girls"),
          "Total Number Of Girls Pass",
          getPassingStudentsByGender("girls"),
        ],
        [
          "Total Number Of Boys Presented",
          getTotalByGender("boys"),
          "Total Number Of Boys Pass",
          getPassingStudentsByGender("boys"),
        ],
        [
          "Percentage Pass",
          `${getPassPercentage()}%`,
          "Average Of Aggregate",
          getAverageAggregate(),
        ],
        [
          "Percentage Of Girls Pass",
          `${getPassPercentageByGender("girls")}%`,
          "",
          "",
        ],
        [
          "Percentage Of Boys Pass",
          `${getPassPercentageByGender("boys")}%`,
          "",
          "",
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [100, 149, 237] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40 },
        2: { cellWidth: 60 },
        3: { cellWidth: 40 },
      },
    });

    // Distribution table
    const validRows = getValidAggregateRows();
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Aggregate", "Boys", "Girls", "Total"]],
      body: validRows.map((row) => [
        row.aggregate,
        row.boys,
        row.girls,
        row.total,
      ]),
      theme: "grid",
      headStyles: { fillColor: [100, 149, 237] },
    });

    doc.save("aggregates-analysis-summary.pdf");
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" sx={{ color: "primary.main" }}>
          AGGREGATES ANALYSIS SUMMARY
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleExportPDF}
        >
          Export PDF
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small" sx={{ whiteSpace: "nowrap" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ color: "white" }}>Description</TableCell>
              <TableCell sx={{ color: "white" }}>Value</TableCell>
              <TableCell sx={{ color: "white" }}>Description</TableCell>
              <TableCell sx={{ color: "white" }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Total Number Of Candidates Presented</TableCell>
              <TableCell>{getTotalCandidates()}</TableCell>
              <TableCell>Total Number Of Candidates Pass</TableCell>
              <TableCell>{getPassingStudents()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Number Of Girls Presented</TableCell>
              <TableCell>{getTotalByGender("girls")}</TableCell>
              <TableCell>Total Number Of Girls Pass</TableCell>
              <TableCell>{getPassingStudentsByGender("girls")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Number Of Boys Presented</TableCell>
              <TableCell>{getTotalByGender("boys")}</TableCell>
              <TableCell>Total Number Of Boys Pass</TableCell>
              <TableCell>{getPassingStudentsByGender("boys")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Percentage Pass</TableCell>
              <TableCell>{getPassPercentage()}%</TableCell>
              <TableCell>Average Of Aggregate</TableCell>
              <TableCell>{getAverageAggregate()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Percentage Of Girls Pass</TableCell>
              <TableCell>{getPassPercentageByGender("girls")}%</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Percentage Of Boys Pass</TableCell>
              <TableCell>{getPassPercentageByGender("boys")}%</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer component={Paper}>
        <Table size="small" sx={{ whiteSpace: "nowrap" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ color: "white" }}>Aggregate</TableCell>
              <TableCell sx={{ color: "white" }}>Boys</TableCell>
              <TableCell sx={{ color: "white" }}>Girls</TableCell>
              <TableCell sx={{ color: "white" }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getValidAggregateRows().map((row) => (
              <TableRow key={row.aggregate}>
                <TableCell>{row.aggregate}</TableCell>
                <TableCell>{row.boys}</TableCell>
                <TableCell>{row.girls}</TableCell>
                <TableCell>{row.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AggregatesAnalysisSummary;
