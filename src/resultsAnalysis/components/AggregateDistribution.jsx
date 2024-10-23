// AggregateDistribution
import React from "react";
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

const AggregateDistribution = ({ data, onExport }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          onClick={() => onExport("pdf")}
        >
          Export PDF
        </Button>
      </Stack>
      <TableContainer>
        <Table size="small" sx={{ whiteSpace: "nowrap" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ color: "white" }}>Aggregate Score</TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                Total Students
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                Boys
              </TableCell>
              <TableCell sx={{ color: "white" }} align="right">
                Girls
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.aggregate}>
                <TableCell>{row.aggregate}</TableCell>
                <TableCell align="right">{row.total}</TableCell>
                <TableCell align="right">{row.boys}</TableCell>
                <TableCell align="right">{row.girls}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AggregateDistribution;
