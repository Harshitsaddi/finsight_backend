// tests/portfolios.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const Portfolio = require('../src/models/Portfolio');
const portfolioRoutes = require('../src/routes/portfolios');

const app = express();
app.use(express.json());
app.use('/api/portfolios', portfolioRoutes);

let token;
let userId;

describe('Portfolio API', () => {
  beforeEach(async () => {
    const user = await User.create({
      email: 'portfolio@example.com',
      passwordHash: 'hash',
      name: 'Portfolio User'
    });
    userId = user._id;
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
  });

  describe('POST /api/portfolios', () => {
    it('should create a new portfolio', async () => {
      const res = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Portfolio',
          currency: 'USD'
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test Portfolio');
      expect(res.body.currency).toBe('USD');
      expect(res.body.ownerId.toString()).toBe(userId.toString());
    });

    it('should reject request without authentication', async () => {
      const res = await request(app)
        .post('/api/portfolios')
        .send({
          name: 'Test Portfolio',
          currency: 'USD'
        });

      expect(res.status).toBe(401);
    });

    it('should use default currency if not provided', async () => {
      const res = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Portfolio'
        });

      expect(res.status).toBe(201);
      expect(res.body.currency).toBe('USD');
    });
  });

  describe('GET /api/portfolios', () => {
    beforeEach(async () => {
      await Portfolio.create([
        { ownerId: userId, name: 'Portfolio 1', currency: 'USD' },
        { ownerId: userId, name: 'Portfolio 2', currency: 'EUR' }
      ]);
    });

    it('should list all user portfolios', async () => {
      const res = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBeDefined();
    });

    it('should only return portfolios owned by user', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        passwordHash: 'hash',
        name: 'Other User'
      });
      await Portfolio.create({
        ownerId: otherUser._id,
        name: 'Other Portfolio',
        currency: 'USD'
      });

      const res = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /api/portfolios/:id', () => {
    let portfolioId;

    beforeEach(async () => {
      const portfolio = await Portfolio.create({
        ownerId: userId,
        name: 'Test Portfolio',
        currency: 'USD'
      });
      portfolioId = portfolio._id;
    });

    it('should get portfolio by id', async () => {
      const res = await request(app)
        .get(`/api/portfolios/${portfolioId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test Portfolio');
    });

    it('should return 404 for non-existent portfolio', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/portfolios/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 403 for portfolio not owned by user', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        passwordHash: 'hash',
        name: 'Other User'
      });
      const otherPortfolio = await Portfolio.create({
        ownerId: otherUser._id,
        name: 'Other Portfolio',
        currency: 'USD'
      });

      const res = await request(app)
        .get(`/api/portfolios/${otherPortfolio._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/portfolios/:id/summary', () => {
    let portfolioId;

    beforeEach(async () => {
      const portfolio = await Portfolio.create({
        ownerId: userId,
        name: 'Test Portfolio',
        currency: 'USD'
      });
      portfolioId = portfolio._id;
    });

    it('should get portfolio summary', async () => {
      const res = await request(app)
        .get(`/api/portfolios/${portfolioId}/summary`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.portfolio).toBeDefined();
      expect(res.body.holdings).toBeDefined();
      expect(res.body.totalValue).toBeDefined();
      expect(res.body.totalCost).toBeDefined();
      expect(res.body.unrealizedPL).toBeDefined();
    });
  });
});