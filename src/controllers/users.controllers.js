import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/fileUpload.js";
import { ApiReponse } from "../utils/ApiReponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend -
  // validation - not empty -
  // check if user already exists --> username , email -
  // define local path for images -
  // check for images , check for avatar -
  // upload them to cloundinary -
  // create user object - create entry in db -
  // remove passowrd and refresh token filed from response -
  // check for user creation -
  // return res -

  const { fullName, username, email, password } = req.body;
  // console.log("Email: ", email);
  // console.log("FullName: ", fullName);

  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all Input fields are required!");
  }

  // checks if user is present ot not
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  console.log("existedUser: ", existedUser);

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // avatar Local Path till now it is not gone into cloudinary
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log("avatarLocalPath: ", avatarLocalPath);
  console.log("coverImageLocalPath: ", coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(409, "Avatar is not Present!");
  }

  // upload File On Cloudinary
  const avatar = await uploadFileOnCloudinary(avatarLocalPath);
  const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Avatar Upload failed!");
  }

  // upload the data into db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User Registration failed!");
  }

  return res
    .status(201)
    .json(new ApiReponse(200, createdUser, "User Registration Successfully!"));
});

export { registerUser };
