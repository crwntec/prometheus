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