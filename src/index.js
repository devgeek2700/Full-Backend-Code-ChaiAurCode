// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB();

/*
import express from "express";
const app = express()(
  // when working with database apply try&catch and async await

  // yippee
  async () => {
    try {
      await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
      app.on("error", (error) => {
        console.log("DB CONNECTION ERROR", error);
        throw error;
      });

      app.listen(process.env.PORT, () => {
        console.log(`Listening on port ${process.env.PORT}`);
      });
    } catch (error) {
      console.error("ERROR:", error);
      throw error;
    }
  }
)();
*/
