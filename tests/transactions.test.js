// tests/transactions.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const Portfolio = require('../src/models/Portfolio');
const Transaction = require('../src/models/Transaction');
const transactionRoutes = require('../src/routes/transactions');

const app = express();
app.use(express.json());
app.use('/api/transactions', transactionRoutes);

let token;
let userId;
let portfolioId;

describe('Transaction API', () => {
  beforeEach(async () => {
    const user = await User.create({
      email: 'transaction@example.com',
      passwordHash: 'hash',
      name: 'Transaction User'
    });
    userId = user._id;
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');

    const portfolio = await Portfolio.create({
      ownerId: userId,
      name: 'Test Portfolio',
      currency: 'USD'
    });
    portfolioId = portfolio._id;
  });

  describe('POST /api/transactions/:portfolioId', () => {
    it('should create a buy transaction', async () => {
      const res = await request(app)
        .post(`/api/transactions/${portfolioId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          symbol: 'AAPL',
          qty: 10,
          price: 150.50,
          type: 'BUY'
        });

      expect(res.status).toBe(201);
      expect(res.body.symbol).toBe('AAPL');
      expect(res.body.qty).toBe(10);
      expect(res.body.price).toBe(150.50);
      expect(res.body.type).toBe('BUY');
    });

    it('should create a sell transaction', async () => {
      const res = await request(app)
        .post(`/api/transactions/${portfolioId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          symbol: 'GOOGL',
          qty: 5,
          price: 2800.00,
          type: 'SELL'
        });

      expect(res.status).toBe(201);
      expect(res.body.type).toBe('SELL');
    });

    it('should convert symbol to uppercase', async () => {
      const res = await request(app)
        .post(`/api/transactions/${portfolioId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          symbol: 'tsla',
          qty: 2,
          price: 700.00,
          type: 'BUY'
        });

      expect(res.status).toBe(201);
      expect(res.body.symbol).toBe('TSLA');
    });

    it('should reject transaction for non-existent portfolio', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .post(`/api/transactions/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          symbol: 'AAPL',
          qty: 10,
          price: 150.50,
          type: 'BUY'
        });

      expect(res.status).toBe(404);
    });

    it('should reject transaction for portfolio not owned by user', async () => {
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
        .post(`/api/transactions/${otherPortfolio._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          symbol: 'AAPL',
          qty: 10,
          price: 150.50,
          type: 'BUY'
        });

      expect(res.status).toBe(403);
    });

    it('should reject transaction without authentication', async () => {
      const res = await request(app)
        .post(`/api/transactions/${portfolioId}`)
        .send({
          symbol: 'AAPL',
          qty: 10,
          price: 150.50,
          type: 'BUY'
        });

      expect(res.status).toBe(401);
    });
  });
});