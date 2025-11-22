import React, { useState } from 'react';
import CoinCard from './CoinCard';
import AddCoinModal from './AddCoinModal';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  price: number;
  change24h: number;
}

interface PortfolioProps {
  coins: Coin[];
  onAddCoin: () => void;
}

export default function Portfolio({ coins, onAddCoin }: PortfolioProps) {
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'name'>('value');

  const totalValue = coins.reduce((sum, coin) => sum + (coin.amount * coin.price), 0);
  const totalChange = coins.reduce((sum, coin) => {
    const coinValue = coin.amount * coin.price;
    const dailyChangeValue = coinValue * (coin.change24h / 100);
    return sum + dailyChangeValue;
  }, 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / totalValue) * 100 : 0;

  const sortedCoins = [...coins].sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return (b.amount * b.price) - (a.amount * a.price);
      case 'change':
        return b.change24h - a.change24h;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Portfolio Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Portfolio Overview</h2>
            <p className="text-gray-600">Track your cryptocurrency investments</p>
          </div>
          <button
            onClick={onAddCoin}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Coin
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-gray-900">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">24h Change</p>
            <p className={`text-3xl font-bold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange >= 0 ? '+' : ''}${Math.abs(totalChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">24h Change %</p>
            <p className={`text-3xl font-bold ${totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Controls */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Your Holdings</h3>
        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'value' | 'change' | 'name')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="value">Portfolio Value</option>
            <option value="change">24h Change</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Coins Grid */}
      {coins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCoins.map((coin) => (
            <CoinCard key={coin.id} coin={coin} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Coins in Portfolio</h3>
          <p className="text-gray-600 mb-6">
            Start building your cryptocurrency portfolio by adding your first coin.
          </p>
          <button
            onClick={onAddCoin}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Coin
          </button>
        </div>
      )}

      {/* Portfolio Allocation */}
      {coins.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
          <div className="space-y-3">
            {sortedCoins.map((coin) => {
              const coinValue = coin.amount * coin.price;
              const percentage = totalValue > 0 ? (coinValue / totalValue) * 100 : 0;
              
              return (
                <div key={coin.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {coin.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{coin.name}</p>
                      <p className="text-sm text-gray-600">{coin.amount} {coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${coinValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}