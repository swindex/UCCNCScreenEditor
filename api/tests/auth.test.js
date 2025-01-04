const request = require('supertest');
const knex = require('../knex_');
const { app, server } = require('../app');

// Dummy user data for tests
const user = {
  username: 'testuser',
  password: 'password123',
  first_name: 'Test',
  last_name: 'User',
};

let token;

beforeAll(async () => {
  await knex.migrate.latest();
  await knex.seed.run();

  // Register a user
  await request(app)
    .post('/api/register')
    .send(user);
});

afterAll(async () => {
  // Clean up and close the server and database connection
  await knex.destroy();
  server.close();
});

describe('Auth Routes', () => {
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          username: 'newuser',
          password: 'newpassword123',
          first_name: 'New',
          last_name: 'User',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          username: 'incompleteuser',
          password: 'short',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /login', () => {
    it('should return a token for valid login', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          username: user.username,
          password: user.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      token = res.body.token;  // Store token for the next test
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          username: user.username,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /check_token', () => {
    it('should return user info when valid token is provided', async () => {
      const res = await request(app)
        .get('/api/check_token')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token', token);
      expect(res.body).toHaveProperty('username', user.username);
    });

    it('should return 401 for missing or invalid token', async () => {
      const res = await request(app).get('/api/check_token');
      expect(res.status).toBe(401);
    });
  });
});
