import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '../../../shared/database/prisma';
import { AppointmentRepository } from '../repositories/AppointmentRepository';

describe('GetAppointmentController', () => {
  beforeEach(async () => {
    await prisma.appointment.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve retornar agendamento por ID', async () => {
    const appointment = await prisma.appointment.create({
      data: {
        name: 'João Silva',
        phone: '11999999999',
        problem: 'Dor lombar',
        address: 'Rua Teste, 123'
      }
    });

    console.log('✅ Agendamento criado no banco:', appointment.id);

    const response = await request(app).get(`/appointments/${appointment.id}`);

    console.log('📥 Resposta da busca:', response.status);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(appointment.id);
    expect(response.body.name).toBe('João Silva');
  });

  it('deve retornar 404 quando ID não existe', async () => {
    const response = await request(app).get('/appointments/id-inexistente');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Agendamento não encontrado');
  });

  it('deve retornar 400 quando ID é inválido', async () => {
    const response = await request(app).get('/appointments/123');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'ID inválido');
  });

  // ✅ TESTE PARA COBRIR LINHA 28 (ERRO INTERNO)
  it('deve retornar 500 quando ocorre erro interno', async () => {
    // Mock do repository para simular erro
    jest.spyOn(AppointmentRepository.prototype, 'findById').mockRejectedValueOnce(new Error('Erro interno'));

    const response = await request(app)
      .get('/appointments/qualquer-id');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro interno do servidor');
  });
});