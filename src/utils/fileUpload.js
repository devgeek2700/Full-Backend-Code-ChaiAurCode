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

    // upload the file on cloudinary
    const uploadedfileResponse = await cloudinary.uploader.upload(
      localfilePath,
      {
        resource_type: "auto",
      }
    );

    // file has been uploaded successfully
    console.log(
      `File has been uploaded successfully!:  ${uploadedfileResponse.url}`
    );
    return uploadedfileResponse;
  } catch (error) {
    // remove locally saved filehas upload operation got failed!
    fs.unlinkSync(localfilePath);
    return null;
  }
};

export { uploadFileOnCloudinary };
