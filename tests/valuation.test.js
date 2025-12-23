// tests/valuation.test.js
const Portfolio = require('../src/models/Portfolio');
const Transaction = require('../src/models/Transaction');
const MarketPrice = require('../src/models/MarketPrice');
const User = require('../src/models/User');
const { computePortfolioSummary } = require('../src/controllers/valuation');

describe('Portfolio Valuation', () => {
  let userId;
  let portfolioId;

  beforeEach(async () => {
    const user = await User.create({
      email: 'valuation@example.com',
      passwordHash: 'hash',
      name: 'Valuation User'
    });
    userId = user._id;

    const portfolio = await Portfolio.create({
      ownerId: userId,
      name: 'Test Portfolio',
      currency: 'USD'
    });
    portfolioId = portfolio._id;
  });

  it('should calculate correct portfolio value with single buy', async () => {
    await Transaction.create({
      portfolioId,
      symbol: 'AAPL',
      qty: 10,
      price: 100,
      type: 'BUY'
    });

    await MarketPrice.create({
      symbol: 'AAPL',
      price: 150
    });

    const summary = await computePortfolioSummary(portfolioId);

    expect(summary.holdings).toHaveLength(1);
    expect(summary.holdings[0].symbol).toBe('AAPL');
    expect(summary.holdings[0].quantity).toBe(10);
    expect(summary.holdings[0].avgCost).toBe(100);
    expect(summary.holdings[0].marketValue).toBe(1500);
    expect(summary.totalValue).toBe(1500);
    expect(summary.totalCost).toBe(1000);
    expect(summary.unrealizedPL).toBe(500);
  });

  it('should handle multiple buys of same symbol', async () => {
    await Transaction.create([
      {
        portfolioId,
        symbol: 'AAPL',
        qty: 10,
        price: 100,
        type: 'BUY'
      },
      {
        portfolioId,
        symbol: 'AAPL',
        qty: 5,
        price: 120,
        type: 'BUY'
      }
    ]);

    await MarketPrice.create({
      symbol: 'AAPL',
      price: 150
    });

    const summary = await computePortfolioSummary(portfolioId);

    expect(summary.holdings[0].quantity).toBe(15);
    expect(summary.holdings[0].avgCost).toBeCloseTo(106.67, 2);
    expect(summary.totalCost).toBe(1600);
    expect(summary.totalValue).toBe(2250);
    expect(summary.unrealizedPL).toBe(650);
  });

  it('should handle buy and sell transactions', async () => {
    await Transaction.create([
      {
        portfolioId,
        symbol: 'AAPL',
        qty: 10,
        price: 100,
        type: 'BUY'
      },
      {
        portfolioId,
        symbol: 'AAPL',
        qty: 3,
        price: 150,
        type: 'SELL'
      }
    ]);

    await MarketPrice.create({
      symbol: 'AAPL',
      price: 140
    });

    const summary = await computePortfolioSummary(portfolioId);

    expect(summary.holdings[0].quantity).toBe(7);
    expect(summary.holdings[0].realized).toBe(450);
  });

  it('should handle multiple symbols', async () => {
    await Transaction.create([
      {
        portfolioId,
        symbol: 'AAPL',
        qty: 10,
        price: 100,
        type: 'BUY'
      },
      {
        portfolioId,
        symbol: 'GOOGL',
        qty: 5,
        price: 2000,
        type: 'BUY'
      }
    ]);

    await MarketPrice.create([
      { symbol: 'AAPL', price: 150 },
      { symbol: 'GOOGL', price: 2200 }
    ]);

    const summary = await computePortfolioSummary(portfolioId);

    expect(summary.holdings).toHaveLength(2);
    expect(summary.totalCost).toBe(11000);
    expect(summary.totalValue).toBe(12500);
    expect(summary.unrealizedPL).toBe(1500);
  });

  it('should return zero values for empty portfolio', async () => {
    const summary = await computePortfolioSummary(portfolioId);

    expect(summary.holdings).toHaveLength(0);
    expect(summary.totalValue).toBe(0);
    expect(summary.totalCost).toBe(0);
    expect(summary.unrealizedPL).toBe(0);
  });

  it('should handle missing market price', async () => {
    await Transaction.create({
      portfolioId,
      symbol: 'AAPL',
      qty: 10,
      price: 100,
      type: 'BUY'
    });

    const summary = await computePortfolioSummary(portfolioId);

    expect(summary.holdings[0].marketPrice).toBe(0);
    expect(summary.holdings[0].marketValue).toBe(0);
  });
});