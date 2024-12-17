import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    let folder = "uploads";
    if (file.fieldname === "mainImage") folder = "mainImages";
    if (file.fieldname === "otherImages") folder = "otherImages";
    if (file.fieldname === "file") folder = "documents";

    const allowedFormats = ["jpeg", "png", "svg", "jpg", "pdf", "docx"];
    const fileFormat = file.mimetype.split("/")[1];

    if (file.fieldname === "files" && fileFormat !== "pdf") {
      throw new Error("Only PDF files are allowed for the 'files' field");
    }

    return {
      folder: folder,
      format: allowedFormats.includes(fileFormat) ? fileFormat : "jpeg",
      public_id: `${Date.now()}-${file.originalname.replace(/\s/g, "-")}`, // Fixed template literal
    };
  },
});

const uploadMiddleware = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).fields([
  { name: "mainImage", maxCount: 1 },
  { name: "otherImages", maxCount: 5 },
  { name: "files", maxCount: 3 },
]);

const profileStorage = new CloudinaryStorage({
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

export { cloudinary, storage, profileStorage, uploadMiddleware };
