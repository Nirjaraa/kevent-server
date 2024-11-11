import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

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
