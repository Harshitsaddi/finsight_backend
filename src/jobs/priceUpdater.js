// src/jobs/priceUpdater.js (UPDATED)
require('dotenv').config();
const cron = require('node-cron');
const StockPriceService = require('../services/stockPriceService');
const Alert = require('../models/Alert');
const MarketPrice = require('../models/MarketPrice');

async function checkAlerts() {
  const alerts = await Alert.find({ triggered: false });
  for (const a of alerts) {
    const mp = await MarketPrice.findOne({ symbol: a.symbol });
    if (!mp) continue;
    if (a.condition === 'GT' && mp.price > a.price) {
      a.triggered = true;
      await a.save();
      console.log('Alert triggered for', a.symbol, a.price);
    } else if (a.condition === 'LT' && mp.price < a.price) {
      a.triggered = true;
      await a.save();
      console.log('Alert triggered for', a.symbol, a.price);
    }
  }
}

async function runOnce() {
  console.log('Updating stock prices...');
  await StockPriceService.updateStockPrices();
  await checkAlerts();
  console.log('Price update complete');
}

async function start() {
  // Run every 30 seconds for more realistic updates
  const cronExp = process.env.PRICE_UPDATE_CRON || '*/30 * * * * *';
  console.log('Starting price updater with cron:', cronExp);
  
  // Run once immediately
  await runOnce();
  
  cron.schedule(cronExp, async () => {
    try {
      await runOnce();
    } catch (err) {
      console.error('Price updater error', err);
    }
  });
}

// run directly if executed
if (require.main === module) {
  const mongoose = require('mongoose');
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/finsight';
  mongoose.connect(uri).then(async () => {
    console.log('Price updater connected to DB');
    
    // Seed stock data if needed
    await StockPriceService.seedStockData();
    
    // Start the updater
    await start();
  }).catch(err => {
    console.error('Price updater DB connect failed', err);
  });
}

module.exports = { start, runOnce };