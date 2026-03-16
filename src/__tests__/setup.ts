import { prisma } from '../shared/database/prisma';

beforeEach(async () => {
  // Limpa a tabela antes de cada teste
  await prisma.appointment.deleteMany({});
});

afterAll(async () => {
  // Fecha conexão com banco após todos os testes
  await prisma.$disconnect();
});