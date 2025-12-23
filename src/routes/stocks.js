// src/routes/stocks.js
const express = require('express');
const Stock = require('../models/Stock');
const router = express.Router();

// Get all stocks with pagination and filtering
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      sector = '',
      sortBy = 'symbol',
      order = 'asc'
    } = req.query;

    const query = { active: true };
    
    // Search by symbol or name
    if (search) {
      query.$or = [
        { symbol: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') }
      ];
    }

    // Filter by sector
    if (sector) {
      query.sector = sector;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    const stocks = await Stock.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Stock.countDocuments(query);

    res.json({
      stocks,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalStocks: total
    });
  } catch (err) {
    next(err);
  }
});

// Get stock by symbol
router.get('/:symbol', async (req, res, next) => {
  try {
    const stock = await Stock.findOne({ 
      symbol: req.params.symbol.toUpperCase(),
      active: true 
    });
    
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json(stock);
  } catch (err) {
    next(err);
  }
});

// Get trending/popular stocks
router.get('/trending/top', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get stocks with highest volume or best performance
    const stocks = await Stock.find({ active: true })
      .sort({ volume: -1 })
      .limit(parseInt(limit));
    
    res.json(stocks);
  } catch (err) {
    next(err);
  }
});

// Get gainers
router.get('/movers/gainers', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const stocks = await Stock.find({ active: true })
      .sort({ currentPrice: -1 })
      .limit(parseInt(limit));
    
    res.json(stocks);
  } catch (err) {
    next(err);
  }
});

// Get losers
router.get('/movers/losers', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const stocks = await Stock.find({ active: true })
      .sort({ currentPrice: 1 })
      .limit(parseInt(limit));
    
    res.json(stocks);
  } catch (err) {
    next(err);
  }
});

// Get all sectors
router.get('/sectors/all', async (req, res, next) => {
  try {
    const sectors = await Stock.distinct('sector', { active: true });
    res.json(sectors.filter(s => s));
  } catch (err) {
    next(err);
  }
});

module.exports = router;