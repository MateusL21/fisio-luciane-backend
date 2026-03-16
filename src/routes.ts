import { Router } from "express";
import { CreateAppointmentController } from "./modules/appointments/controllers/CreateAppointmentController";
import { ListAppointmentsController } from "./modules/appointments/controllers/ListAppointmentsController";
import { GetAppointmentController } from "./modules/appointments/controllers/GetAppointmentController";
import { DeleteAppointmentController } from "./modules/appointments/controllers/DeleteAppointmentController";

const routes = Router();

// Instancia os controllers
const createAppointmentController = new CreateAppointmentController();
const listAppointmentsController = new ListAppointmentsController();
const getAppointmentController = new GetAppointmentController();
const deleteAppointmentController = new DeleteAppointmentController();

// Rotas de agendamentos
routes.post("/appointments", (req, res) => 
  createAppointmentController.handle(req, res)
);

routes.get("/appointments", (req, res) => 
  listAppointmentsController.handle(req, res)
);

routes.get("/appointments/:id", (req, res) => 
  getAppointmentController.handle(req, res)
);

routes.delete("/appointments/:id", (req, res) => 
  deleteAppointmentController.handle(req, res)
);

export { routes };