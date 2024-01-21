import express from "express";
import { LIMIT } from "./constants.js";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({origin: process.env.CORS_ORIGIN, credentials: true}))
app.use(express.json({limit: LIMIT}))
app.use(express.urlencoded({
    extended: true, limit: LIMIT
}));
app.use(express.static("public"))
app.use(cookieParser());

import userRouter from "./routes/user.routes.js"

app.use("/api/v1/user", userRouter);

export { app };
