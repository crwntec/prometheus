import moment from "moment";
import { getData, getTeachers, getRooms, getInfo } from "./Request.js";

class UntisClient {
  async init(username, password) {
    const { sessionID, userID, currentSchoolYear, holidays } = await getInfo(username, password);
    // console.log( await getIdentifiers(username, password))
    this.currentSchoolYear = currentSchoolYear;
    this.holidays = holidays;
    await this.getElements(sessionID, userID);
    return [sessionID, userID];
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
        this.teachers = teachers;
        this.rooms = rooms;
        this.subjects = subjects;
        if (error) {
          console.log(error.response);
          return error;
        }
      }
    );
  }

  getLessonsForTimeframe(token, date, lookBack, userID, callback) {
    getData(date, lookBack, token, userID, this.currentSchoolYear, this.holidays, (error, lessons) => {
      this.lessons = lessons;
      callback(error, lessons);
    });
  }
  getLessonsForWeek(token, date, userID, callback) {
    getData(date, 1, token, userID, this.currentSchoolYear, this.holidays, (error, lessons) => {
      this.lessons = lessons;
      callback(error, lessons);
    });
  }
}

export default UntisClient;
