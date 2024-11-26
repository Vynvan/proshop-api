import bcrypt from 'bcrypt';
import { jest } from '@jest/globals'
import request from 'supertest';

let getConnection, app;

beforeAll(async () => {
   jest.unstable_mockModule('../db', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(() => ({
         query: jest.fn().mockResolvedValue([]),
         release: jest.fn()
      }))
   }));
   
   getConnection = (await import('../db.js')).default;
   app = (await import('../index.js')).default;
});

describe('User Routes', () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   describe('POST /users', () => {
      it('should log in a user with valid credentials', async () => {
         const username = 'testuser';
         const password = 'Test@1234';
         const hashedPassword = 'hashedPassword';

         getConnection.mockImplementation(() => ({
            query: jest.fn().mockResolvedValueOnce([{ id: 1, password_hash: hashedPassword }]),
            release: jest.fn()
         }));
         jest.spyOn(bcrypt, 'compare').mockImplementation(() => (true));

         const res = await request(app).post('/users').send({ username, password });

         expect(res.statusCode).toEqual(201);
         expect(res.body).toHaveProperty('userId', 1);
         expect(res.body).toHaveProperty('token');
      });

      it('should return 403 for invalid password', async () => {
         const username = 'testuser';
         const password = 'Test@1234';
         const hashedPassword = 'hashedPassword';

         getConnection.mockImplementation(() => ({
            query: jest.fn().mockResolvedValueOnce([{ id: 1, password_hash: hashedPassword }]),
            release: jest.fn()
         }));
         jest.spyOn(bcrypt, 'compare').mockImplementation(() => (false));

         const res = await request(app).post('/users').send({ username, password });

         expect(res.statusCode).toEqual(403);
         expect(res.body.message).toBe('Benutzername oder Passwort falsch.');
      });

      it('should return 404 for non-existing user', async () => {
         const username = 'nonexistinguser';
         const password = 'password';

         getConnection.mockImplementation(() => ({
            query: jest.fn().mockResolvedValueOnce([]),
            release: jest.fn()
         }));

         const res = await request(app).post('/users').send({ username, password });

         expect(res.statusCode).toEqual(404);
         expect(res.body.message).toBe('Benutzername oder Passwort falsch.');
      });
   });

   describe('POST /users/logout', () => {
      it('should log out a user', async () => {
         const res = await request(app).post('/users/logout');
         expect(res.statusCode).toEqual(204);
      });
   });

   describe('POST /users/register', () => {
      it('should register a new user', async () => {
         const newUser = {
            email: 'test@example.com',
            name: 'Test User',
            username: 'newuser',
            password: 'Test@1234'
         };

         getConnection.mockImplementation(() => ({
            query: jest.fn().mockResolvedValueOnce([{ emailCount: 0 }])
            .mockResolvedValueOnce([{ usernameCount: 0 }])
            .mockResolvedValueOnce({ insertId: 1 }),
            release: jest.fn()
         }));
         jest.spyOn(bcrypt, 'hash').mockImplementation(() => ('hashedPassword'));

         const res = await request(app)
            .post('/users/register')
            .send(newUser);

         expect(res.statusCode).toEqual(201);
         expect(res.body).toHaveProperty('userId', 1);
         expect(res.body).toHaveProperty('token');
      });

      it('should return 403 if email is already taken', async () => {
         const existingUser = {
            email: 'test@example.com',
            name: 'Test User',
            username: 'newuser',
            password: 'Test@1234'
         };

         getConnection.mockImplementation(() => ({
            query: jest.fn().mockResolvedValueOnce([{ emailCount: 1 }]),
            release: jest.fn()
         }));

         const res = await request(app)
            .post('/users/register')
            .send(existingUser);

         expect(res.statusCode).toEqual(403);
         expect(res.body.message).toBe('Ein Benutzerkonto mit dieser E-Mail-Adresse existiert bereits!');
      });
   });
});
