import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { routes } from "./routes";
import { errorHandler } from "./shared/middlewares/errorHandler";

const app = express();

// Middlewares globais
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Rotas
app.use(routes);

// Error handler (deve ser o último)
app.use(errorHandler);

export { app };