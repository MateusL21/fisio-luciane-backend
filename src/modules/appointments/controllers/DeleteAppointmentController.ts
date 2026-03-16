import { Request, Response } from "express";
import { AppointmentRepository } from "../repositories/AppointmentRepository";

export class DeleteAppointmentController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // VALIDAÇÃO DE ID INVÁLIDO - retorna 400
      if (!id || Array.isArray(id) || id.length < 10) {
        return res.status(400).json({
          error: "ID inválido"
        });
      }

      const repository = new AppointmentRepository();
      
      // Verifica se existe
      const appointment = await repository.findById(id);
      
      // NÃO ENCONTRADO - retorna 404
      if (!appointment) {
        return res.status(404).json({
          error: "Agendamento não encontrado"
        });
      }
      
      // Se existe, deleta
      await repository.delete(id);
      
      return res.status(200).json({
        message: "Agendamento deletado com sucesso"
      });
    } catch (error) {
      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }
}