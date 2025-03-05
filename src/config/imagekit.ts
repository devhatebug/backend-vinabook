import ImageKit from "imagekit";
import { config } from "./dotenv";

const imagekit = new ImageKit({
  publicKey: config.imageKit.publicKey,
  privateKey: config.imageKit.privateKey,
  urlEndpoint: config.imageKit.url,
});

export default imagekit;
