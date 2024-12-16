import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => {
//     const allowedImageFormats = ["image/jpeg", "image/png", "image/jpg", "image/svg+xml", "image/webp"];
//     console.log("File mimetype:", file.mimetype);

//     const isPDF = file.mimetype === "application/pdf";
//     if (isPDF) {
//       return {
//         folder: "pdfs",
//         resource_type: "raw", // Specify "raw" for PDFs (non-image files)
//         public_id: `${Date.now()}-${file.originalname}`, // Use a timestamp as part of the public ID
//       };
//     }

//     console.log("File mimetype:", file.mimetype);

//     if (!allowedImageFormats.includes(file.mimetype)) {
//       throw new Error(`Invalid image format. Received ${file.mimetype}. Allowed formats are: jpeg, png, jpg, svg, webp.`);
//     }

//     const fileFormat = file.mimetype.split("/")[1];

//     return {
//       folder: "avatars", // You can set a different folder for images
//       format: allowedImageFormats.includes(fileFormat) ? fileFormat : "jpeg", // Default to jpeg if format is unsupported
//       public_id: `${Date.now()}-${file.originalname}`, // Unique public ID for the image
//     };
//   },
// });
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const allowedFormats = ["jpeg", "png", "svg", "jpg"];
    const fileFormat = file.mimetype.split("/")[1];
    return {
      folder: "avatars",
      format: allowedFormats.includes(fileFormat) ? fileFormat : "jpeg",
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

export { cloudinary, storage };
