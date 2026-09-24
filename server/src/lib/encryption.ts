import crypto from "crypto";
import "dotenv/config";

const SECRET = process.env.SECRET;

export const random = () => crypto.randomBytes(128).toString("base64");
export const encrypt = (salt: string, value: string) =>
  crypto
    .createHmac("sha256", [salt, value].join("/"))
    .update(SECRET as string)
    .digest("hex");
