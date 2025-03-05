import dotenv from "dotenv";

dotenv.config();

export const config = {
  db: {
    name: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    pass: process.env.DB_PASS!,
    host: process.env.DB_HOST!,
  },
  port: process.env.PORT || 8080,
  imageKit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    url: process.env.IMAGEKIT_URL!,
  },
};
