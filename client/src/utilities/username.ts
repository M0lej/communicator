const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;

export function isValidUsername(username: unknown): username is string {
  return typeof username === "string" && USERNAME_PATTERN.test(username);
}
