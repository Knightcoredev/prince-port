import React from 'react';

interface HeaderProps {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
}

export default function Header({ totalValue, dailyChange, dailyChangePercent }: HeaderProps) {
  const isPositive = dailyChange >= 0;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CryptoTracker</h1>
            <p className="text-gray-600">Your cryptocurrency portfolio dashboard</p>
          </div>
          
          <div className="mt-4 sm:mt-0 text-right">
            <div className="text-3xl font-bold text-gray-900">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-lg font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}${dailyChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="ml-2">
                ({isPositive ? '+' : ''}{dailyChangePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="text-sm text-gray-500">24h Change</div>
          </div>
        </div>
      </div>
    </header>
  );
}