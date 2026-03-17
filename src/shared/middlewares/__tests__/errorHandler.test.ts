import request from 'supertest';
import express from 'express';
import { errorHandler } from '../errorHandler';

const app = express();
app.use(express.json());

// Rota que gera erro 404
app.get('/test-404', (req, res, next) => {
  const error: any = new Error('Página não encontrada');
  error.status = 404;
  next(error);
});

// Rota que gera erro 400
app.get('/test-400', (req, res, next) => {
  const error: any = new Error('Requisição inválida');
  error.status = 400;
  next(error);
});

// Rota que gera erro 401
app.get('/test-401', (req, res, next) => {
  const error: any = new Error('Não autorizado');
  error.status = 401;
  next(error);
});

// Rota que gera erro 403
app.get('/test-403', (req, res, next) => {
  const error: any = new Error('Acesso proibido');
  error.status = 403;
  next(error);
});

// Rota que gera erro 500
app.get('/test-500', (req, res, next) => {
  const error: any = new Error('Erro interno');
  error.status = 500;
  next(error);
});

// Rota que gera erro genérico (sem status)
app.get('/test-generic', (req, res, next) => {
  next(new Error('Erro genérico'));
});

// Middleware de erro
app.use(errorHandler);

describe('Error Handler Middleware', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('Status codes personalizados', () => {
    it('deve retornar 404', async () => {
      const response = await request(app).get('/test-404');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Página não encontrada');
    });

    it('deve retornar 400', async () => {
      const response = await request(app).get('/test-400');
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Requisição inválida');
    });

    it('deve retornar 401', async () => {
      const response = await request(app).get('/test-401');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Não autorizado');
    });

    it('deve retornar 403', async () => {
      const response = await request(app).get('/test-403');
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso proibido');
    });

    it('deve retornar 500', async () => {
      const response = await request(app).get('/test-500');
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Erro interno');
    });
  });

  describe('Erros genéricos', () => {
    it('deve retornar 500 para erros sem status', async () => {
      const response = await request(app).get('/test-generic');
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Erro interno do servidor');
    });

    it('sempre deve incluir success: false', async () => {
      const response = await request(app).get('/test-generic');
      expect(response.body.success).toBe(false);
    });
  });

  describe('Ambientes', () => {
    it('deve incluir detalhes em desenvolvimento', async () => {
      process.env.NODE_ENV = 'development';
      
      const response = await request(app).get('/test-generic');
      
      expect(response.body).toHaveProperty('details');
      expect(response.body).toHaveProperty('stack');
    });

    it('não deve incluir detalhes em produção', async () => {
      process.env.NODE_ENV = 'production';
      
      const response = await request(app).get('/test-generic');
      
      expect(response.body).not.toHaveProperty('details');
      expect(response.body).not.toHaveProperty('stack');
    });
  });
});