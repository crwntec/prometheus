import dotenv from "dotenv";
import UntisClient from "./UntisClient.js";
import chalk from "chalk";
import express from "express";
import cors from "cors";
import moment from "moment";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

chalk.level = 1;

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
const port = 8080;

dotenv.config();
const client = new UntisClient();
app.post("/login/", (req, res) => {
  client
    .init(req.body.username, req.body.password)
    .then((identifiers) => {
      setTimeout(() => {
      res.send({sessionID: identifiers[0], userID: identifiers[1]})
      }, 2000)
    });
  // .catch((error) => res.send(error));
});
app.get("/data/teachers", (req, res) => {
  res.send(client.teachers);
});
app.get("/data/subjects", (req, res) => {
  res.send(client.subjects);
});
app.get("/data/rooms", (req, res) => {
  res.send(client.rooms);
});
app.get("/lessons/:date", (req, res) => {
  client.getLessonsForTimeframe(
    req.params.date,
    req.query.weeks,
    (error, lessons) => {
      if (error) res.sendStatus(parseInt(error));
      else res.send(lessons);
    }
  );
});
app.get("/statistics/:date", async (req, res) => {  
  const token = req.headers.authorization.split(" ")[1];
  const userID = req.query.userID;
  if (token == undefined || userID === 'undefined') {
    res.sendStatus(403);
    return;
  }
  await client.getLessonsForTimeframe(
    token,
    req.params.date,
    req.query.weeks,
    userID,
    async (error, lessons) => {
      if (error) {
        res.sendStatus(parseInt(error));
        return;
      }
      const regular = lessons.filter(
        (lesson) => !lesson.isSubstitution && !lesson.isFree && !lesson.isEva
      );
      const substituted = lessons.filter((lesson) => lesson.isSubstitution);
      const free = lessons.filter((lesson) => lesson.isFree);
      const eva = lessons.filter((lesson) => lesson.isEva);
      if (client.teachers == undefined) await client.getElements(token, userID);
      const teachers = client.teachers.map((teacher) => {
        if (teacher.name === "---" || teacher.name === "E.V.A.") return;
        return {
          teacherName: teacher.name,
          teacherFree: lessons.filter(
            (l) => l.isFree && l.teacher === teacher.name
          ).length,
          teacherSubstituted: lessons.filter(
            (l) => l.isSubstitution && !l.isEva && l.teacher === teacher.name
          ).length,
          teacherEVA: lessons.filter(
            (l) => l.isEva && l.teacher === teacher.name
          ).length,
          teacherAmnt: lessons.filter(
            (l) => l.teacher === teacher.name && (l.isSubstitution || l.isFree)
          ).length,
        };
      });

      const days = [];
      lessons.forEach((lesson) => {
        if (!days.filter((l) => l.date === lesson.date).length > 0) {
          days.push({
            date: lesson.date,
            regular: lesson.isSubstitution ? 1 : 0,
            substituted: lesson.isSubstitution ? 1 : 0,
            free: lesson.isFree ? 1 : 0,
            eva: lesson.isEva ? 1 : 0,
          });
        } else {
          const entry = days.find((d) => d.date === lesson.date);
          entry.regular += !lesson.isSubstitution && !lesson.isFree ? 1 : 0;
          entry.substituted += lesson.isSubstitution ? 1 : 0;
          entry.eva += lesson.isEva ? 1 : 0;
          entry.free += lesson.isFree ? 1 : 0;
        }
      });
      const weeks = [];
      lessons.forEach((lesson) => {
        const weekNumber = moment(lesson.date, "DD.MM.YYYY").isoWeek();
        if (!weeks.filter((w) => w.weekNumber === weekNumber).length > 0) {
          weeks.push({
            weekNumber: weekNumber,
            week: `${moment()
              .year(moment(lesson.date, "DD.MM.YYYY").format("YYYY"))
              .isoWeek(weekNumber)
              .format("DD")}-${moment()
              .year(moment(lesson.date, "DD.MM.YYYY").format("YYYY"))
              .isoWeek(weekNumber)
              .add(6, "days")
              .format("DD.MM")}`,
            regular: lesson.isSubstitution ? 1 : 0,
            substituted: lesson.isSubstitution ? 1 : 0,
            free: lesson.isFree ? 1 : 0,
            eva: lesson.isEva ? 1 : 0,
          });
        } else {
          const entry = weeks.find((w) => w.weekNumber === weekNumber);
          entry.regular += !lesson.isSubstitution && !lesson.isFree ? 1 : 0;
          entry.substituted += lesson.isSubstitution ? 1 : 0;
          entry.eva += lesson.isEva ? 1 : 0;
          entry.free += lesson.isFree ? 1 : 0;
        }
      });

      res.send({
        lessons: [
          { name: "Regulär", value: regular.length },
          { name: "Vertreten", value: substituted.length },
          { name: "E.V.A.", value: eva.length },
          { name: "Frei", value: free.length },
        ],
        subjects: client.subjects.map((subject) => {
          return {
            subjName: subject.name,
            subjFree: lessons.filter(
              (l) => l.isFree && l.subject === subject.name
            ).length,
            subjSubstituted: lessons.filter(
              (l) => l.isSubstitution && l.subject === subject.name
            ).length,
            subjEVA: lessons.filter(
              (l) => l.isEva && l.subject === subject.name
            ).length,
            subjRegular: lessons.filter(
              (l) =>
                l.subject === subject.name &&
                !l.isSubstitution &&
                !l.isFree &&
                !l.isEva
            ).length,
          };
        }),
        teachers: teachers
          .filter((t) => t)
          .filter((t) => t.teacherAmnt > 0)
          .sort((a, b) => b.teacherAmnt - a.teacherAmnt),
        days: days,
        weeks: weeks,
      });
    }
  );
});

app.listen(port, () => {
  console.log(chalk.green(`Server is running on port ${port}`));
});
