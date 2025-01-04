const request = require('supertest');
const knex = require('../knex_');
const { app, server } = require('../app');

// Dummy user data for tests
const newUser = {
  username: 'newuser',
  password: 'password123',
  first_name: 'New',
  last_name: 'User',
  role_id: 2, // Assuming 2 is a valid role_id
};

let createdUserId;

beforeAll(async () => {
  // Initialize the test database and run migrations and seeds
  await knex.migrate.latest();
  await knex.seed.run();

    // Get a JWT token for authorization
  const loginRes = await request(app)
    .post('/api/login')
    .send({ username: 'admin', password: process.env.DEFAULT_ADMIN_PASS }); // Use valid admin credentials
  token = loginRes.body.token;


  // Create a user for testing PUT and DELETE
  const res = await request(app)
    .post('/admin/users')
    .set('Authorization', `Bearer ${token}`)
    .send(newUser);

  createdUserId = res.body.id;  // Store the created user's ID for further tests. Since 2 users are already seeded, this will be #3

});

afterAll(async () => {
  // Clean up and close the server and database connection
  await knex.destroy();
  server.close();
});

describe('User Routes', () => {
  describe('GET /users', () => {
    it('should return all users', async () => {
      const res = await request(app).get('/admin/users').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      const res = await request(app).get(`/admin/users/${createdUserId}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.username).toBe(newUser.username);
    });

    it('should return 404 if user not found', async () => {
      const res = await request(app).get('/admin/users/9999').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
        const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'uniqueuser',
          password: 'password123',
          first_name: 'Unique',
          last_name: 'User',
          role_id: 2,
        });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('User created successfully');

        let id = res.body.id;

        const getRes = await request(app)
            .get(`/admin/users/${id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getRes.status).toBe(200);
        const createdUser = getRes.body;
        expect(createdUser).toBeDefined();
        expect(createdUser.username).toBe('uniqueuser');
        expect(createdUser.first_name).toBe('Unique');
        expect(createdUser.last_name).toBe('User');
        expect(createdUser.role_id).toBe(2);
    });
    

    it('should return 405 if user already exists', async () => {
      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser); // Sending the same user again

      expect(res.status).toBe(405);
      expect(res.body.message).toBe('User already exists');
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'short',
          password: '123',
          first_name: 'A',
          last_name: 'B',
          role_id: 2,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      const res = await request(app)
        .put(`/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ first_name: 'UpdatedName' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User updated successfully');
    });

    it('should return 404 if user to update not found', async () => {
      const res = await request(app)
        .put('/admin/users/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ first_name: 'NonExistentUser' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should return 405 if trying to update admin user', async () => {
      const res = await request(app)
        .put('/admin/users/1') // Assuming user with ID 1 is admin
        .set('Authorization', `Bearer ${token}`)
        .send({ first_name: 'AdminUpdate' });

      expect(res.status).toBe(405);
      expect(res.body.message).toBe("Can't update the Admin");
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const res = await request(app).delete(`/admin/users/${createdUserId}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User deleted successfully');
    });

    it('should return 404 if user to delete not found', async () => {
      const res = await request(app).delete('/admin/users/9999').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should return 405 if trying to delete admin user', async () => {
      const res = await request(app).delete('/admin/users/1').set('Authorization', `Bearer ${token}`); // Assuming ID 1 is admin
      expect(res.status).toBe(405);
      expect(res.body.message).toBe("Can't delete the Admin");
    });
  });
});
