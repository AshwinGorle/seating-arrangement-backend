import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: "dpgj9mrly",
  api_key: "551968651855126",
  api_secret: "BAE53B15sBunaCEbmg1gNQM5VV8",
});


const uploadToCloudinary = async (filePath, folderName, fileName, retries = 2) => {
  // Upload the file to Cloudinary
  return new Promise((resolve, reject) => {
    const uploadFunction = (retryCount) => {
      cloudinary.uploader.upload(
        filePath,
        { public_id: `${folderName}/${fileName}` }, // Set folder name and file name
        function (error, result) {
          if (error) {
            console.error("Error uploading file to Cloudinary:", error);
            if (retryCount > 0) {
              console.log(`Retrying upload. ${retryCount} retries left...`);
              uploadFunction(retryCount - 1); // Retry the upload
            } else {
              console.error("Retry limit reached. Upload failed.");
              reject(error);
            }
          } else {
            console.log("File uploaded to Cloudinary successfully");
            resolve(result?.secure_url); // Return the secure URL of the uploaded file
          }
        }
      );
    };

    uploadFunction(retries);
  });
};


export default uploadToCloudinary;
