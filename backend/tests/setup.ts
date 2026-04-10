import dotenv from 'dotenv';

dotenv.config();

// ============================================
// MOCK DE PRISMA PARA TESTS
// ============================================

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  property: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  service: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  media: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  lead: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  reservation: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  contracting: {
    findMany: jest.fn(),
  },
  partnerPeriod: {
    findUnique: jest.fn(),
  },
  settings: {
    findFirst: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

jest.mock('../src/config/database', () => ({
  prisma: mockPrisma,
  default: mockPrisma,
}));

// Exportar para uso en tests
export { mockPrisma };

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});