import { getData, getTeachers, getRooms, getToken } from "./Request.js";

class UntisClient {
  constructor(username, password, date, lookBack) {
    this.username = username;
    this.password = password;
    this.date = date;
    this.lookBack = lookBack;
  }
  init(callback) { 
    getToken(this.username, this.password).then((token) => {
      this.token = token;
      getData(this.date, this.lookBack, token, (lessons,teachers,rooms) => {
        this.lessons = lessons;
        this.teachers = teachers;
        this.rooms = rooms;
        callback.bind(this)();
      });
    });
   }
   update() {
    getData(this.date, this.lookBack, this.token).then((data) => {
      this.lessons = data;
    }).catch((error) => { 
      if (error.response.status === 403) {
        getToken(this.username, this.password).then((token) => {
          this.token = token;
          getData(this.date, this.lookBack, token).then((data) => {
            this.lessons = data;
          });
        });
      }
     });
   }
};

export default UntisClient;
