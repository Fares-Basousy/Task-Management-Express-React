import mongoose from "mongoose";
import app from "@/app";
import dotenv from "dotenv";

async function startServer() {
  try {
    dotenv.config();
    const MongodbURI : string = process.env.MongodbURI as string
    await mongoose.connect(MongodbURI); // the ! mark for typescript's undefined


    app.listen(process.env.PORT!, () => {
      console.log(
        `Server running on port ${process.env.PORT}`
      );
    });
  } catch (err) {
    console.log("MongoDB connection failed", err);
    process.exit(1);
  }
}

startServer();