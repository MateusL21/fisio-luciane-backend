import { prisma } from '../../../shared/database/prisma';
import { AppointmentRepository } from '../repositories/AppointmentRepository';

describe('AppointmentRepository', () => {
  let repository: AppointmentRepository;

  beforeEach(() => {
    repository = new AppointmentRepository();
  });

  afterEach(async () => {
    await prisma.appointment.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const mockData = {
    name: 'João Silva',
    phone: '11999999999',
    problem: 'Dor lombar',
    address: 'Rua Teste, 123'
  };

  it('deve criar um agendamento', async () => {
    const result = await repository.create(mockData);
    
    expect(result).toHaveProperty('id');
    expect(result.name).toBe(mockData.name);
    expect(result.phone).toBe(mockData.phone);
    expect(result.problem).toBe(mockData.problem);
    expect(result.address).toBe(mockData.address);
    expect(result).toHaveProperty('createdAt');
  });

  it('deve listar todos os agendamentos', async () => {
    await repository.create(mockData);
    await repository.create({
      ...mockData,
      name: 'Maria Santos',
      phone: '11988888888'
    });

    const results = await repository.findAll();
    expect(results).toHaveLength(2);
    expect(results[0]).toHaveProperty('name');
    expect(results[1]).toHaveProperty('name');
  });

  it('deve buscar agendamento por ID', async () => {
    const created = await repository.create(mockData);
    const found = await repository.findById(created.id);
    
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
    expect(found?.name).toBe(mockData.name);
  });

  it('deve buscar agendamentos por telefone', async () => {
    await repository.create(mockData);
    await repository.create({
      ...mockData,
      phone: '11988888888'
    });

    const results = await repository.findByPhone('11999999999');
    expect(results).toHaveLength(1);
    expect(results[0].phone).toBe('11999999999');
  });

  it('deve retornar array vazio quando telefone não encontrado', async () => {
    const results = await repository.findByPhone('11111111111');
    expect(results).toHaveLength(0);
  });

  it('deve deletar um agendamento', async () => {
    const created = await repository.create(mockData);
    await repository.delete(created.id);
    
    const found = await repository.findById(created.id);
    expect(found).toBeNull();
  });

  it('deve lançar erro ao deletar ID inexistente', async () => {
    await expect(repository.delete('id-inexistente')).rejects.toThrow();
  });

  // ✅ TESTE PARA O MÉTODO UPDATE
  it('deve atualizar um agendamento', async () => {
    // Primeiro cria um agendamento
    const created = await repository.create(mockData);
    
    // Depois atualiza
    const updated = await repository.update(created.id, { 
      name: 'Novo Nome',
      problem: 'Novo problema'
    });
    
    // Verifica se foi atualizado
    expect(updated.name).toBe('Novo Nome');
    expect(updated.problem).toBe('Novo problema');
    expect(updated.phone).toBe(mockData.phone); // Não mudou
    expect(updated.address).toBe(mockData.address); // Não mudou

    // Busca novamente para confirmar
    const found = await repository.findById(created.id);
    expect(found?.name).toBe('Novo Nome');
    expect(found?.problem).toBe('Novo problema');
  });

  it('deve lançar erro ao atualizar ID inexistente', async () => {
    await expect(repository.update('id-inexistente', { name: 'Teste' })).rejects.toThrow();
  });

  it('deve retornar null ao buscar ID inexistente', async () => {
    const found = await repository.findById('id-inexistente');
    expect(found).toBeNull();
  });

  it('deve ordenar por createdAt decrescente', async () => {
    // Criar agendamentos com delay para ter datas diferentes
    const first = await repository.create(mockData);
    
    // Pequeno delay
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const second = await repository.create({
      ...mockData,
      name: 'Segundo'
    });

    const results = await repository.findAll();
    expect(results[0].name).toBe('Segundo'); // Mais recente primeiro
    expect(results[1].name).toBe('João Silva');
  });
});