import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { CreateAppointmentController } from "./modules/appointments/controllers/CreateAppointmentController";
import { errorHandler } from "./shared/middlewares/errorHandler";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

const createAppointmentController = new CreateAppointmentController();

app.post("/appointments", (req, res) =>
  createAppointmentController.handle(req, res)
);

app.use(errorHandler);

export { app };