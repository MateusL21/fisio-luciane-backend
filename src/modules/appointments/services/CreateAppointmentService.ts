import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { CreateAppointmentDTO } from "../dtos/CreateAppointmentDTO";

export class CreateAppointmentService {
  constructor(private repository: AppointmentRepository) {}

  async execute(data: CreateAppointmentDTO) {
    // aqui futuramente pode entrar regra de negócio

    return this.repository.create(data);
  }
}