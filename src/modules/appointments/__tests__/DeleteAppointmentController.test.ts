import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '../../../shared/database/prisma';
import { AppointmentRepository } from '../repositories/AppointmentRepository';

describe('DeleteAppointmentController', () => {
  beforeEach(async () => {
    await prisma.appointment.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve deletar agendamento existente', async () => {
    const appointment = await prisma.appointment.create({
      data: {
        name: 'João Silva',
        phone: '11999999999',
        problem: 'Dor lombar',
        address: 'Rua Teste, 123'
      }
    });

    console.log('✅ Agendamento criado no banco:', appointment.id);

    const deleteResponse = await request(app)
      .delete(`/appointments/${appointment.id}`);

    console.log('🗑️ Resposta do DELETE:', deleteResponse.status, deleteResponse.body);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toHaveProperty('message', 'Agendamento deletado com sucesso');

    const deleted = await prisma.appointment.findUnique({
      where: { id: appointment.id }
    });
    expect(deleted).toBeNull();
  });

  it('deve retornar 404 ao deletar ID inexistente', async () => {
    const response = await request(app)
      .delete('/appointments/id-inexistente');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Agendamento não encontrado');
  });

  it('deve retornar 400 ao deletar com ID inválido', async () => {
    const response = await request(app)
      .delete('/appointments/123');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'ID inválido');
  });

  // ✅ TESTE PARA COBRIR LINHA 35 (ERRO INTERNO)
  it('deve retornar 500 quando ocorre erro interno', async () => {
    const appointment = await prisma.appointment.create({
      data: {
        name: 'João Silva',
        phone: '11999999999',
        problem: 'Dor lombar',
        address: 'Rua Teste, 123'
      }
    });

    // Mock do repository para simular erro
    jest.spyOn(AppointmentRepository.prototype, 'delete').mockRejectedValueOnce(new Error('Erro interno'));

    const response = await request(app)
      .delete(`/appointments/${appointment.id}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro interno do servidor');
  });
});