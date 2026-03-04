import { Request, Response } from "express";
import { z } from "zod";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { CreateAppointmentService } from "../services/CreateAppointmentService";

const createAppointmentSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  problem: z.string().min(5),
  address: z.string().min(5),
});

export class CreateAppointmentController {
  async handle(req: Request, res: Response) {
    const data = createAppointmentSchema.parse(req.body);

    const repository = new AppointmentRepository();
    const service = new CreateAppointmentService(repository);

    const appointment = await service.execute(data);

    return res.status(201).json(appointment);
  }
}