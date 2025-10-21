// src/utils/uploadToCloudinary.ts
import cloudinary from "../config/cloudinary";

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
): Promise<string> => {
  try {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto", // Automatically detect image, video, raw
        },
        (error: any, result: any) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(new Error("Failed to upload file to cloud storage"));
          } else {
            resolve(result?.secure_url || "");
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    throw new Error("Failed to upload file");
  }
};
