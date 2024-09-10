import React from "react";
import "./Login.css";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Cookies from "js-cookie";
import { CircularProgress } from "@mui/material";

export default function Login({ setToken, setCurrentSchoolYear }) {
  const [loading, setLoading] = React.useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const res = await loginUser({
      username: e.target.username.value,
      password: e.target.password.value,
    });
    setLoading(false);
    setToken(res.sessionID);
    Cookies.set("userID", res.userID, { expires: 7 });
    Cookies.set("classID", res.allowedClass, { expires: 7 });
    setCurrentSchoolYear(res.currentSchoolYear)
  };
  const loginUser = async (credentials) => {
    return fetch(
      `${
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_API_BASE
          : "http://localhost:8080"
      }/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    ).then((data) => data.json());
  };

  return (
    <div className="login-wrapper">
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </Button>
      </Box>
      {loading && (
        <div>
          <CircularProgress />
        </div>
      )}
    </div>
  );
}
