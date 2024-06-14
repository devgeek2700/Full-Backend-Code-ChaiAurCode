// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 300, () => {
      console.log(`Server listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MOGODB DB CONNECTION FAILED !!!`, error);
  });

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
