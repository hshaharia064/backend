import express from "express";
import { Student } from "../models/studentSchema.js";
import multer from "multer";
import path from "path";
import fs from "fs";
const studentRouter = express.Router();

// multer configs------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const newFilename = Date.now() + path.extname(file.originalname);
    cb(null, newFilename);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images can be uploaded"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limit: {
    fileSize: 1024 * 1024 * 5,
  },
});

studentRouter.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";
    const query = {
      $or: [
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
      ],
    };
    const students = await Student.find(query);
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// fetch single student
studentRouter.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "user not found" });
    }

    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// add student
studentRouter.post("/", upload.single("profile_pic"), async (req, res) => {
  try {
    // const newStudent = await Student.create(req.body);

    const student = new Student(req.body);
    if (req.file) {
      student.profile_pic = req.file.filename;
    }
    const newStudent = await student.save();

    res.status(201).json({ message: "New student added" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// update student
studentRouter.put("/:id", upload.single("profile_pic"), async (req, res) => {
  try {
    const existingStudent = await Student.findById(req.params.id);
    if (!existingStudent) {
      if (req.file.filename) {
        const filepath = path.join("./uploads", req.file.filename);
        fs.unlink(filepath, (err) =>
          console.log("Could not delete the req image", err),
        );
      }

      return res.status(404).json({ message: "Student not found" });
    }

    if (req.file) {
      if (existingStudent.profile_pic) {
        const oldImagePath = path.join(
          "./uploads",
          existingStudent.profile_pic,
        );
        fs.unlink(oldImagePath, (err) =>
          console.log("Could not delete the old image", err),
        );
      }
      req.body.profile_pic = req.file.filename;
    }
    console.log("---------------------------", req.file, req.body);
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedStudent) {
      return res.status(404).json({ message: "student not found" });
    }

    res.status(201).json({ message: updatedStudent });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

studentRouter.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "User not found" });
    }

    if (student.profile_pic) {
      const filePath = path.join("./uploads", student.profile_pic);
      fs.unlink(filePath, (err) =>
        console.log("Error occured while deleting file", err),
      );
    }

    res.status(200).json("User has been deleted");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default studentRouter;
