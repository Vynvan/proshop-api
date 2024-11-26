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
   
   jest.unstable_mockModule('../middlewares/authenticate', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation((req, res, next) => next())
   }));

   getConnection = (await import('../db.js')).default;
   app = (await import('../index.js')).default;
});

describe('Product Routes', () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   describe('GET /products', () => {
      it('should return a paginated list of active products', async () => {
         const mockProducts = [
            { id: 1, title: 'Product 1', text: 'Description of product 1', price: 10.99, image: 'image1.jpg' },
            { id: 2, title: 'Product 2', text: 'Description of product 2', price: 15.99, image: 'image2.jpg' }
         ];

         getConnection.mockImplementation(() => ({
            query: jest.fn().mockResolvedValueOnce(mockProducts)
            .mockResolvedValueOnce([{ totalCount: 2 }]),
            release: jest.fn()
         }));

         const response = await request(app).get('/products?page=1&limit=2');

         expect(response.status).toBe(200);
         expect(response.body.products).toEqual(mockProducts);
         expect(response.body.total).toBe(2);
         expect(response.body.page).toBe(1);
         expect(response.body.limit).toBe(2);
      });

      it('should return an empty array if there are no active products', async () => {
         getConnection.mockImplementation(() => ({
            query: jest.fn().mockResolvedValueOnce([])
            .mockResolvedValueOnce([{ totalCount: 0 }]),
            release: jest.fn()
         }));

         const response = await request(app).get('/products?page=1&limit=2');

         expect(response.status).toBe(200);
         expect(response.body.products).toEqual([]);
         expect(response.body.total).toBe(0);
      });

      it('should return a 500 error if there is a database error', async () => {
         getConnection.mockImplementation(() => ({
            query: jest.fn().mockResolvedValueOnce(() => { throw new Error('Database error') }),
            release: jest.fn()
         }));

         const response = await request(app).get('/products?page=1&limit=2');

         expect(response.status).toBe(500);
         expect(response.body.message).toBe('Fehler beim Zugriff auf die Datenbank.');
      });
   });

   describe('GET /products/:id', () => {
      it('should return the details of a specific active product', async () => {
         const mockProduct = { id: 1, title: 'Product 1', text: 'Full description of product 1', price: 10.99, image: 'image1.jpg' };

         getConnection.mockImplementation(() => ({
            query: jest.fn().mockResolvedValueOnce([mockProduct]),
            release: jest.fn()
         }));

         const response = await request(app).get('/products/1');

         expect(response.status).toBe(200);
         expect(response.body.product).toEqual(mockProduct);
      });

      it('should return the full description if update=true', async () => {
         const mockProduct = { id: 1, text: 'Full description of product 1' };

         getConnection.mockImplementation(() => ({
            query: jest.fn().mockResolvedValueOnce([mockProduct]),
            release: jest.fn()
         }));

         const response = await request(app).get('/products/1?update=true');

         expect(response.status).toBe(200);
         expect(response.body.product).toEqual(mockProduct);
      });

      it('should return a 500 error if there is a database error', async () => {
         getConnection.mockImplementation(() => ({
            query: jest.fn().mockResolvedValueOnce(() => { throw new Error('Database error') }),
            release: jest.fn()
         }));

         const response = await request(app).get('/products/1');

         expect(response.status).toBe(500);
         expect(response.body.message).toBe('Fehler beim Zugriff auf die Datenbank.');
      });
   });
});
