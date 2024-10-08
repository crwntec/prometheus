import chalk from "chalk";
import fs from "fs";
import moment from "moment";
export const writeToFile = (data) => {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
};

export const convertToUntisDate = (dateObject) => {
  const year = dateObject.getFullYear();
  const month = (dateObject.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 to the month since months are zero-indexed
  const day = dateObject.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const isEarlier = (a, b) => {
    const format = "HH:mm";
    const dateA = moment(a, format);
    const dateB = moment(b, format);
    return dateA.isBefore(dateB);
}
export const isLater = (a, b) => {
    const format = "HH:mm";
    const dateA = moment(a, format);
    const dateB = moment(b, format);
    return dateA.isAfter(dateB);
}

let errorFlag = false;

export const isInHoliday = (date, holidays) => {
  if (holidays == undefined) {
    if (!errorFlag) {
      console.log(chalk.red("Error while checking for holidays. Holidays undefined"))
      console.log(chalk.yellow("Please logout to fix this"))
      errorFlag = true
    }
    return false
  }
 return holidays.find(o=>moment(o.start).isBefore(moment(date,"DD.MM.YYYY")) && moment(o.end).isAfter(moment(date,"DD.MM.YYYY")))
}