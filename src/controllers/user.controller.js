import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshToken = async (id) => {
  const user = await User.findById(id);
  const refreshToken = await user.generateRefreshToken();
  const accessToken = await user.generateAccessToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const register = asyncHandler(async (req, res) => {
  const { name, phone, email, password, cpassword } = req.body;

  if (
    [name, phone, email, password, cpassword].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (password !== cpassword) {
    throw new ApiError(401, "Invalid Password");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new ApiError(400, "User already exists");
  }

  const userCreated = await User.create({
    name,
    phone,
    email,
    password,
    cpassword,
  });

  const user = await User.findById(userCreated._id).select(
    "-password -cpassword -refreshToken"
  );

  if (!user) {
    throw new ApiError(400, "Something went wrong while Sign Up");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, user, "User Successfully Created"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(401, "Email or Password required");
  }

  const userExists = await User.findOne({ email });
  if (!userExists) {
    throw new ApiError(400, "User not found");
  }

  const isPasswordCorrect = await userExists.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    userExists?._id
  );

  const loggedInUser = await User.findById(userExists?._id).select(
    "-password -cpassword -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {accessToken, refreshToken}, "User Successfully Login"));
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout successfully"));
});

export { register, login, logout };
