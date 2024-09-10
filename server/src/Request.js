import axios from "axios";
import { convertToUntisDate, isInHoliday } from "./util.js";
import chalk from "chalk";

export const makeRequest = (date, sessionID, userID) => {
  if (!userID || !sessionID) return;
  return axios.get(
    "https://niobe.webuntis.com/WebUntis/api/public/timetable/weekly/data",
    {
      params: {
        elementType: userID.length > 3 || userID.length == undefined ? 5 : 1,
        elementId: userID,
        date: date,
        formatId: 8,
      },
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate, br",
        Cookie: `JSESSIONID=${sessionID}; schoolname="_c3QtYmVybmhhcmQtZ3lt"; `,
      },
      validateStatus: (status) => status < 500,
    }
  );
};

export const getInfo = (username, password) => {
  const data = new URLSearchParams();
  data.append("school", "st-bernhard-gym");
  data.append("j_username", username);
  data.append("j_password", password);
  data.append("token", "");

  return axios
    .post("https://niobe.webuntis.com/WebUntis/j_spring_security_check", data, {
      headers: {
        Host: "niobe.webuntis.com",
        Accept: "application/json",
        Origin: "https://niobe.webuntis.com",
      },
      withCredentials: true,
    })
    .then((response) => {
      let sessionID = response.headers["set-cookie"][0]
        .split(";")[0]
        .split("=")[1];

      return axios
        .get("https://niobe.webuntis.com/WebUntis/api/token/new", {
          headers: {
            authority: "niobe.webuntis.com",
            accept: "application/json, text/plain, */*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,de;q=0.7",
            cookie: `JSESSIONID=${sessionID}; schoolname=^^_c3QtYmVybmhhcmQtZ3lt^^; traceId=1276915a9519cbe3bc8eaffb6a8dbef684f7ee2b`,
            referer: "https://niobe.webuntis.com/",
            compression: "true",
          },
        })
        .then((response) => {
          let token = response.data;

          return axios
            .get(
              "https://niobe.webuntis.com/WebUntis/api/rest/view/v1/app/data",
              {
                headers: {
                  authority: "niobe.webuntis.com",
                  accept: "application/json, text/plain, */*",
                  "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,de;q=0.7",
                  authorization: `Bearer ${token}`,
                },
                withCredentials: true,
              }
            )
            .then((response) => {
              const userID = response.data.user.person.id;
              const currentSchoolYear = response.data.currentSchoolYear;
              const holidays = response.data.holidays;
              return axios
                .get(
                  "https://niobe.webuntis.com/WebUntis/api/public/timetable/weekly/pageconfig",
                  {
                    params: {
                      type: 5,
                      date: "2024-08-23",
                      isMyTimetableSelected: true,
                    },
                    headers: {
                      authority: "niobe.webuntis.com",
                      accept: "application/json, text/plain, */*",
                      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,de;q=0.7",
                      cookie: `JSESSIONID=${sessionID}; schoolname=^^_c3QtYmVybmhhcmQtZ3lt^^; traceId=1276915a9519cbe3bc8eaffb6a8dbef684f7ee2b`,
                      referer: "https://niobe.webuntis.com/",
                      compression: "true",
                    },
                  }
                )
                .then((response) => {
                  const allowedClass = response.data.data.elements[0].klasseId;
                  return {
                    sessionID,
                    userID,
                    allowedClass,
                    currentSchoolYear,
                    holidays,
                  };
                });
            });
        });
    })
    .catch((error) => {
      console.log(chalk.red("error while processing information", error));
      throw error; // Propagate the error further if needed
    });
};

export const getTeachers = (data) => {
  // console.log(data)
  let teachers = [];
  data.elements
    .filter((e) => e.type === 2)
    .forEach((teacher) => {
      teachers.push({
        id: teacher.id,
        name: teacher.name,
      });
    });
  return teachers;
};
export const getRooms = (data) => {
  let rooms = [];
  data.elements
    .filter((e) => e.type === 4)
    .forEach((room) => {
      rooms.push({
        id: room.id,
        name: room.name,
        longName: room.longName,
      });
    });
  return rooms;
};
export const getSubjects = (data) => {
  let subjects = [];
  data.elements
    .filter((e) => e.type === 3)
    .forEach((subject) => {
      subjects.push({
        id: subject.id,
        name: subject.name,
        longName: subject.longName,
      });
    });
  return subjects;
};

export const getData = async (
  date,
  lookBack,
  sessionID,
  userID,
  currentSchoolYear,
  holidays,
  callback
) => {
  if (!sessionID) {
    console.log("No sessionID provided");
    return;
  }
  const startDate = new Date(date);
  let dates = [startDate];
  for (let i = 1; i <= lookBack; i++) {
    let d = new Date(startDate);
    d.setDate(d.getDate() - i * 7);
    dates.push(d);
  }
  dates = dates.map((d) => convertToUntisDate(d));
  let error = null;
  const promises = dates.map((d) => makeRequest(d, sessionID, userID));
  const responses = await axios.all(promises).catch(e => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
    }
    console.log(error.config);
  });
  if (responses.some((response) => response.status === 403)) {
    callback(responses[0].status, null, null, null, null);
    return;
  }
  let combinedLessons = responses.map((response) =>
    getLessonsForWeek(response.data.data.result.data)
  );
  combinedLessons = [].concat(...combinedLessons);
  let filteredResponses = responses.filter(
    (r) => r.data.data.result.data.elements.length > 1
  );
  if (filteredResponses.length == 0) {
    callback(204, null, null, null, null);
    return;
  }
  callback(
    null,
    combineToBlocks(combinedLessons, holidays),
    getTeachers(filteredResponses[0].data.data.result.data),
    getRooms(filteredResponses[0].data.data.result.data),
    getSubjects(filteredResponses[0].data.data.result.data)
  );
};

function combineToBlocks(lessons, holidays) {
  let blockLessons = [];
  lessons.forEach((lesson) => {
    if (blockLessons.find((l) => l.id == lesson.id && l.date == lesson.date))
      return;
    const adjLesson = lessons.filter(
      (l) => l.id == lesson.id && l.date == lesson.date
    )[1];
    if (!adjLesson) {
      blockLessons.push(lesson);
      return;
    }
    blockLessons.push({
      ...lesson,
      id: lesson.id,
      startTime: lesson.startTime,
      endTime: adjLesson.endTime,
      isInHoliday: isInHoliday(lesson, holidays),
      isSubstitution: lesson.isSubstitution || adjLesson.isSubstitution,
      isCancelled:
        (lesson.isCancelled || adjLesson.isCancelled) &&
        !isInHoliday(lesson.date, holidays),
      isFree: lesson.isFree || adjLesson.isFree,
    });
  });

  blockLessons.sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split(".");
    const dateA = new Date(`${monthA}/${dayA}/${yearA} ${a.startTime}`);

    const [dayB, monthB, yearB] = b.date.split(".");
    const dateB = new Date(`${monthB}/${dayB}/${yearB} ${b.startTime}`);

    return dateA - dateB;
  });
  return blockLessons;
}

function getLessonsForWeek(data) {
  let lessons = [];
  let teachers = getTeachers(data);
  let rooms = getRooms(data);
  let subjects = getSubjects(data);
  const key = Object.keys(data.elementPeriods)[0];
  data.elementPeriods[key].forEach((lesson) => {
    const teacher = lesson.elements.find(
      (e) =>
        e.type === 2 &&
        (lesson.cellState == "SUBSTITUTION" ? e.orgId !== 0 : true)
    );
    const room = lesson.elements.find((e) => e.type === 4);
    const subject = lesson.elements.find((e) => e.type === 3);
    lessons.push({
      id: lesson.lessonId,
      startTime:
        (lesson.startTime.toString().length == 3
          ? "0" + lesson.startTime.toString().substring(0, 1)
          : "" + lesson.startTime.toString().substring(0, 2)) +
        ":" +
        lesson.startTime
          .toString()
          .substring(lesson.startTime.toString().length == 3 ? 1 : 2),
      endTime:
        (lesson.endTime.toString().length == 3
          ? "0" + lesson.endTime.toString().substring(0, 1)
          : "" + lesson.endTime.toString().substring(0, 2)) +
        ":" +
        lesson.endTime
          .toString()
          .substring(lesson.endTime.toString().length == 3 ? 1 : 2),
      date:
        lesson.date.toString().substring(6) +
        "." +
        lesson.date.toString().substring(4, 6) +
        "." +
        lesson.date.toString().substring(0, 4),
      teacher: teacher
        ? teachers.find((t) =>
            lesson.cellState === "SUBSTITUTION"
              ? t.id === teacher.orgId
              : t.id === teacher.id
          ).name
        : "Unbekannt",
      substTeacher:
        teacher && lesson.cellState === "SUBSTITUTION"
          ? teachers.find((t) => t.id === teacher.id).name
          : "Unbekannt",
      subject: subject
        ? subjects.find((s) => s.id === subject.id).name
        : "Unbekannt",
      room: subject ? rooms.find((r) => r.id === room.id) : "Unbekannt",
      additionalInfo: lesson.periodText,
      isSubstitution:
        lesson.cellState === "SUBSTITUTION" &&
        teacher.id !== 81 &&
        teacher.id !== 411,
      isTeams: lesson.cellState === "SUBSTITUTION" && teacher.id == 411,
      isEva: teacher ? teacher.id == 81 : false,
      isCancelled: lesson.cellState === "CANCEL",
      isFree: lesson.cellState == "FREE",
    });
  });
  return lessons;
}
