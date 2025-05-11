import request from 'supertest';
import app from '../app.js';
import Menu from '../models/Menu.js';
import { generateToken } from '../utils/testHelpers.js';

describe('Menu API', () => {
  let adminToken;
  
  beforeEach(() => {
    adminToken = generateToken({ userId: '123456789012', role: 'admin' });
  });
  
  describe('GET /api/menu', () => {
    it('should return all menu items', async () => {
      // Create test menu items
      await Menu.create([
        {
          name: 'Test Item 1',
          description: 'Test Description 1',
          price: 9.99,
          category: 'appetizers',
          isAvailable: true
        },
        {
          name: 'Test Item 2',
          description: 'Test Description 2',
          price: 14.99,
          category: 'maincourse',
          isAvailable: true
        }
      ]);
      
      const res = await request(app).get('/api/menu');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(2);
      expect(res.body[0]).toHaveProperty('name', 'Test Item 1');
      expect(res.body[1]).toHaveProperty('name', 'Test Item 2');
    });
  });
  
  describe('POST /api/menu', () => {
    it('should create a new menu item when admin is authenticated', async () => {
      const menuData = {
        name: 'New Menu Item',
        description: 'Delicious new item',
        price: 12.99,
        category: 'desserts',
        isAvailable: true
      };
      
      const res = await request(app)
        .post('/api/menu')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(menuData);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('name', menuData.name);
      
      // Verify it was saved to the database
      const savedMenu = await Menu.findById(res.body._id);
      expect(savedMenu).toBeTruthy();
      expect(savedMenu.name).toEqual(menuData.name);
    });
    
    it('should return 401 if no token provided', async () => {
      const res = await request(app)
        .post('/api/menu')
        .send({
          name: 'Unauthorized Item',
          description: 'Should not be created',
          price: 9.99,
          category: 'appetizers'
        });
      
      expect(res.statusCode).toEqual(401);
    });
  });
});
