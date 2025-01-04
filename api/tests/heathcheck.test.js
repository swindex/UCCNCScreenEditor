const request = require('supertest');
const knex = require('../knex_');
const { app, server } = require('../app');
const version = require('../version');

beforeAll(async () => {
  // Initialize the test database
  await knex.migrate.latest();
  await knex.seed.run();
});

afterAll(async () => {
  // Destroy the database connection
  await knex.destroy();
  await server.close();
});

describe('Healthcheck Route', () => {
  it('should return OK for both API and database when roles table exists', async () => {
    const response = await request(app).get('/healthcheck');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      api: 'OK',
      database: 'OK',
      error: null,
      version: version.version
    });
  });

  it('should return FAIL for the database when the roles table is missing', async () => {
    // Drop the roles table to simulate a database issue
    await knex.schema.dropTableIfExists('roles');
    const response = await request(app).get('/healthcheck');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      api: 'OK',
      database: 'FAIL',
      error: "select * from `roles` - SQLITE_ERROR: no such table: roles",
      version: version.version
    });
  });
});
