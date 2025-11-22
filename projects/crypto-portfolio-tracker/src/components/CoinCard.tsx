import React from 'react';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

interface CoinCardProps {
  coin: Coin;
  onAddToPortfolio: (coin: Coin) => void;
}

export default function CoinCard({ coin, onAddToPortfolio }: CoinCardProps) {
  const isPositive = coin.price_change_percentage_24h > 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={coin.image}
            alt={coin.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{coin.name}</h3>
            <p className="text-gray-500 uppercase text-sm">{coin.symbol}</p>
          </div>
        </div>
        
        <button
          onClick={() => onAddToPortfolio(coin)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Add to Portfolio
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Price</span>
          <span className="font-semibold text-lg">
            {formatPrice(coin.current_price)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">24h Change</span>
          <span className={`font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Market Cap</span>
          <span className="font-medium">
            {formatMarketCap(coin.market_cap)}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className={`w-full h-2 rounded-full ${
          isPositive ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isPositive ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{
              width: `${Math.min(Math.abs(coin.price_change_percentage_24h) * 2, 100)}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}