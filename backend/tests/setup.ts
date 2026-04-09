import dotenv from 'dotenv';

dotenv.config();

// Mock de la base de datos para tests
jest.mock('../src/config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});
