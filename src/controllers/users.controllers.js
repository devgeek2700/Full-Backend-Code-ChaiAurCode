import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/fileUpload.js";
import { ApiReponse } from "../utils/ApiReponse.js";

const generateAccessandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    // accesss tokens are given to user
    const accessToken = user.generateAccessToken();

    // refresh tokens are given to db
    const refreshToken = user.generateRefreshToken();
    // we are saving the endecoded token (user.refreshToken) from auth to this refreshToken
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access  and refresh tokens!"
    );
  }
};

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
  console.log(req.files);

  // Avatar and cover image paths from request files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log("avatarLocalPath: ", avatarLocalPath);
  // console.log("coverImageLocalPath: ", coverImageLocalPath);

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

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

const loginUser = asyncHandler(async (req, res) => {
  // re body --> data
  // username or email
  // find the user
  // password checkb
  // access and redresh token generate
  // send token in cookies

  const { email, username, password } = req.body;
  // console.log("Email: ", email);

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "Don't have Account!");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials!");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    user._id
  );

  console.log("accessToken: ", accessToken);
  console.log("refreshToken: ", refreshToken);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiReponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiReponse(200, {}, "User Logged Out!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingrefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingrefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingrefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(404, "Invalide refresh token!");
    }

    if (user?.refreshToken !== incomingrefreshToken) {
      throw new ApiError(404, "Refresh token is expired or used!");
    }

    const { accessToken, newrefreshToken } =
      await generateAccessandRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiReponse(
          200,
          {
            accessToken,
            refreshToken: newrefreshToken,
          },
          "Access Token Refreshed!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Refresh token is Invalid!");
  }
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!(newPassword === confirmPassword)) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  const user = await User.findById(req.user?.id);
  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Current Passowrd");
  }

  user.password = confirmPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiReponse(200, {}, "Password changed successfully!"));
});

const getcCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user?._id);

  return res
    .status(200)
    .json(200, currentUser, "Current User Fetched Successfully!");
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { username, email, fullName } = req.body;

  if (!username || !email || !fullName) {
    throw new ApiError(400, "All fields are reqired");
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
        username,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiReponse(200, {}, "Current User Fetched Successfully!"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarUpdateLocalPath = req.file?.path;

  if (!avatarUpdateLocalPath) {
    throw new ApiError(400, "avatar is missing!");
  }

  const avatarUpdate = await uploadFileOnCloudinary(avatarUpdateLocalPath);

  if (!avatarUpdate.url) {
    throw new ApiError(400, "ERROR while Updating avatar!");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatarUpdate.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiReponse(200, user, "Avatar Updated Successfully!"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageUpdateLocalPath = req.file?.path;

  if (!coverImageUpdateLocalPath) {
    throw new ApiError(400, "Cover Image is missing!");
  }

  const coverImageUpdate = await uploadFileOnCloudinary(
    coverImageUpdateLocalPath
  );

  if (!coverImageUpdate.url) {
    throw new ApiError(400, "ERROR while Updating Cover Image!");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: coverImageUpdate.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiReponse(200, user, "Cover Image Updated Successfully!"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required!");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "Subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "Subscriptions",
        localField: "_id",
        foreignField: "Subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(400, "Channel does not exists!");
  }

  return res
    .status(200)
    .json(new ApiReponse(200, channel[0], "User channel fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getcCurrentUser,
  updateUserDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
};
