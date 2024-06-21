import { Router } from "express";
import {
  changeCurrentUserPassword,
  getUserChannelProfile,
  getWatchHistory,
  getcCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateAvatar,
  updateCoverImage,
  updateUserDetails,
} from "../controllers/users.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/users.controllers.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentUserPassword);
router.route("/current-user").get(verifyJWT, getcCurrentUser);
router.route("/update-user").patch(verifyJWT, updateUserDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
  .route("/update-coverimage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

// when fetching data from paramas user the same name
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watchhistory").get(verifyJWT, getWatchHistory);

export default router;
