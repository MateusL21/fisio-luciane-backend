import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '../../../shared/database/prisma';
import { AppointmentRepository } from '../repositories/AppointmentRepository';

describe('CreateAppointmentController', () => {
  beforeEach(async () => {
    await prisma.appointment.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve retornar 201 ao criar agendamento com dados válidos', async () => {
    const response = await request(app)
      .post('/appointments')
      .send({
        name: 'João Silva',
        phone: '11999999999',
        problem: 'Dor lombar',
        address: 'Rua Teste, 123'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('João Silva');
  });

  it('deve retornar 400 com dados inválidos', async () => {
    const response = await request(app)
      .post('/appointments')
      .send({
        name: 'Jo',
        phone: '119',
        problem: 'Dor',
        address: 'Rua'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Dados inválidos');
  });

  it('deve retornar 400 quando campo obrigatório está faltando', async () => {
    const response = await request(app)
      .post('/appointments')
      .send({
        name: 'João Silva',
        phone: '11999999999'
        // faltando problem e address
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Dados inválidos');
  });

  // ✅ TESTE PARA COBRIR LINHA 31 (ERRO INTERNO)
  it('deve retornar 500 quando ocorre erro interno', async () => {
    // Mock do repository para simular erro
    jest.spyOn(AppointmentRepository.prototype, 'create').mockRejectedValueOnce(new Error('Erro interno'));

    const response = await request(app)
      .post('/appointments')
      .send({
        name: 'João Silva',
        phone: '11999999999',
        problem: 'Dor lombar',
        address: 'Rua Teste, 123'
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro interno do servidor');
  });
});