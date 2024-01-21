import mongoose from "mongoose";
import { DBNAME } from "../constants.js";

const connectDB = async ()=> {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DBNAME}`);
        console.log(`Database is connected with HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Database connection failed: ", error);
        process.exit(1);
    }
}

export default connectDB;