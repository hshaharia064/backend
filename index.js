import express from "express";
// const bodyParser = require("body-parser");

import studentRouter from "./routes/studentsRoute.js";
import { connectDb } from "./config/db.js";

connectDb();

const app = express();

const PORT = process.env.PORT;

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse application/json
app.use(express.json());

app.use("/api/students", studentRouter);

app.listen(PORT, () => {
  console.log("Server running on port 5000");
});
