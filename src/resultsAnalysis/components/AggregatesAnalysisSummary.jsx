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
  // Calculate summary statistics
  const getTotalCandidates = () => {
    return data.reduce((sum, item) => sum + item.total, 0) || 0;
  };

  const getTotalByGender = (gender) => {
    return data.reduce((sum, item) => sum + item[gender.toLowerCase()], 0) || 0;
  };

  const getPassingStudents = () => {
    return data.reduce((sum, item) => {
      // Only count students with aggregate less than 37
      if (item.aggregate < 37) {
        return sum + item.total;
      }
      return sum;
    }, 0);
  };

  const getPassingStudentsByGender = (gender) => {
    return data.reduce((sum, item) => {
      // Only count students with aggregate less than 37
      if (item.aggregate < 37) {
        return sum + item[gender.toLowerCase()];
      }
      return sum;
    }, 0);
  };

  const getPassPercentage = () => {
    const totalStudents = getTotalCandidates();
    if (!totalStudents) return "0.00";
    return ((getPassingStudents() / totalStudents) * 100).toFixed(2);
  };

  const getPassPercentageByGender = (gender) => {
    const totalByGender = getTotalByGender(gender);
    if (!totalByGender) return "0.00";
    return ((getPassingStudentsByGender(gender) / totalByGender) * 100).toFixed(
      2
    );
  };

  // Filter out invalid data and calculate average aggregate
  const validData = data.filter(
    (item) =>
      item &&
      typeof item.aggregate === "number" &&
      !isNaN(item.aggregate) &&
      item.total > 0
  );

  const getAverageAggregate = () => {
    const totalStudents = getTotalCandidates();
    if (!totalStudents) return 0;

    const weightedSum = validData.reduce(
      (sum, item) => sum + item.aggregate * item.total,
      0
    );

    return (weightedSum / totalStudents).toFixed(2);
  };

  const getValidAggregateRows = () => {
    return Array.from({ length: 30 }, (_, i) => i + 6)
      .map((aggregate) => {
        const row = data.find((item) => item.aggregate === aggregate) || {
          aggregate,
          boys: 0,
          girls: 0,
          total: 0,
        };
        return row;
      })
      .filter((row) => row.total > 0);
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
          getTotalByGender("Girls"),
          "Total Number Of Girls Pass",
          getPassingStudentsByGender("Girls"),
        ],
        [
          "Total Number Of Boys Presented",
          getTotalByGender("Boys"),
          "Total Number Of Boys Pass",
          getPassingStudentsByGender("Boys"),
        ],
        [
          "Percentage Pass",
          `${getPassPercentage()}%`,
          "Average Of Aggregate",
          getAverageAggregate(),
        ],
        [
          "Percentage Of Girls Pass",
          `${getPassPercentageByGender("Girls")}%`,
          "",
          "",
        ],
        [
          "Percentage Of Boys Pass",
          `${getPassPercentageByGender("Boys")}%`,
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

  const validRows = getValidAggregateRows();

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
              <TableCell>{getTotalByGender("Girls")}</TableCell>
              <TableCell>Total Number Of Girls Pass</TableCell>
              <TableCell>{getPassingStudentsByGender("Girls")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Number Of Boys Presented</TableCell>
              <TableCell>{getTotalByGender("Boys")}</TableCell>
              <TableCell>Total Number Of Boys Pass</TableCell>
              <TableCell>{getPassingStudentsByGender("Boys")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Percentage Pass</TableCell>
              <TableCell>{getPassPercentage()}%</TableCell>
              <TableCell>Average Of Aggregate</TableCell>
              <TableCell>{getAverageAggregate()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Percentage Of Girls Pass</TableCell>
              <TableCell>{getPassPercentageByGender("Girls")}%</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Percentage Of Boys Pass</TableCell>
              <TableCell>{getPassPercentageByGender("Boys")}%</TableCell>
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
            {validRows.map((row) => (
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
