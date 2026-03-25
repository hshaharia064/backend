import express from "express";
// const bodyParser = require("body-parser");

import studentRouter from "./routes/studentsRoute.js";
import { connectDb } from "./config/db.js";
import { MulterError } from "multer";
import cors from "cors";
import path from "path";
import auth from "./middleware/auth.js";
import userRouter from "./routes/userRoute.js";

connectDb();

const app = express();

const PORT = process.env.PORT;

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse application/json
app.use(express.json());
app.use("/uploads", express.static(path.join("__dirname", "uploads")));
app.use(cors());

app.use("/api/users", userRouter);

app.use(auth);
app.use("/api/students", studentRouter);

// error handler middleware
app.use((error, req, res, next) => {
  if (error instanceof MulterError) {
    return res
      .status(400)
      .json({ message: `image error ${error.message} ${error.code}` });
  } else if (error) {
    return res.status(400).json({ message: error });
  }
  next();
});

app.listen(PORT, () => {
  console.log("Server running on port 5000");
});
