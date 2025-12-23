// src/services/stockPriceService.js
const Stock = require('../models/Stock');
const MarketPrice = require('../models/MarketPrice');

// Simulate real-time price updates (replace with actual API in production)
class StockPriceService {
  // Update stock prices with realistic fluctuations
  static async updateStockPrices() {
    try {
      const stocks = await Stock.find({ active: true });
      
      for (const stock of stocks) {
        // Simulate price change (-2% to +2%)
        const changePercent = (Math.random() - 0.5) * 0.04;
        const newPrice = stock.currentPrice * (1 + changePercent);
        
        // Update day high/low
        const dayHigh = Math.max(stock.dayHigh || newPrice, newPrice);
        const dayLow = Math.min(stock.dayLow || newPrice, newPrice);
        
        // Random volume between 1M and 100M
        const volume = Math.floor(Math.random() * 99000000) + 1000000;
        
        await Stock.findByIdAndUpdate(stock._id, {
          currentPrice: parseFloat(newPrice.toFixed(2)),
          dayHigh: parseFloat(dayHigh.toFixed(2)),
          dayLow: parseFloat(dayLow.toFixed(2)),
          volume,
          lastUpdated: new Date()
        });
        
        // Also update MarketPrice for portfolio calculations
        await MarketPrice.findOneAndUpdate(
          { symbol: stock.symbol },
          { 
            price: parseFloat(newPrice.toFixed(2)),
            timestamp: new Date()
          },
          { upsert: true }
        );
      }
      
      console.log(`Updated prices for ${stocks.length} stocks`);
    } catch (error) {
      console.error('Error updating stock prices:', error);
    }
  }

  // Seed initial stock data
  static async seedStockData() {
    try {
      const count = await Stock.countDocuments();
      if (count > 0) {
        console.log('Stock data already exists');
        return;
      }

      const stockData = [
        // Technology
        { 
          symbol: 'AAPL', 
          name: 'Apple Inc.', 
          sector: 'Technology', 
          industry: 'Consumer Electronics',
          description: 'Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
          currentPrice: 178.50,
          previousClose: 177.25,
          dayHigh: 180.00,
          dayLow: 176.50,
          volume: 65000000,
          marketCap: 2800000000000,
          peRatio: 29.5,
          dividendYield: 0.52,
          fiftyTwoWeekHigh: 198.23,
          fiftyTwoWeekLow: 164.08
        },
        { 
          symbol: 'MSFT', 
          name: 'Microsoft Corporation', 
          sector: 'Technology', 
          industry: 'Software',
          description: 'Develops, licenses, and supports software, services, devices, and solutions worldwide.',
          currentPrice: 378.25,
          previousClose: 375.50,
          dayHigh: 380.00,
          dayLow: 374.00,
          volume: 28000000,
          marketCap: 2810000000000,
          peRatio: 34.2,
          dividendYield: 0.78,
          fiftyTwoWeekHigh: 384.30,
          fiftyTwoWeekLow: 309.45
        },
        { 
          symbol: 'GOOGL', 
          name: 'Alphabet Inc.', 
          sector: 'Technology', 
          industry: 'Internet Services',
          description: 'Provides various products and platforms including search, advertising, cloud computing, and hardware.',
          currentPrice: 141.80,
          previousClose: 140.25,
          dayHigh: 143.50,
          dayLow: 139.80,
          volume: 32000000,
          marketCap: 1780000000000,
          peRatio: 26.8,
          dividendYield: 0,
          fiftyTwoWeekHigh: 152.05,
          fiftyTwoWeekLow: 120.21
        },
        { 
          symbol: 'AMZN', 
          name: 'Amazon.com Inc.', 
          sector: 'Consumer Cyclical', 
          industry: 'Internet Retail',
          description: 'Engages in e-commerce, cloud computing, digital streaming, and artificial intelligence.',
          currentPrice: 178.35,
          previousClose: 176.90,
          dayHigh: 180.25,
          dayLow: 175.50,
          volume: 45000000,
          marketCap: 1850000000000,
          peRatio: 68.5,
          dividendYield: 0,
          fiftyTwoWeekHigh: 188.65,
          fiftyTwoWeekLow: 118.35
        },
        { 
          symbol: 'META', 
          name: 'Meta Platforms Inc.', 
          sector: 'Technology', 
          industry: 'Social Media',
          description: 'Builds technologies that help people connect through mobile devices, personal computers, and other surfaces.',
          currentPrice: 484.20,
          previousClose: 481.50,
          dayHigh: 488.00,
          dayLow: 479.30,
          volume: 18000000,
          marketCap: 1230000000000,
          peRatio: 28.9,
          dividendYield: 0,
          fiftyTwoWeekHigh: 542.81,
          fiftyTwoWeekLow: 279.44
        },
        { 
          symbol: 'TSLA', 
          name: 'Tesla Inc.', 
          sector: 'Consumer Cyclical', 
          industry: 'Auto Manufacturers',
          description: 'Designs, develops, manufactures, and sells fully electric vehicles and energy generation and storage systems.',
          currentPrice: 242.80,
          previousClose: 238.45,
          dayHigh: 245.60,
          dayLow: 237.20,
          volume: 98000000,
          marketCap: 772000000000,
          peRatio: 76.4,
          dividendYield: 0,
          fiftyTwoWeekHigh: 299.29,
          fiftyTwoWeekLow: 152.37
        },
        { 
          symbol: 'NVDA', 
          name: 'NVIDIA Corporation', 
          sector: 'Technology', 
          industry: 'Semiconductors',
          description: 'Provides graphics, computing, and networking solutions including GPUs and chips for AI.',
          currentPrice: 878.25,
          previousClose: 865.40,
          dayHigh: 885.00,
          dayLow: 862.30,
          volume: 42000000,
          marketCap: 2170000000000,
          peRatio: 71.3,
          dividendYield: 0.03,
          fiftyTwoWeekHigh: 974.00,
          fiftyTwoWeekLow: 394.00
        },
        
        // Finance
        { 
          symbol: 'JPM', 
          name: 'JPMorgan Chase & Co.', 
          sector: 'Financial Services', 
          industry: 'Banking',
          description: 'Financial holding company that provides various financial services worldwide.',
          currentPrice: 198.45,
          previousClose: 196.80,
          dayHigh: 200.20,
          dayLow: 195.50,
          volume: 12000000,
          marketCap: 576000000000,
          peRatio: 11.2,
          dividendYield: 2.24,
          fiftyTwoWeekHigh: 208.96,
          fiftyTwoWeekLow: 135.19
        },
        { 
          symbol: 'BAC', 
          name: 'Bank of America Corp.', 
          sector: 'Financial Services', 
          industry: 'Banking',
          description: 'Provides banking and financial products and services for individual consumers, businesses, and institutions.',
          currentPrice: 40.85,
          previousClose: 40.45,
          dayHigh: 41.20,
          dayLow: 40.30,
          volume: 38000000,
          marketCap: 314000000000,
          peRatio: 12.8,
          dividendYield: 2.64,
          fiftyTwoWeekHigh: 42.75,
          fiftyTwoWeekLow: 26.92
        },
        { 
          symbol: 'V', 
          name: 'Visa Inc.', 
          sector: 'Financial Services', 
          industry: 'Credit Services',
          description: 'Operates retail electronic payments network worldwide.',
          currentPrice: 282.60,
          previousClose: 280.15,
          dayHigh: 284.50,
          dayLow: 279.20,
          volume: 6500000,
          marketCap: 568000000000,
          peRatio: 32.1,
          dividendYield: 0.74,
          fiftyTwoWeekHigh: 290.96,
          fiftyTwoWeekLow: 227.83
        },
        
        // Healthcare
        { 
          symbol: 'JNJ', 
          name: 'Johnson & Johnson', 
          sector: 'Healthcare', 
          industry: 'Drug Manufacturers',
          description: 'Researches, develops, manufactures, and sells various products in healthcare field.',
          currentPrice: 156.80,
          previousClose: 155.40,
          dayHigh: 158.20,
          dayLow: 154.90,
          volume: 8200000,
          marketCap: 379000000000,
          peRatio: 24.7,
          dividendYield: 3.05,
          fiftyTwoWeekHigh: 168.85,
          fiftyTwoWeekLow: 143.13
        },
        { 
          symbol: 'UNH', 
          name: 'UnitedHealth Group Inc.', 
          sector: 'Healthcare', 
          industry: 'Healthcare Plans',
          description: 'Provides health care coverage, software, and data consultancy services.',
          currentPrice: 524.30,
          previousClose: 518.75,
          dayHigh: 528.50,
          dayLow: 516.20,
          volume: 2800000,
          marketCap: 484000000000,
          peRatio: 28.3,
          dividendYield: 1.32,
          fiftyTwoWeekHigh: 562.00,
          fiftyTwoWeekLow: 445.68
        },
        { 
          symbol: 'PFE', 
          name: 'Pfizer Inc.', 
          sector: 'Healthcare', 
          industry: 'Drug Manufacturers',
          description: 'Discovers, develops, manufactures, and sells healthcare products worldwide.',
          currentPrice: 28.45,
          previousClose: 28.10,
          dayHigh: 28.85,
          dayLow: 27.95,
          volume: 42000000,
          marketCap: 160000000000,
          peRatio: 9.8,
          dividendYield: 5.91,
          fiftyTwoWeekHigh: 33.06,
          fiftyTwoWeekLow: 25.20
        },
        
        // Consumer
        { 
          symbol: 'WMT', 
          name: 'Walmart Inc.', 
          sector: 'Consumer Defensive', 
          industry: 'Discount Stores',
          description: 'Engages in retail and wholesale operations worldwide.',
          currentPrice: 73.85,
          previousClose: 72.90,
          dayHigh: 74.50,
          dayLow: 72.40,
          volume: 12000000,
          marketCap: 598000000000,
          peRatio: 32.5,
          dividendYield: 1.24,
          fiftyTwoWeekHigh: 75.55,
          fiftyTwoWeekLow: 49.85
        },
        { 
          symbol: 'KO', 
          name: 'The Coca-Cola Company', 
          sector: 'Consumer Defensive', 
          industry: 'Beverages',
          description: 'Manufactures, markets, and sells various nonalcoholic beverages worldwide.',
          currentPrice: 62.30,
          previousClose: 61.85,
          dayHigh: 62.80,
          dayLow: 61.50,
          volume: 16000000,
          marketCap: 270000000000,
          peRatio: 26.4,
          dividendYield: 2.89,
          fiftyTwoWeekHigh: 65.35,
          fiftyTwoWeekLow: 51.55
        },
        { 
          symbol: 'MCD', 
          name: 'McDonald\'s Corporation', 
          sector: 'Consumer Cyclical', 
          industry: 'Restaurants',
          description: 'Operates and franchises McDonald\'s restaurants worldwide.',
          currentPrice: 294.50,
          previousClose: 292.80,
          dayHigh: 296.20,
          dayLow: 291.40,
          volume: 2800000,
          marketCap: 214000000000,
          peRatio: 25.1,
          dividendYield: 2.17,
          fiftyTwoWeekHigh: 302.39,
          fiftyTwoWeekLow: 245.73
        },
        
        // Energy
        { 
          symbol: 'XOM', 
          name: 'Exxon Mobil Corporation', 
          sector: 'Energy', 
          industry: 'Oil & Gas',
          description: 'Engages in the exploration and production of crude oil and natural gas.',
          currentPrice: 116.75,
          previousClose: 115.20,
          dayHigh: 118.50,
          dayLow: 114.80,
          volume: 18000000,
          marketCap: 468000000000,
          peRatio: 13.2,
          dividendYield: 3.12,
          fiftyTwoWeekHigh: 124.45,
          fiftyTwoWeekLow: 95.77
        },
        { 
          symbol: 'CVX', 
          name: 'Chevron Corporation', 
          sector: 'Energy', 
          industry: 'Oil & Gas',
          description: 'Engages in integrated energy and chemicals operations worldwide.',
          currentPrice: 162.40,
          previousClose: 160.85,
          dayHigh: 164.20,
          dayLow: 159.50,
          volume: 9500000,
          marketCap: 298000000000,
          peRatio: 14.7,
          dividendYield: 3.45,
          fiftyTwoWeekHigh: 172.25,
          fiftyTwoWeekLow: 135.37
        },
        
        // Others
        { 
          symbol: 'DIS', 
          name: 'The Walt Disney Company', 
          sector: 'Communication Services', 
          industry: 'Entertainment',
          description: 'Operates as an entertainment company worldwide.',
          currentPrice: 113.45,
          previousClose: 111.80,
          dayHigh: 115.20,
          dayLow: 110.90,
          volume: 12000000,
          marketCap: 207000000000,
          peRatio: 38.6,
          dividendYield: 0,
          fiftyTwoWeekHigh: 123.74,
          fiftyTwoWeekLow: 78.73
        },
        { 
          symbol: 'NFLX', 
          name: 'Netflix Inc.', 
          sector: 'Communication Services', 
          industry: 'Entertainment',
          description: 'Provides entertainment services with TV series, documentaries, and films.',
          currentPrice: 638.50,
          previousClose: 632.10,
          dayHigh: 645.80,
          dayLow: 628.40,
          volume: 4200000,
          marketCap: 274000000000,
          peRatio: 44.3,
          dividendYield: 0,
          fiftyTwoWeekHigh: 697.49,
          fiftyTwoWeekLow: 344.73
        }
      ];

      await Stock.insertMany(stockData);
      console.log(`Seeded ${stockData.length} stocks`);
      
      // Also seed MarketPrice for these stocks
      for (const stock of stockData) {
        await MarketPrice.findOneAndUpdate(
          { symbol: stock.symbol },
          { 
            price: stock.currentPrice,
            timestamp: new Date()
          },
          { upsert: true }
        );
      }
      
    } catch (error) {
      console.error('Error seeding stock data:', error);
    }
  }
}

module.exports = StockPriceService;