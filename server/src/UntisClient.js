import moment from "moment";
import { getData, getTeachers, getRooms, getInfo } from "./Request.js";
import chalk from "chalk";

class UntisClient {
  async init(username, password) {
    const {
      sessionID,
      userID,
      allowedClass,
      currentSchoolYear,
      holidays,
    } = await getInfo(username, password);
    // console.log( await getIdentifiers(username, password))
    this.currentSchoolYear = currentSchoolYear;
    this.holidays = holidays;
    this.sessionID = sessionID;
    this.userID = userID;
    this.useClass = false;
    await this.getElements(sessionID, userID);
    return [sessionID, userID, allowedClass, currentSchoolYear];
  }
  async refresh() {

  }
  async getElements(sessionID, userID) {
    await getData(
      moment().format("YYYY-MM-DD"),
      1,
      sessionID,
      userID,
      this.currentSchoolYear,
      this.holidays,
      (error, _, teachers, rooms, subjects) => {
        if (error) {
          if (error == 204 || error == 403) {
            return error;
          }
          console.log(chalk.red("Error during initialization: ", error));
          return error;
        }
        this.teachers = teachers;
        this.rooms = rooms;
        this.subjects = subjects;
      }
    );
  }

  getLessonsForTimeframe(token, date, lookBack, userID, callback) {
    getData(
      date,
      lookBack,
      token,
      userID,
      this.currentSchoolYear,
      this.holidays,
      (error, lessons) => {
        this.lessons = lessons;
        callback(error, lessons);
      }
    );
  }
  getLessonsForWeek(token, date, userID, callback) {
    getData(
      date,
      1,
      token,
      userID,
      this.currentSchoolYear,
      this.holidays,
      (error, lessons) => {
        this.lessons = lessons;
        callback(error, lessons);
      }
    );
  }
}

export default UntisClient;
