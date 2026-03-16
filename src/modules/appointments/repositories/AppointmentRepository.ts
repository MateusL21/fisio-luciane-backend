import { prisma } from "../../../shared/database/prisma";
import { CreateAppointmentDTO } from "../dtos/CreateAppointmentDTO";

export class AppointmentRepository {
  // CREATE - já existente
  async create(data: CreateAppointmentDTO) {
    return prisma.appointment.create({
      data,
    });
  }

  // READ - findAll (já existente)
  async findAll() {
    return prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  // NOVO: Buscar por telefone
  async findByPhone(phone: string) {
    return prisma.appointment.findMany({
      where: {
        phone: {
          contains: phone,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // NOVO: Buscar por ID
  async findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
    });
  }

  // NOVO: Deletar
  async delete(id: string) {
    return prisma.appointment.delete({
      where: { id },
    });
  }

  // NOVO: Atualizar (opcional - pode ser útil depois)
  async update(id: string, data: Partial<CreateAppointmentDTO>) {
    return prisma.appointment.update({
      where: { id },
      data,
    });
  }
}