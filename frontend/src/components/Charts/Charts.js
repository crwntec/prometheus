import {
  PieChart,
  Pie,
  AreaChart,
  Area,
  ResponsiveContainer,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import NumberInput from "./NumberInput";
import { useState, useEffect } from "react";
import { Grid, Modal } from "@mui/material";
import WeekPicker from "./WeekPicker";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Fab from "@mui/material/Fab";
import DateRangeIcon from "@mui/icons-material/DateRange";
import "./Charts.css";
import moment from "moment";
import Cookies from "js-cookie";

export default function Charts({ logout }) {
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [lookBack, setLookBack] = useState(3);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const COLORS_LESSONS = ["#12b546", "#f263df", "#b849a8", "#63e2f2"]; // Regular, Substituted, EVA, Free


  useEffect(() => {
    fetch(
      `${
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_API_BASE
          : "http://localhost:8080"
      }/statistics/${date}?weeks=${lookBack}&userID=${Cookies.get("userID")}`,
      {
        headers: {
          Authorization: "Bearer " + Cookies.get("token"),
        },
      }
    )
      .catch(() => {})
      .then((response) => {
        if (response.status === 403) logout();
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [date, logout, lookBack]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80vw",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };
  return (
    <div className="">
      {loading && (
        <div className="loading">
          <CircularProgress />
        </div>
      )}
      {!loading && (
        <div>
          <Box sx={{ width: "100%" }}>
            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              columns={{ xs: 4, md: 4 }}
            >
              <Grid item xs={6} md={2}>
                <div className="chart">
                  {data.lessons && <strong>Vertretungen nach Art</strong>}
                  <ResponsiveContainer>
                    <PieChart>
                      <Tooltip />
                      <Pie
                        dataKey="value"
                        data={data.lessons}
                        fill="#8884d8"
                        labelLine={true}
                        label={(entry) => `${(entry.percent * 100).toFixed(0)}%`}
                      >
                        {data.lessons.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS_LESSONS[index % COLORS_LESSONS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Grid>
              <Grid item xs={6} md={2}>
                <div className="chart">
                  {data.subjects && <strong>Vertretungen nach Fächern</strong>}
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={data.subjects}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid fillDasharray="3 3" />
                      <XAxis dataKey="subjName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        stackId="a"
                        dataKey="subjRegular"
                        name="Regulär"
                        fill={COLORS_LESSONS[0]}
                      />
                      <Bar
                        stackId="a"
                        dataKey="subjSubstituted"
                        name="Vertreten"
                        fill={COLORS_LESSONS[1]}
                      />
                      <Bar
                        stackId="a"
                        dataKey="subjEVA"
                        name="E.V.A."
                        fill={COLORS_LESSONS[2]}
                      />
                      <Bar
                        stackId="a"
                        dataKey="subjFree"
                        name="Frei"
                        fill={COLORS_LESSONS[3]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Grid>
              <Grid item xs={6} md={2}>
                <div className="chart">
                  {data.teachers && <strong>Abwesenheit nach Lehrer</strong>}
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={data.teachers}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid fillDasharray="3 3" />
                      <XAxis dataKey="teacherName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        stackId="a"
                        name="Vertreten"
                        dataKey="teacherSubstituted"
                        fill={COLORS_LESSONS[1]}
                      />
                      <Bar
                        stackId="a"
                        name="E.V.A"
                        dataKey="teacherEVA"
                        fill={COLORS_LESSONS[2]}
                      />
                      <Bar
                        stackId="a"
                        name="Frei"
                        dataKey="teacherFree"
                        fill={COLORS_LESSONS[3]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Grid>
              <Grid item xs={6} md={2}>
                <div className="chart">
                  {data.days && <strong>Ausfälle nach Tagen</strong>}
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      width={500}
                      height={300}
                      data={data.days}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        stackId="1"
                        type="monotone"
                        name="Regulär"
                        dataKey="regular"
                        stroke={COLORS_LESSONS[0]}
                        fill={COLORS_LESSONS[0]}
                      />
                      <Area
                        stackId="1"
                        type="monotone"
                        name="Vertreten"
                        dataKey="substituted"
                        stroke={COLORS_LESSONS[1]}
                        fill={COLORS_LESSONS[1]}
                      />
                      <Area
                        stackId="1"
                        type="monotone"
                        name="E.V.A"
                        dataKey="eva"
                        stroke={COLORS_LESSONS[2]}
                        fill={COLORS_LESSONS[2]}
                      />
                      <Area
                        stackId="1"
                        type="monotone"
                        name="Frei"
                        dataKey="free"
                        stroke={COLORS_LESSONS[3]}
                        fill={COLORS_LESSONS[3]}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Grid>
              <Grid item xs={6} md={2}>
                <div className="chart">
                  {data.days && <strong>Ausfälle nach Wochen</strong>}
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      width={500}
                      height={300}
                      data={data.weeks}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        stackId="1"
                        name="Regulär"
                        dataKey="regular"
                        stroke={COLORS_LESSONS[0]}
                        fill={COLORS_LESSONS[0]}
                      />
                      <Area
                        stackId="1"
                        name="Vertreten"
                        dataKey="substituted"
                        stroke={COLORS_LESSONS[1]}
                        fill={COLORS_LESSONS[1]}
                      />
                      <Area
                        stackId="1"
                        name="E.V.A"
                        dataKey="eva"
                        stroke={COLORS_LESSONS[2]}
                        fill={COLORS_LESSONS[2]}
                      />
                      <Area
                        stackId="1"
                        name="Frei"
                        dataKey="free"
                        stroke={COLORS_LESSONS[3]}
                        fill={COLORS_LESSONS[3]}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Grid>
            </Grid>
          </Box>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <NumberInput
                aria-label="Demo number input"
                placeholder="Type a number…"
                value={lookBack}
                onChange={(event, val) => {
                  setLookBack(val)
                }
                }
              />
              <WeekPicker lookBack={lookBack} day={date} setDate={setDate} />
            </Box>
          </Modal>
          <Fab onClick={handleOpen} className="fab">
            <DateRangeIcon />
          </Fab>
        </div>
      )}
    </div>
  );
}
