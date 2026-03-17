import { prisma } from '../shared/database/prisma';
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

beforeAll(async () => {
  // Conecta ao banco antes de todos os testes
  await prisma.$connect();
});

beforeEach(async () => {
  // Limpa a tabela antes de CADA teste
  await prisma.appointment.deleteMany({});
});

afterEach(async () => {
  // Limpa depois de cada teste também (redundância segura)
  await prisma.appointment.deleteMany({});
});

afterAll(async () => {
  // Fecha conexão após todos os testes
  await prisma.$disconnect();
});