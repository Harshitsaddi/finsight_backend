// src/utils/setupStocks.js
/**
 * Setup script to initialize stock data and start price updates
 * Run as: node src/utils/setupStocks.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const StockPriceService = require('../services/stockPriceService');

async function setup() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/finsight';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    
    // Seed stock data
    console.log('📊 Seeding stock data...');
    await StockPriceService.seedStockData();
    console.log('✅ Stock data seeded successfully');
    
    // Update prices once
    console.log('💰 Updating initial prices...');
    await StockPriceService.updateStockPrices();
    console.log('✅ Initial prices updated');
    
    console.log('\n✅ Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Start the main server: npm start');
    console.log('2. Start the price updater: npm run worker');
    console.log('3. Visit http://localhost:3000/stocks/market to view the stock market');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setup();