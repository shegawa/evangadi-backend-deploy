require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 5500;
const cors = require("cors");
app.use(cors());
const dbconnection = require("./db/dbConfig");
//user routes middleware file
const userRoutes = require("./Routes/userRoutes");
const askqueastionroutes = require("./Routes/questionRoutes");
const answerquestions = require("./Routes/answerRoutes");

app.use(express.json()); // any request pass througn this JSON middleware

app.use("/api/users", userRoutes); //user route middleware
app.use("/api/question", askqueastionroutes); //question route middleware
app.use("/api/answer", answerquestions); //answer route middleware
//
//
//
//
//
async function start() {
  try {
    const result = await dbconnection.execute("select 'test'");
    await app.listen(port);
    console.log("database connection established");
    console.log(`listneing on port ${port}`);
  } catch (error) {
    console.log(error.message);
  }
}
start();
// app.listen(port, (err) => {
//   if (err) {
//     console.log(err.message);
//   } else {
//     console.log(`listneing port ${port}`);
//   }
// });
