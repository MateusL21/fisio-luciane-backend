import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '../../../shared/database/prisma';
import { AppointmentRepository } from '../repositories/AppointmentRepository';

describe('ListAppointmentsController', () => {
  beforeEach(async () => {
    await prisma.appointment.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve retornar lista vazia quando não há agendamentos', async () => {
    const response = await request(app).get('/appointments');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('deve listar todos os agendamentos', async () => {
    const appointment1 = await prisma.appointment.create({
      data: {
        name: 'João Silva',
        phone: '11999999999',
        problem: 'Dor lombar',
        address: 'Rua A, 123'
      }
    });

    const appointment2 = await prisma.appointment.create({
      data: {
        name: 'Maria Santos',
        phone: '11988888888',
        problem: 'Dor no ombro',
        address: 'Rua B, 456'
      }
    });

    console.log('📝 Agendamentos criados:', [appointment1.id, appointment2.id]);

    const response = await request(app).get('/appointments');

    console.log('📥 Resposta da listagem:', response.body.length, 'itens');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('name');
  });

  it('deve filtrar agendamentos por telefone', async () => {
    await prisma.appointment.createMany({
      data: [
        {
          name: 'João Silva',
          phone: '11999999999',
          problem: 'Dor lombar',
          address: 'Rua A'
        },
        {
          name: 'Maria Santos',
          phone: '11988888888',
          problem: 'Dor no ombro',
          address: 'Rua B'
        }
      ]
    });

    const response = await request(app)
      .get('/appointments')
      .query({ phone: '11999999999' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('João Silva');
  });

  // ✅ TESTE PARA COBRIR LINHA 24 (ERRO INTERNO)
  it('deve retornar 500 quando ocorre erro interno', async () => {
    // Mock do repository para simular erro
    jest.spyOn(AppointmentRepository.prototype, 'findAll').mockRejectedValueOnce(new Error('Erro interno'));

    const response = await request(app)
      .get('/appointments');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro interno do servidor');
  });
});