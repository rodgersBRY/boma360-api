import "dotenv/config";
import { initializeServer } from "./config/express";

const app = initializeServer();

export default app;
