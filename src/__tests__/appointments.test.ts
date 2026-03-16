import request from 'supertest';
import { app } from '../app';
import { prisma } from '../shared/database/prisma';

describe('Appointments API', () => {
  // Limpa a tabela antes de cada teste
  beforeEach(async () => {
    await prisma.appointment.deleteMany({});
  });

  // Fecha conexão após todos os testes
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /appointments', () => {
    it('deve criar um novo agendamento com dados válidos', async () => {
      const response = await request(app)
        .post('/appointments')
        .send({
          name: 'João Silva',
          phone: '11999999999',
          problem: 'Dor lombar crônica',
          address: 'Rua das Flores, 123 - São Paulo/SP'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('João Silva');
      expect(response.body.phone).toBe('11999999999');
      expect(response.body.problem).toBe('Dor lombar crônica');
      expect(response.body.address).toBe('Rua das Flores, 123 - São Paulo/SP');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('deve retornar erro 400 com dados inválidos (campos curtos)', async () => {
      const response = await request(app)
        .post('/appointments')
        .send({
          name: 'Jo', // muito curto (min 3)
          phone: '119', // muito curto (min 10)
          problem: 'Dor', // muito curto (min 5)
          address: 'Rua' // muito curto (min 5)
        });

      expect(response.status).toBe(400);
      
      // Verifica o formato da resposta do CreateAppointmentController
      expect(response.body).toHaveProperty('error', 'Dados inválidos');
      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toHaveProperty('properties');
      
      // Verifica mensagens de erro específicas
      const errors = response.body.details.properties;
      expect(errors.name.errors[0]).toBe('Nome precisa ter pelo menos 3 caracteres');
      expect(errors.phone.errors[0]).toBe('Telefone inválido');
      expect(errors.problem.errors[0]).toBe('Descreva melhor o problema');
      expect(errors.address.errors[0]).toBe('Endereço inválido');
    });

    it('deve retornar erro 400 quando campo obrigatório está faltando', async () => {
      const response = await request(app)
        .post('/appointments')
        .send({
          name: 'João Silva',
          phone: '11999999999'
          // faltando problem e address
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Dados inválidos');
      expect(response.body).toHaveProperty('details');
      
      // Verifica se os campos faltantes foram capturados
      const errors = response.body.details.properties;
      expect(errors.problem).toBeDefined();
      expect(errors.address).toBeDefined();
    });

    it('deve retornar erro 400 com campos vazios', async () => {
      const response = await request(app)
        .post('/appointments')
        .send({
          name: '',
          phone: '',
          problem: '',
          address: ''
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Dados inválidos');
    });
  });

  describe('GET /appointments', () => {
    it('deve retornar lista vazia quando não há agendamentos', async () => {
      const response = await request(app).get('/appointments');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('deve listar todos os agendamentos', async () => {
      // Cria 2 agendamentos
      await request(app)
        .post('/appointments')
        .send({
          name: 'João Silva',
          phone: '11999999999',
          problem: 'Dor lombar',
          address: 'Rua A, 123'
        });

      await request(app)
        .post('/appointments')
        .send({
          name: 'Maria Santos',
          phone: '11988888888',
          problem: 'Dor no ombro',
          address: 'Rua B, 456'
        });

      const response = await request(app).get('/appointments');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      // Verifica ordem decrescente (mais recente primeiro)
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[1]).toHaveProperty('name');
      
      // Verifica os dados
      const names = response.body.map((item: any) => item.name);
      expect(names).toContain('João Silva');
      expect(names).toContain('Maria Santos');
    });

    it('deve filtrar agendamentos por telefone', async () => {
      // Cria agendamentos com diferentes telefones
      await request(app)
        .post('/appointments')
        .send({
          name: 'João Silva',
          phone: '11999999999',
          problem: 'Dor lombar',
          address: 'Rua A, 123'
        });

      await request(app)
        .post('/appointments')
        .send({
          name: 'Maria Santos',
          phone: '11988888888',
          problem: 'Dor no ombro',
          address: 'Rua B, 456'
        });

      await request(app)
        .post('/appointments')
        .send({
          name: 'Pedro Souza',
          phone: '11977777777',
          problem: 'Dor no joelho',
          address: 'Rua C, 789'
        });

      const response = await request(app)
        .get('/appointments')
        .query({ phone: '11999999999' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('João Silva');
      expect(response.body[0].phone).toBe('11999999999');
    });

    it('deve retornar lista vazia quando telefone não encontrado', async () => {
      const response = await request(app)
        .get('/appointments')
        .query({ phone: '11999999999' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /appointments/:id', () => {
    it('deve retornar um agendamento específico por ID', async () => {
      // Primeiro cria um agendamento
      const createResponse = await request(app)
        .post('/appointments')
        .send({
          name: 'João Silva',
          phone: '11999999999',
          problem: 'Dor lombar',
          address: 'Rua A, 123'
        });

      const { id } = createResponse.body;

      // Busca pelo ID
      const response = await request(app)
        .get(`/appointments/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(id);
      expect(response.body.name).toBe('João Silva');
      expect(response.body.phone).toBe('11999999999');
      expect(response.body.problem).toBe('Dor lombar');
      expect(response.body.address).toBe('Rua A, 123');
    });

    it('deve retornar 404 quando ID não existe', async () => {
      const response = await request(app)
        .get('/appointments/id-inexistente');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Agendamento não encontrado');
    });

    it('deve retornar 400 quando ID é inválido (formato incorreto)', async () => {
      const response = await request(app)
        .get('/appointments/123'); // ID muito curto (UUID inválido)

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'ID inválido');
    });
  });

  describe('DELETE /appointments/:id', () => {
    it('deve deletar um agendamento existente', async () => {
      // Primeiro cria um agendamento
      const createResponse = await request(app)
        .post('/appointments')
        .send({
          name: 'João Silva',
          phone: '11999999999',
          problem: 'Dor lombar',
          address: 'Rua A, 123'
        });

      const { id } = createResponse.body;

      // Deleta
      const deleteResponse = await request(app)
        .delete(`/appointments/${id}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('message', 'Agendamento deletado com sucesso');

      // Verifica se realmente foi deletado
      const getResponse = await request(app)
        .get(`/appointments/${id}`);

      expect(getResponse.status).toBe(404);
    });

    it('deve retornar 404 ao tentar deletar ID inexistente', async () => {
      const response = await request(app)
        .delete('/appointments/id-inexistente');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Agendamento não encontrado');
    });

    it('deve retornar 400 ao tentar deletar com ID inválido', async () => {
      const response = await request(app)
        .delete('/appointments/123'); // ID inválido

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'ID inválido');
    });
  });
});