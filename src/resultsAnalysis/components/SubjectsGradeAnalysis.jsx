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
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add school logo
    const img = new Image();
    img.src = "/icon.jpg";
    doc.addImage(img, "JPEG", 15, 10, 25, 25);

    // School name and address styling
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ARCHBISHOP ANDOH R/C BASIC SCHOOL", 50, 20, { align: "left" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("P.O.BOX CE 12275, TEMA", 50, 28, { align: "left" });

    // Add a line under the header
    doc.setLineWidth(0.5);
    doc.line(15, 40, 195, 40);

    // Report title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SUBJECTS GRADE ANALYSIS", 105, 55, { align: "center" });

    let yPos = 65; // Start tables after the header

    // Process each subject table
    Object.entries(subjectsData).forEach(([subject, gradeData]) => {
      // Calculate totals for the subject
      const grades = Object.keys(gradeData)
        .map(Number)
        .sort((a, b) => a - b);

      const totals = grades.reduce(
        (acc, grade) => {
          acc.girls += gradeData[grade].girls;
          acc.boys += gradeData[grade].boys;
          acc.total += gradeData[grade].total;
          return acc;
        },
        { girls: 0, boys: 0, total: 0 }
      );

      // Add subject title
      doc.setFontSize(12);
      doc.text(subject, 15, yPos);
      yPos += 5;

      // Create table data for the subject
      const tableData = {
        head: [["Grade", "Girls", "Boys", "Total"]],
        body: [
          ...grades.map((grade) => [
            grade.toString(),
            gradeData[grade].girls,
            gradeData[grade].boys,
            gradeData[grade].total,
          ]),
          // Add totals row
          ["Total", totals.girls, totals.boys, totals.total],
        ],
      };

      // Add the table
      doc.autoTable({
        startY: yPos,
        head: tableData.head,
        body: tableData.body,
        theme: "grid",
        headStyles: {
          fillColor: [100, 149, 237],
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 20, halign: "right" },
          2: { cellWidth: 20, halign: "right" },
          3: { cellWidth: 20, halign: "right" },
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        footStyles: {
          fontStyle: "bold",
          fillColor: [240, 240, 240],
        },
        // Style the totals row
        didParseCell: function (data) {
          if (data.row.index === tableData.body.length - 1) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [240, 240, 240];
          }
        },
      });

      // Update yPos for next table
      yPos = doc.lastAutoTable.finalY + 15;

      // Add new page if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 15;
      }
    });

    // Add current date at the bottom of the last page
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(`Generated on: ${date}`, 15, doc.internal.pageSize.height - 10);

    doc.save("subjects-grade-analysis.pdf");
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
              <TableRow
                sx={{ backgroundColor: "primary.light", color: "white" }}
              >
                <TableCell
                  sx={{ color: "white" }}
                  className="text-white font-bold"
                >
                  Grade
                </TableCell>
                <TableCell
                  sx={{ color: "white" }}
                  className="text-white font-bold text-right"
                >
                  Girls
                </TableCell>
                <TableCell
                  sx={{ color: "white" }}
                  className="text-white font-bold text-right"
                >
                  Boys
                </TableCell>
                <TableCell
                  sx={{ color: "white" }}
                  className="text-white font-bold text-right"
                >
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade} className="hover:bg-gray-50">
                  <TableCell>{grade}</TableCell>
                  <TableCell>{gradeData[grade].girls}</TableCell>
                  <TableCell>{gradeData[grade].boys}</TableCell>
                  <TableCell>{gradeData[grade].total}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-100 font-bold">
                <TableCell>Total</TableCell>
                <TableCell>{totals.girls}</TableCell>
                <TableCell>{totals.boys}</TableCell>
                <TableCell>{totals.total}</TableCell>
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
          <Button variant="outlined" onClick={handleExportPDF}>
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
