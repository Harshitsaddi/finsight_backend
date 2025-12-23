// src/routes/stocksDemo.js
const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');

// Middleware to check login
function requireLogin(req, res, next) {
    if (!req.session.userId) return res.redirect('/demo/login');
    next();
}

// Stock market browse page
router.get('/market', requireLogin, async (req, res) => {
    try {
        const { search = '', sector = '', page = 1 } = req.query;
        const limit = 20;
        
        const query = { active: true };
        
        if (search) {
            query.$or = [
                { symbol: new RegExp(search, 'i') },
                { name: new RegExp(search, 'i') }
            ];
        }
        
        if (sector) {
            query.sector = sector;
        }
        
        const stocks = await Stock.find(query)
            .sort({ symbol: 1 })
            .limit(limit)
            .skip((page - 1) * limit);
        
        const total = await Stock.countDocuments(query);
        const sectors = await Stock.distinct('sector', { active: true });
        const portfolios = await Portfolio.find({ ownerId: req.session.userId });
        
        // Get trending stocks
        const trending = await Stock.find({ active: true })
            .sort({ volume: -1 })
            .limit(5);
        
        res.render('stocks/market', {
            stocks,
            trending,
            sectors: sectors.filter(s => s),
            portfolios,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            search,
            sector
        });
    } catch (err) {
        console.error('Market page error:', err);
        res.status(500).render('error', { message: 'Error loading market data' });
    }
});

// Stock detail page
router.get('/stock/:symbol', requireLogin, async (req, res) => {
    try {
        const stock = await Stock.findOne({ 
            symbol: req.params.symbol.toUpperCase(),
            active: true 
        });
        
        if (!stock) {
            return res.status(404).render('error', { message: 'Stock not found' });
        }
        
        const portfolios = await Portfolio.find({ ownerId: req.session.userId });
        
        res.render('stocks/detail', {
            stock,
            portfolios
        });
    } catch (err) {
        console.error('Stock detail error:', err);
        res.status(500).render('error', { message: 'Error loading stock details' });
    }
});

// Quick trade from market page
router.post('/trade', requireLogin, async (req, res) => {
    try {
        const { portfolioId, symbol, qty, type } = req.body;
        
        const portfolio = await Portfolio.findById(portfolioId);
        if (!portfolio || String(portfolio.ownerId) !== String(req.session.userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        
        const transaction = new Transaction({
            portfolioId,
            symbol: symbol.toUpperCase(),
            qty: parseFloat(qty),
            price: stock.currentPrice,
            type: type.toUpperCase()
        });
        
        await transaction.save();
        
        res.json({ 
            success: true, 
            transaction,
            message: `Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${qty} shares of ${symbol}`
        });
    } catch (err) {
        console.error('Trade error:', err);
        res.status(500).json({ error: 'Trade failed' });
    }
});

module.exports = router;