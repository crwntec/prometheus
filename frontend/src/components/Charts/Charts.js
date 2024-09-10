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
import { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import "./Charts.css";
import moment from "moment";
import Cookies from "js-cookie";

export default function Charts({ logout, classSelectValue, dateSelectValue, currentSchoolYear }) {
  const [date, setDate] = useState(moment().startOf('week').add(1,'day').format("YYYY-MM-DD"));
  const [lookBack, setLookBack] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const COLORS_LESSONS = [
    "#12b546",
    "#f263df",
    "#b849a8",
    "#b84952",
    "#63e2f2",
  ]; // Regular, Substituted, EVA, TEAMS, Cancelled

  useEffect(() => {
    fetch(
      `${
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_API_BASE
          : "http://localhost:8080"
      }/statistics/${date}?weeks=${lookBack}&${
        classSelectValue
          ? "classID=" + Cookies.get("classID")
          : "userID=" + Cookies.get("userID")
      }`,
      {
        headers: {
          Authorization: "Bearer " + Cookies.get("token"),
        },
      }
    )
      .catch(() => {})
      .then((response) => {
        if (response.status === 403) logout();
        if (response.status === 204) {
          setNoData(true);
          return;
        }
        return response.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [date, logout, lookBack, classSelectValue]);

  useEffect(() => {

    const startOfCurrentWeek = moment().startOf("isoWeek");

    switch (dateSelectValue) {
      case 0: // Current week
        setLookBack(0);
        setDate(startOfCurrentWeek.clone().format("YYYY-MM-DD"));
        break;

      case 1: // Last week
        setLookBack(0);
        setDate(
          startOfCurrentWeek.clone()
            .subtract(1, "week")
            .format("YYYY-MM-DD")
        );
        break;

      case 2: // End of the current month
        const endOfMonth = moment().clone().startOf("isoWeek").endOf("month"); // Clone already done
        const endOfMonthDiff = moment
          .duration(
            endOfMonth.diff(
              moment(currentSchoolYear.dateRange.start)
            )
          )
          .weeks();
        setLookBack(endOfMonthDiff < 4 ? endOfMonthDiff - 1 : 3);
        setDate(endOfMonth.format("YYYY-MM-DD"));
        break;

      case 3: // Last month
      setLookBack(3);
        setDate(
          startOfCurrentWeek.endOf("month").subtract(1, "month").format("YYYY-MM-DD"))
        break;

      case 4: // Start of school year
        const schoolYearDiff = moment
          .duration(
            startOfCurrentWeek.diff(
              moment(
                  currentSchoolYear.dateRange.start
              )
            )
          )
          .weeks();
        setLookBack(schoolYearDiff - 1);
        setDate(startOfCurrentWeek.format("YYYY-MM-DD"));
        break;

      default:
        break;
    }
  }, [currentSchoolYear, dateSelectValue]);


  
  return (
    <div className="">
      {loading && (
        <div className="loading">
          <CircularProgress />
        </div>
      )}

      {!loading && (
        <div>
          {noData && <div>Error no data present</div>}
          {!noData && (
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
                            label={(entry) =>
                              `${(entry.percent * 100).toFixed(0)}%`
                            }
                          >
                            {data.lessons.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  COLORS_LESSONS[index % COLORS_LESSONS.length]
                                }
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
                      {data.subjects && (
                        <strong>Vertretungen nach Fächern</strong>
                      )}
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
                            dataKey="subjTEAMS"
                            name="TEAMS"
                            fill={COLORS_LESSONS[3]}
                          />
                          <Bar
                            stackId="a"
                            dataKey="subjCancelled"
                            name="Frei"
                            fill={COLORS_LESSONS[4]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <div className="chart">
                      {data.teachers && (
                        <strong>Abwesenheit nach Lehrer</strong>
                      )}
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
                            name="TEAMS"
                            dataKey="teacherTEAMS"
                            fill={COLORS_LESSONS[3]}
                          />
                          <Bar
                            stackId="a"
                            name="Frei"
                            dataKey="teacherCancelled"
                            fill={COLORS_LESSONS[4]}
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
                            name="TEAMS"
                            dataKey="teams"
                            stroke={COLORS_LESSONS[3]}
                            fill={COLORS_LESSONS[3]}
                          />
                          <Area
                            stackId="1"
                            type="monotone"
                            name="Frei"
                            dataKey="cancelled"
                            stroke={COLORS_LESSONS[4]}
                            fill={COLORS_LESSONS[4]}
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
                            name="TEAMS"
                            dataKey="teams"
                            stroke={COLORS_LESSONS[3]}
                            fill={COLORS_LESSONS[3]}
                          />
                          <Area
                            stackId="1"
                            name="Frei"
                            dataKey="cancelled"
                            stroke={COLORS_LESSONS[4]}
                            fill={COLORS_LESSONS[4]}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Grid>
                </Grid>
              </Box>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
