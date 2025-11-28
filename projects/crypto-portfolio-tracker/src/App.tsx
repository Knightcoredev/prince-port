import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Portfolio from './components/Portfolio';
import MarketOverview from './components/MarketOverview';
import CoinCard from './components/CoinCard';
import AddCoinModal from './components/AddCoinModal';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  price: number;
  change24h: number;
}

function App() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 0.5,
      price: 45000,
      change24h: 2.5
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      amount: 2.3,
      price: 3200,
      change24h: -1.2
    },
    {
      id: 'cardano',
      symbol: 'ADA',
      name: 'Cardano',
      amount: 1000,
      price: 0.85,
      change24h: 5.8
    }
  ]);

  const totalValue = coins.reduce((sum, coin) => sum + (coin.amount * coin.price), 0);
  const dailyChange = coins.reduce((sum, coin) => {
    const coinValue = coin.amount * coin.price;
    const dailyChangeValue = coinValue * (coin.change24h / 100);
    return sum + dailyChangeValue;
  }, 0);
  const dailyChangePercent = totalValue > 0 ? (dailyChange / totalValue) * 100 : 0;

  const handleAddCoin = (newCoin: Omit<Coin, 'id'>) => {
    const coin: Coin = {
      ...newCoin,
      id: newCoin.symbol.toLowerCase()
    };
    setCoins([...coins, coin]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return (
          <Portfolio 
            coins={coins} 
            onAddCoin={() => setIsAddModalOpen(true)}
          />
        );
      case 'market':
        return <MarketOverview />;
      case 'watchlist':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Watchlist</h2>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add to Watchlist
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CoinCard
                coin={{
                  id: 'solana',
                  symbol: 'SOL',
                  name: 'Solana',
                  amount: 0,
                  price: 120,
                  change24h: 8.5
                }}
                isWatchlist={true}
              />
              <CoinCard
                coin={{
                  id: 'polkadot',
                  symbol: 'DOT',
                  name: 'Polkadot',
                  amount: 0,
                  price: 25,
                  change24h: -3.2
                }}
                isWatchlist={true}
              />
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h2>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">₿</span>
                      </div>
                      <div>
                        <p className="font-medium">Bought Bitcoin</p>
                        <p className="text-sm text-gray-600">0.1 BTC at $44,500</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">-$4,450.00</p>
                      <p className="text-sm text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">Ξ</span>
                      </div>
                      <div>
                        <p className="font-medium">Sold Ethereum</p>
                        <p className="text-sm text-gray-600">1.5 ETH at $3,180</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+$4,770.00</p>
                      <p className="text-sm text-gray-600">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Portfolio coins={coins} onAddCoin={() => setIsAddModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        totalValue={totalValue}
        dailyChange={dailyChange}
        dailyChangePercent={dailyChangePercent}
      />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main>
        {renderContent()}
      </main>

      {isAddModalOpen && (
        <AddCoinModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCoin}
        />
      )}
    </div>
  );
}

export default App;