import React, { useState } from "react";
import { read, utils } from "xlsx";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DownloadIcon from "@mui/icons-material/Download";
import AggregateDistribution from "./AggregateDistribution";
import AggregatesAnalysisSummary from "./AggregatesAnalysisSummary";
import SchoolSubjectAnalysis from "./SchoolSubjectAnalysis";
import SubjectsGradeAnalysis from "./SubjectsGradeAnalysis";
import { exportToPDF, exportToExcel } from "../utils/analysisHelpers";

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: "20px 0" }}>
    {value === index && children}
  </div>
);

const TEMPLATE_URL =
  "https://firebasestorage.googleapis.com/v0/b/santeo-77127.appspot.com/o/results%2FABGF75iYuMVk8zNS7PTjoZbCjYI2%2Fresults%20template.xlsx?alt=media&token=80389b6a-8637-4cdb-9335-2dba6b4302a2";
const Home = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [aggregateData, setAggregateData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [error, setError] = useState("");
  const [processedData, setProcessedData] = useState({
    headers: {},
    data: [],
    subjectGrades: {},
  });

  const processSubjectGrades = (jsonData, headers) => {
    const subjectGrades = {};
    const processedHeaders = {};
    const genderData = {};

    // Initialize subject arrays and process headers
    for (let prop in headers) {
      if (prop.charCodeAt(0) - 65 >= 8) {
        const subjectName = headers[prop];
        if (subjectName) {
          const upperSubject = subjectName.toUpperCase();
          subjectGrades[upperSubject] = [];
          genderData[upperSubject] = {
            M: [],
            F: [],
          };
          processedHeaders[prop] = upperSubject;
        }
      }
    }

    // Process each row and collect grades by subject
    const processedRows = jsonData.slice(1).map((row) => {
      const processedRow = { ...row };
      const gender = row["F"];

      for (let prop in processedHeaders) {
        const subjectName = processedHeaders[prop];
        const grade = parseInt(row[prop]);
        if (!isNaN(grade)) {
          subjectGrades[subjectName].push(grade);
          processedRow[prop] = grade;

          if (gender === "M" || gender === "F") {
            genderData[subjectName][gender].push(grade);
          }
        }
      }
      return processedRow;
    });

    return {
      headers: processedHeaders,
      data: processedRows,
      subjectGrades,
      genderData,
    };
  };

  const processExcelFile = async (file) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: "A" });

      const headers = jsonData[0];
      const processed = processSubjectGrades(jsonData, headers);

      setProcessedData(processed);
      setExcelData(processed.data);

      const subjectHeaders = {};
      for (let prop in headers) {
        if (prop.charCodeAt(0) - 65 >= 8) {
          subjectHeaders[prop] = headers[prop];
        }
      }

      const rows = jsonData.slice(1);
      setExcelData(rows);

      // Process grades for each student
      const aggregateDistribution = {};

      rows.forEach((row) => {
        const gender = row["F"];

        const coreGrades = [];
        const otherGrades = [];

        for (let prop in row) {
          if (prop.charCodeAt(0) - 65 >= 8) {
            const subjectName = subjectHeaders[prop];
            const grade = parseInt(row[prop]);

            if (
              [
                "ENGLISH LANGUAGE",
                "SOCIAL STUDIES",
                "MATHEMATICS",
                "INTEGRATED SCIENCE",
              ].includes(subjectName?.toUpperCase())
            ) {
              coreGrades.push(grade);
            } else {
              otherGrades.push(grade);
            }
          }
        }

        otherGrades.sort((a, b) => a - b);
        const bestTwoGrades = otherGrades.slice(0, 2);

        const aggregate = [...coreGrades, ...bestTwoGrades].reduce(
          (sum, grade) => sum + grade,
          0
        );

        if (!aggregateDistribution[aggregate]) {
          aggregateDistribution[aggregate] = {
            aggregate,
            total: 0,
            boys: 0,
            girls: 0,
          };
        }

        aggregateDistribution[aggregate].total += 1;
        if (gender === "M") {
          aggregateDistribution[aggregate].boys += 1;
        } else if (gender === "F") {
          aggregateDistribution[aggregate].girls += 1;
        }
      });

      const sortedData = Object.values(aggregateDistribution).sort(
        (a, b) => a.aggregate - b.aggregate
      );

      setAggregateData(sortedData);
      setError("");
    } catch (err) {
      console.error("Error processing file:", err);
      setError(
        "Error processing file. Please ensure the file format matches the expected structure."
      );
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleExportAggregateDistribution = (format) => {
    const data = aggregateData.map((row) => ({
      "Aggregate Score": row.aggregate,
      "Total Students": row.total,
      Boys: row.boys,
      Girls: row.girls,
    }));

    if (format === "pdf") {
      exportToPDF(
        aggregateData.map((row) => [
          row.aggregate,
          row.total,
          row.boys,
          row.girls,
        ]),
        "Aggregate Distribution",
        ["Aggregate Score", "Total Students", "Boys", "Girls"]
      );
    } else {
      exportToExcel(data, "Aggregate Distribution", "aggregate-distribution");
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      processExcelFile(file);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">BECE Results Analysis</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Tooltip title="Download Template">
            <Button
              variant="outlined"
              color="primary"
              href={TEMPLATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DownloadIcon />}
            >
              Template
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            component="label"
            startIcon={<FileUploadIcon />}
          >
            Upload Excel
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: "100%", mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Aggregate Distribution" />
          <Tab label="Aggregates Analysis Summary" />
          <Tab label="School Subject Analysis" />
          <Tab label="Subjects Grade Analysis" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <AggregateDistribution
            data={aggregateData}
            onExport={handleExportAggregateDistribution}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <AggregatesAnalysisSummary data={aggregateData} />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <SchoolSubjectAnalysis
            data={processedData.data}
            headers={processedData.headers}
            subjectGrades={processedData.subjectGrades}
            genderData={processedData.genderData}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <SubjectsGradeAnalysis
            data={processedData.data}
            headers={processedData.headers}
            subjectGrades={processedData.subjectGrades}
            genderData={processedData.genderData}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Home;
