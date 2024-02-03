import dotenv from "dotenv";
import UntisClient from "./UntisClient.js";
import chalk from "chalk";

chalk.level = 1;

dotenv.config();
const client = new UntisClient(
  process.env.USERNAME,
  process.env.PASSWORD,
  "2024-01-29",
  2
);
client.init(() => {
  const numLessons = client.lessons.length;
  const cancelledLessons = client.lessons.filter(
    (lesson) => lesson.isFree || lesson.isSubstitution
  );
  const numCancelled = cancelledLessons.length;
  const numOfSubLessons = client.lessons.filter(
    (lesson) => lesson.isSubstitution
  ).length;
  const numOfFreeLessons = client.lessons.filter(
    (lesson) => lesson.isFree
  ).length;
  const percentageCancelled = Math.round((numCancelled / numLessons) * 100);
  const percentageSubstitutedByCancelled = Math.round(
    (numOfSubLessons / numCancelled) * 100
  );
  const percentageSubstituted = Math.round(
    (numOfSubLessons / numLessons) * 100
  );
  const percentageFreeByCancelled = Math.round(
    (numOfFreeLessons / numCancelled) * 100
  );
  const percentageFree = Math.round((numOfFreeLessons / numLessons) * 100);

  console.log(
    chalk.green(`Anzahl Stunden gesamt: ${numLessons},
    ` )+
      chalk.red(
        `Ausgefallen: ${numCancelled}, 
    ` +
          `In Prozent: ${percentageCancelled}%  
        `
      ) +
      chalk.magenta(
        `Vertreten: ${numOfSubLessons}, 
        ` +
          `In Prozent: ${percentageSubstitutedByCancelled}% 
        `
      ) +
      chalk.cyanBright(
        `Frei: ${numOfFreeLessons}, 
        ` +
          `In Prozent: ${percentageFreeByCancelled}% 
        `
      ) + chalk.magentaBright(
      `
    Vertreten: ${numOfSubLessons}, 
    ` +
      `In Prozent: ${percentageSubstituted}% 
        ` ) + chalk.cyanBright( 
      `
    Frei: ${numOfFreeLessons}, 
    ` +
      `In Prozent: ${percentageFree}% 
        ` )
  );
});
