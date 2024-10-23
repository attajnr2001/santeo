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
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4' // Using A3 format for more width
  });

  // Add title with more space
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  // Configure table settings
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 30,
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    columnStyles: {
      // Adjust column widths (values in mm)
      0: { cellWidth: 40 },  // Subject Name
      1: { cellWidth: 25 },  // No. Presented
      2: { cellWidth: 20 },  // No. Pass
      3: { cellWidth: 20 },  // Percentage
      4: { cellWidth: 25 },  // Boys Presented
      5: { cellWidth: 20 },  // Boys Pass
      6: { cellWidth: 20 },  // Boys %
      7: { cellWidth: 25 },  // Girls Presented
      8: { cellWidth: 20 },  // Girls Pass
      9: { cellWidth: 20 },  // Girls %
      10: { cellWidth: 20 }, // Average
      11: { cellWidth: 20 }, // Position
    },
    headStyles: {
      fillColor: [51, 122, 183],
      fontSize: 10,
      halign: 'center',
      valign: 'middle'
    },
    theme: 'grid',
    margin: { left: 10, right: 10 },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.pdf`);
};

export const exportToExcel = (data, sheetName, fileName) => {
  const workBook = utils.book_new();
  const workSheet = utils.json_to_sheet(data);

  // Set column widths for Excel
  const colWidths = [
    { wch: 20 },  // Subject Name
    { wch: 15 },  // No. Presented
    { wch: 12 },  // No. Pass
    { wch: 12 },  // Percentage
    { wch: 15 },  // Boys Presented
    { wch: 12 },  // Boys Pass
    { wch: 12 },  // Boys %
    { wch: 15 },  // Girls Presented
    { wch: 12 },  // Girls Pass
    { wch: 12 },  // Girls %
    { wch: 12 },  // Average
    { wch: 10 },  // Position
  ];

  workSheet['!cols'] = colWidths;
  utils.book_append_sheet(workBook, workSheet, sheetName);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  writeFile(workBook, `${fileName}-${timestamp}.xlsx`);
};