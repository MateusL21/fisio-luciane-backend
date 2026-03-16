import { Request, Response } from "express";
import { CreateAppointmentService } from "../services/CreateAppointmentService";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { createAppointmentSchema } from "../dtos/CreateAppointmentDTO";
import { ZodError, treeifyError } from "zod";

export class CreateAppointmentController {
  async handle(req: Request, res: Response) {
    try {
      // Valida os dados com Zod
      const data = createAppointmentSchema.parse(req.body);

      // Injeção de dependências
      const repository = new AppointmentRepository();
      const service = new CreateAppointmentService(repository);

      // Executa o service
      const appointment = await service.execute(data);

      return res.status(201).json(appointment);
    } catch (error) {
      // Tratamento específico para erros do Zod
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: treeifyError(error) // Usando treeifyError
        });
      }
      
      // Erro genérico
      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }
}