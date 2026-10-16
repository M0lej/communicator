import crypto from "crypto";
import "dotenv/config";

const SECRET = process.env.SECRET;

export const random = () => crypto.randomBytes(128).toString("base64");
export const hashPassword = (salt: string, value: string) =>
  crypto
    .createHmac("sha256", SECRET as string)
    .update([salt, value].join("/"))
    .digest("hex");

export const hashSessionToken = (sessionToken: string) =>
  crypto
    .createHmac("sha256", SECRET as string)
    .update(sessionToken)
    .digest("hex");
