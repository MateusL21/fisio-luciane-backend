import { Request, Response } from "express";
import { AppointmentRepository } from "../repositories/AppointmentRepository";

export class GetAppointmentController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // VALIDAÇÃO CORRETA: ID inválido = 400
      if (!id || Array.isArray(id) || id.length < 10) {
        return res.status(400).json({
          error: "ID inválido"
        });
      }

      const repository = new AppointmentRepository();
      const appointment = await repository.findById(id);
      
      // NÃO ENCONTRADO = 404
      if (!appointment) {
        return res.status(404).json({
          error: "Agendamento não encontrado"
        });
      }
      
      return res.status(200).json(appointment);
    } catch (error) {
      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }
}