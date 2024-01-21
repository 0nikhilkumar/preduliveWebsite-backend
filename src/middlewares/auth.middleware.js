import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(400, "Unauthorized request");
    }

    const decodedInformation = jwt.verify(
      token,
      process.env.ACCESS_SECRET_TOKEN
    );

    const user = await User.findById(decodedInformation?._id).select(
      "-password -cpassword -refreshToken"
    );

    if (!user) {
      throw new ApiError(400, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export { verifyJWT };
