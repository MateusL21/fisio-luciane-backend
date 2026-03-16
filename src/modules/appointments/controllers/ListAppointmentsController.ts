import { Request, Response } from 'express';
import { AppointmentRepository } from '../repositories/AppointmentRepository';

export class ListAppointmentsController {
  async handle(request: Request, response: Response): Promise<Response> {
    const appointmentRepository = new AppointmentRepository();
    
    try {
      // Verifica se tem filtro por telefone
      const { phone } = request.query;
      
      let appointments;
      
      if (phone && typeof phone === 'string') {
        // Busca por telefone se o filtro foi fornecido
        appointments = await appointmentRepository.findByPhone(phone);
      } else {
        // Busca todos se não tiver filtro
        appointments = await appointmentRepository.findAll();
      }
      
      return response.status(200).json(appointments);
    } catch (error) {
      return response.status(500).json({ 
        error: 'Erro interno do servidor' 
      });
    }
  }
}