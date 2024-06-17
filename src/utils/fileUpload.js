import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadFileOnCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) {
      return null;
    }

    // Upload the file to Cloudinary
    const uploadedFileResponse = await cloudinary.uploader.upload(
      localfilePath,
      {
        resource_type: "auto",
      }
    );

    // Log success message
    // console.log(
    //   `File has been uploaded successfully!: ${uploadedFileResponse.url}`
    // );

    fs.unlinkSync(localfilePath);
    return uploadedFileResponse;
  } catch (error) {
    // Handle upload failure
    console.error("Error uploading file to Cloudinary:", error);

    // Remove locally saved file if upload operation fails
    fs.unlinkSync(localfilePath);

    return null;
  }
};

export { uploadFileOnCloudinary };
