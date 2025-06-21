import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from "../utils/dotenv";

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME as string,
    api_key: CLOUDINARY_API_KEY as string,
    api_secret: CLOUDINARY_API_SECRET as string,
    secure: true,
});

export { cloudinary };
