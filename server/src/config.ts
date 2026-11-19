import multer from "multer";

export const maxAvatarSize = 5 * 1024 * 1024;
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxAvatarSize,
    files: 1,
    fields: 10,
    fieldSize: 16 * 1024,
    parts: 11,
  },
});
