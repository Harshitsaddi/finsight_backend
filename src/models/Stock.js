// src/models/Stock.js
const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  sector: { type: String },
  industry: { type: String },
  description: { type: String },
  currentPrice: { type: Number, required: true },
  previousClose: { type: Number },
  dayHigh: { type: Number },
  dayLow: { type: Number },
  volume: { type: Number },
  marketCap: { type: Number },
  peRatio: { type: Number },
  dividendYield: { type: Number },
  fiftyTwoWeekHigh: { type: Number },
  fiftyTwoWeekLow: { type: Number },
  lastUpdated: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

// Index for faster searches
StockSchema.index({ symbol: 1 });
StockSchema.index({ name: 'text', symbol: 'text' });
StockSchema.index({ sector: 1 });

module.exports = mongoose.model('Stock', StockSchema);