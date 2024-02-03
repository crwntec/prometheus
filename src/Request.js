import axios from "axios";
import { convertToUntisDate, isEarlier, isLater, writeToFile } from "./util.js";

export const  makeRequest = (date, sessionID) => {
  return axios
    .get(
      "https://niobe.webuntis.com/WebUntis/api/public/timetable/weekly/data",
      {
        params: {
          elementType: 5,
          elementId: 2326,
          date: date,
          formatId: 8,
        },
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate, br",
          Cookie: `JSESSIONID=${sessionID}; schoolname="_c3QtYmVybmhhcmQtZ3lt"; `,
        },
      }
    );
}

export const getToken = (username, password) => { 
  const data = new URLSearchParams();
  data.append("school", "st-bernhard-gym");
  data.append("j_username", username);
  data.append("j_password", password);
  data.append("token", "");

  return axios
    .post("https://niobe.webuntis.com/WebUntis/j_spring_security_check", data, {
      headers: {
        Host: "niobe.webuntis.com",
        "Content-Length": "77",
        "Sec-Ch-Ua": 'Chromium";v="121", "Not A(Brand";v="99"',
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Csrf-Token": "350e9fec-1888-498b-9cc5-133568961f8e",
        "Sec-Ch-Ua-Mobile": "?0",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.85 Safari/537.36",
        "Sec-Ch-Ua-Platform": "Windows",
        Origin: "https://niobe.webuntis.com",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        Referer: "https://niobe.webuntis.com/WebUntis/?school=st-bernhard-gym",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
        Priority: "u=1, i",
      },
      withCredentials: true,
    })
    .then((response) => {
        let sessionID = response.headers["set-cookie"][0].split(";")[0].split("=")[1];
        return sessionID;
    })
    .catch((error) => {
      console.log(error);
    });
};

export const getTeachers = (data) => {
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

export const getData = async (date, lookBack, sessionID, callback) => {
  const startDate = new Date(date);
  let dates = [startDate];
  for (let i = 1; i <= lookBack; i++) {
    let d = new Date(startDate);
    d.setDate(d.getDate() - i * 7);
    dates.push(d);
  }
  dates = dates.map((d) => convertToUntisDate(d));
  const promises = dates.map((d) => makeRequest(d, sessionID));
  try {
    const responses = await axios.all(promises);

    let combinedLessons = responses.map(response => getLessonsForWeek(response.data.data.result.data));
    combinedLessons = [].concat(...combinedLessons);

    callback(combineToBlocks(combinedLessons), getTeachers(responses[0].data.data.result.data), getRooms(responses[0].data.data.result.data), getSubjects(responses[0].data.data.result.data));
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error; 
  }
};

function combineToBlocks(lessons) {
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
    // console.log(lesson.startTime, adjLesson.endTime);
    blockLessons.push({
      ...lesson,
      id: lesson.id,
      startTime:lesson.startTime,
      endTime: adjLesson.endTime,
      isSubstitution: lesson.isSubstitution || adjLesson.isSubstitution,
      isFree: lesson.isFree || adjLesson.isFree,
      isCancelled: lesson.isCancelled || adjLesson.isCancelled,
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
    const teacher = lesson.elements.find((e) => e.type === 2);
    const room = lesson.elements.find((e) => e.type === 4);
    const subject = lesson.elements.find((e) => e.type === 3);
    lessons.push({
      id: lesson.lessonId,
      startTime: (lesson.startTime.toString().length == 3
        ? "0" + lesson.startTime.toString().substring(0, 1)
        : "" + lesson.startTime.toString().substring(0, 2)) +
        ":" +
        lesson.startTime
          .toString()
          .substring(lesson.startTime.toString().length == 3 ? 1 : 2),
      endTime: (lesson.endTime.toString().length == 3
        ? "0" + lesson.endTime.toString().substring(0, 1)
        : "" + lesson.endTime.toString().substring(0, 2)) +
        ":" +
        lesson.endTime
          .toString()
          .substring(lesson.endTime.toString().length == 3 ? 1 : 2),
      date: lesson.date.toString().substring(6) +
        "." +
        lesson.date.toString().substring(4, 6) +
        "." +
        lesson.date.toString().substring(0, 4),
      teacher: teacher ? teachers.find((t) => t.id === teacher.id).name : "Unbekannt",
      subject: subject ? subjects.find((s) => s.id === subject.id).name : "Unbekannt",
      room: subject ? rooms.find((r) => r.id === room.id) : "Unbekannt",
      additionalInfo: lesson.periodText,
      isSubstitution: lesson.cellState === "SUBSTITUTION",
      isFree: lesson.cellState === "FREE",
      isCancelled: lesson.cellState == "CANCEL",
    });
  });
  return lessons;
}

