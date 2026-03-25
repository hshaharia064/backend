import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// db connect---------

export const connectDb = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Mongo db connected"))
    .catch((err) => console.error(err));
};
