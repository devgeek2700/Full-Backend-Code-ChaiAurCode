import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/fileUpload.js";
import { ApiReponse } from "../utils/ApiReponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  // Validation - Check if any required fields are empty
  if (
    [fullName, username, email, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All input fields are required!");
  }

  // Check if user already exists by username or email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  console.log("existedUser: ", existedUser);

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // Avatar and cover image paths from request files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log("avatarLocalPath: ", avatarLocalPath);
  console.log("coverImageLocalPath: ", coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(409, "Avatar is not present!");
  }

  // Upload avatar and cover image to Cloudinary
  const avatar = await uploadFileOnCloudinary(avatarLocalPath);
  const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Avatar upload failed!");
  }

  // Create new user in the database
  const newUser = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    email,
    password,
  });

  // Select user fields to return in response (exclude sensitive data)
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User registration failed!");
  }

  // Return success response with created user data
  return res
    .status(201)
    .json(new ApiReponse(201, createdUser, "User registration successful!"));
});

export { registerUser };
