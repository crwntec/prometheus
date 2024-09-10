import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch } from '@mui/material';

export default function AppBarComponent({ isLoggedIn, logout, classSelectValue, setClassSelectValue, dateSelectValue, setDateSelectValue }) {

  const handleDateChange = (e) => setDateSelectValue(e.target.value)
  const handleClassChange = (e) => setClassSelectValue(e.target.checked);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Prometheus
          </Typography>
          <FormControlLabel
            control={<Switch color="secondary" checked={classSelectValue} onChange={handleClassChange} />}
            label="Use Class Data"
          />
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="date-select-label" sx={{ color: "white" }}>
              Date range
            </InputLabel>
            <Select
              labelId="date-select-label"
              id="date-select"
              value={dateSelectValue}
              label="Date"
              onChange={handleDateChange}
              sx={{
                color: "white", // Text color
                ".MuiOutlinedInput-input": {
                  color: "white", // Ensures the input text is white
                },
                ".MuiSelect-icon": {
                  color: "white", // Ensures the dropdown icon is white
                },
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "white", // Border color
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "white", // Border color when focused
                },
              }}
            >
              <MenuItem value={0}>This Week</MenuItem>
              <MenuItem value={1}>Last Week</MenuItem>
              <MenuItem value={2}>This month</MenuItem>
              <MenuItem value={3}>Last month</MenuItem>
              <MenuItem value={4}>This year</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={logout} color="inherit">
            {isLoggedIn ? "Logout" : "Login"}
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}