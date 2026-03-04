import { prisma } from "../../../shared/database/prisma";
import { CreateAppointmentDTO } from "../dtos/CreateAppointmentDTO";

export class AppointmentRepository {
  async create(data: CreateAppointmentDTO) {
    return prisma.appointment.create({
      data,
    });
  }

  async findAll() {
    return prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}