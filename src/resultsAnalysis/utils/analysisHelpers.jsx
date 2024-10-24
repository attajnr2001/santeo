import jsPDF from "jspdf";
import "jspdf-autotable";
import { utils, writeFile } from "xlsx";

export const parseResults = (resultsString) => {
  return resultsString.split(",").map((pair) => {
    const [subjectWithDash, grade] = pair.trim().split("-");
    return {
      subject: subjectWithDash.trim(),
      grade: parseInt(grade.trim()),
    };
  });
};

export const calculateAggregate = (resultsString) => {
  const subjects = parseResults(resultsString);
  const coreSubjects = [
    "ENGLISH LANGUAGE",
    "SOCIAL STUDIES",
    "MATHEMATICS",
    "INTEGRATED SCIENCE",
  ];

  let aggregate = 0;
  let otherGrades = [];

  subjects.forEach(({ subject, grade }) => {
    if (coreSubjects.some((core) => subject.includes(core))) {
      aggregate += grade;
    } else {
      otherGrades.push(grade);
    }
  });

  otherGrades.sort((a, b) => a - b);
  const bestTwo = otherGrades.slice(0, 2);
  aggregate += bestTwo.reduce((sum, grade) => sum + grade, 0);

  return aggregate;
};

export const exportToPDF = (tableData, title, headers) => {
  // Create PDF in landscape orientation with larger page size
  const doc = new jsPDF({
    format: "a4",
  });

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
  doc.text(title, 105, 55, { align: "center" });

  // Configure table settings with adjusted startY to accommodate header
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 65, // Moved down to accommodate header
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    columnStyles: {
      // Adjust column widths (values in mm)
      0: { cellWidth: 40 }, // Subject Name
      1: { cellWidth: 25 }, // No. Presented
      2: { cellWidth: 20 }, // No. Pass
      3: { cellWidth: 20 }, // Percentage
      4: { cellWidth: 25 }, // Boys Presented
      5: { cellWidth: 20 }, // Boys Pass
      6: { cellWidth: 20 }, // Boys %
      7: { cellWidth: 25 }, // Girls Presented
      8: { cellWidth: 20 }, // Girls Pass
      9: { cellWidth: 20 }, // Girls %
      10: { cellWidth: 20 }, // Average
      11: { cellWidth: 20 }, // Position
    },
    headStyles: {
      fillColor: [51, 122, 183],
      fontSize: 10,
      halign: "center",
      valign: "middle",
    },
    theme: "grid",
    margin: { left: 10, right: 10 },
  });

  // Add generation date at the bottom
  const date = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(`Generated on: ${date}`, 15, doc.internal.pageSize.height - 10);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.pdf`);
};

export const exportToExcel = (data, sheetName, fileName) => {
  const workBook = utils.book_new();
  const workSheet = utils.json_to_sheet(data);

  // Set column widths for Excel
  const colWidths = [
    { wch: 20 }, // Subject Name
    { wch: 15 }, // No. Presented
    { wch: 12 }, // No. Pass
    { wch: 12 }, // Percentage
    { wch: 15 }, // Boys Presented
    { wch: 12 }, // Boys Pass
    { wch: 12 }, // Boys %
    { wch: 15 }, // Girls Presented
    { wch: 12 }, // Girls Pass
    { wch: 12 }, // Girls %
    { wch: 12 }, // Average
    { wch: 10 }, // Position
  ];

  workSheet["!cols"] = colWidths;
  utils.book_append_sheet(workBook, workSheet, sheetName);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  writeFile(workBook, `${fileName}-${timestamp}.xlsx`);
};
