const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);

  return value;
};

export const FIREBASE_PROJECT_ID = required("FIREBASE_PROJECT_ID");
export const FIREBASE_CLIENT_EMAIL = required("FIREBASE_CLIENT_EMAIL");
export const FIREBASE_PRIVATE_KEY = required("FIREBASE_PRIVATE_KEY").replace(
  /\\n/g,
  "\n",
);
