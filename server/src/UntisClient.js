import moment from "moment";
import { getData, getTeachers, getRooms, getIdentifiers } from "./Request.js";

class UntisClient {
  async init(username, password) {
    const { sessionID, userID } = await getIdentifiers(username, password);
    // console.log( await getIdentifiers(username, password))
    await this.getElements(sessionID, userID);
    return([sessionID,userID]);
    }
  async getElements(sessionID, userID) {
    await getData(moment().format("YYYY-MM-DD"), 1, sessionID, userID, (error, _, teachers, rooms, subjects) => {
      this.teachers = teachers;
      this.rooms = rooms;
      this.subjects = subjects;
      if (error) {
        console.log(error.response);
        return error;
      }
    });
  }

   getLessonsForTimeframe(token, date, lookBack, userID, callback) { 
    getData(date, lookBack, token, userID, (error, lessons) => {
      this.lessons = lessons;
      callback(error, lessons)
    })
    }
    getLessonsForWeek(token, date, userID, callback) {
      getData(date, 1, token, userID, (error, lessons) => {
        this.lessons = lessons;
        callback(error, lessons)
      })
    }
}

export default UntisClient;
