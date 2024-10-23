// components/Home.jsx
import React, { useState, useEffect, useContext } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AggregateDistribution from "./AggregateDistribution";
import AggregatesAnalysisSummary from "./AggregatesAnalysisSummary";
import SchoolSubjectAnalysis from "./SchoolSubjectAnalysis";
import SubjectsGradeAnalysis from "./SubjectsGradeAnalysis";
import {
  calculateAggregate,
  exportToPDF,
  exportToExcel,
} from "../utils/analysisHelpers";
import { storage } from "../helpers/firebase";
import { AuthContext } from "../context/AuthContext";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  getBytes,
} from "firebase/storage";

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: "20px 0" }}>
    {value === index && children}
  </div>
);

const Home = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [aggregateData, setAggregateData] = useState([]);
  const [excelData, setExcelData] = useState([]); // Add this state
  const [error, setError] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [savedFiles, setSavedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const { currentUser } = useContext(AuthContext);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processedData, setProcessedData] = useState({
    headers: {},
    data: [],
    subjectGrades: {},
  });

  useEffect(() => {
    if (currentUser) {
      fetchSavedFiles();
    }
  }, [currentUser]);

  const fetchSavedFiles = async () => {
    try {
      const filesRef = ref(storage, `results/${currentUser.uid}`);
      const filesList = await listAll(filesRef);
      const filesData = await Promise.all(
        filesList.items.map(async (item) => {
          const name = item.name.replace(".xlsx", "");
          const url = await getDownloadURL(item);
          return { name, url };
        })
      );
      setSavedFiles(filesData);
    } catch (error) {
      console.error("Error fetching saved files:", error);
      setError("Failed to fetch saved files");
    }
  };

  const handleSaveFile = async () => {
    if (!fileName.trim()) {
      setError("Please enter a file name");
      return;
    }

    try {
      const fileRef = ref(
        storage,
        `results/${currentUser.uid}/${fileName}.xlsx`
      );
      await uploadBytes(fileRef, uploadedFile);
      setSaveDialogOpen(false);
      setFileName("");
      fetchSavedFiles();
      setError("");
    } catch (error) {
      console.error("Error saving file:", error);
      setError("Failed to save file");
    }
  };

  const processSubjectGrades = (jsonData, headers) => {
    const subjectGrades = {};
    const processedHeaders = {};
    const genderData = {}; // Add gender-specific tracking

    // Initialize subject arrays and process headers
    for (let prop in headers) {
      if (prop.charCodeAt(0) - 65 >= 8) {
        // Starting from column I
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
      const gender = row["F"]; // Get gender from column F

      for (let prop in processedHeaders) {
        const subjectName = processedHeaders[prop];
        const grade = parseInt(row[prop]);
        if (!isNaN(grade)) {
          subjectGrades[subjectName].push(grade);
          processedRow[prop] = grade;

          // Track gender-specific grades
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

  const handleFileSelect = async (fileName) => {
    try {
      const fileRef = ref(
        storage,
        `results/${currentUser.uid}/${fileName}.xlsx`
      );

      const bytes = await getBytes(fileRef);
      const data = bytes.buffer;

      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: "A" });

      // Add logging
      console.log("Selected File Data:", {
        fileName,
        rawData: jsonData,
        numberOfRows: jsonData.length,
      });

      // Check if jsonData is valid
      if (!jsonData || jsonData.length === 0) {
        throw new Error("No data found in the selected file.");
      }

      const rows = jsonData.slice(1);

      // Process and log subject-wise grades
      const headers = jsonData[0];
      const subjectGrades = processSubjectGrades(jsonData, headers);
      console.log("Subject-wise Grade Distribution:", subjectGrades);

      // Log processed rows
      console.log("Processed Rows:", rows);

      setExcelData(rows);

      const aggregateDistribution = {};

      rows.forEach((row) => {
        const resultsString = row["E"];
        const gender = Frow["C"];

        if (!resultsString) return;

        const aggregate = calculateAggregate(resultsString);

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

      // Log final processed data
      console.log("Aggregate Distribution:", sortedData);

      setAggregateData(sortedData);
      setError("");
    } catch (error) {
      console.error("Error loading selected file:", error);
      setError("Failed to load selected file");
    }
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

      // Process and log subject-wise grades
      const subjectGrades = processSubjectGrades(jsonData, headers);
      console.log("Subject-wise Grade Distribution:", subjectGrades);

      // Log extracted headers
      console.log("Subject Headers:", subjectHeaders);

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

      // Log final processed data
      console.log("Processed Data:", {
        rows: rows.length,
        aggregateDistribution: sortedData,
      });

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
      setUploadedFile(file);
      processExcelFile(file);
      setSaveDialogOpen(true);
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
          {savedFiles.length > 0 && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Saved File</InputLabel>
              <Select
                value={selectedFile}
                onChange={(e) => {
                  setSelectedFile(e.target.value);
                  handleFileSelect(e.target.value);
                }}
                label="Select Saved File"
              >
                {savedFiles.map((file) => (
                  <MenuItem key={file.name} value={file.name}>
                    {file.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
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
          />{" "}
        </TabPanel>
      </Paper>

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            variant="outlined"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSaveDialogOpen(false);
              setFileName("");
            }}
          >
            Skip
          </Button>
          <Button onClick={handleSaveFile}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home;
