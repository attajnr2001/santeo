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
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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

  const handleExportPDF = () => {
    const doc = new jsPDF("l"); // Set to landscape orientation for better table fit

    // Add school logo
    const img = new Image();
    img.src = "/icon.jpg";

    // Add logo once it's loaded
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
    doc.line(15, 40, 280, 40); // Extended line for landscape orientation

    // Report title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SCHOOL SUBJECT ANALYSIS", 148, 55, { align: "center" });

    // Create the table data
    doc.autoTable({
      startY: 65,
      head: [
        [
          { content: "Subject Name", rowSpan: 2 },
          { content: "TOTAL", colSpan: 3 },
          { content: "BOYS", colSpan: 3 },
          { content: "GIRLS", colSpan: 3 },
          { content: "Average", rowSpan: 2 },
          { content: "Position", rowSpan: 2 },
        ],
        [
          "No. Presented",
          "No. Pass",
          "Percentage",
          "Presented",
          "Pass",
          "Percentage",
          "Presented",
          "Pass",
          "Percentage",
        ],
      ],
      body: subjectAnalysis.map((subject) => [
        subject.subjectName,
        subject.noPresented,
        subject.noPass,
        `${subject.percentage}%`,
        subject.boysPresented,
        subject.boysPass,
        `${subject.boysPercentage}%`,
        subject.girlsPresented,
        subject.girlsPass,
        `${subject.girlsPercentage}%`,
        subject.average,
        subject.position,
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [100, 149, 237],
        halign: "center",
        valign: "middle",
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20, halign: "right" },
        2: { cellWidth: 20, halign: "right" },
        3: { cellWidth: 20, halign: "right" },
        4: { cellWidth: 20, halign: "right" },
        5: { cellWidth: 20, halign: "right" },
        6: { cellWidth: 20, halign: "right" },
        7: { cellWidth: 20, halign: "right" },
        8: { cellWidth: 20, halign: "right" },
        9: { cellWidth: 20, halign: "right" },
        10: { cellWidth: 20, halign: "right" },
        11: { cellWidth: 20, halign: "right" },
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
    });

    // Add date at the bottom
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(`Generated on: ${date}`, 15, doc.internal.pageSize.height - 10);

    doc.save("school-subject-analysis.pdf");
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
            onClick={handleExportPDF}
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
