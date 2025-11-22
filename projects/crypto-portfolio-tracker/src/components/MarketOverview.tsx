import React, { useState, useEffect } from 'react';
import CoinCard from './CoinCard';
import AddCoinModal from './AddCoinModal';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

interface MarketOverviewProps {
  onAddToPortfolio: (coinData: { coin: Coin; amount: number; purchasePrice: number }) => void;
}

export default function MarketOverview({ onAddToPortfolio }: MarketOverviewProps) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      // Mock data for demo - in real app, use CoinGecko API
      const mockCoins: Coin[] = [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'btc',
          current_price: 43250.50,
          price_change_percentage_24h: 2.45,
          market_cap: 847000000000,
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'eth',
          current_price: 2650.75,
          price_change_percentage_24h: -1.23,
          market_cap: 318000000000,
          image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
        },
        {
          id: 'cardano',
          name: 'Cardano',
          symbol: 'ada',
          current_price: 0.485,
          price_change_percentage_24h: 5.67,
          market_cap: 17200000000,
          image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png'
        },
        {
          id: 'solana',
          name: 'Solana',
          symbol: 'sol',
          current_price: 98.45,
          price_change_percentage_24h: -3.21,
          market_cap: 42800000000,
          image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
        },
        {
          id: 'polkadot',
          name: 'Polkadot',
          symbol: 'dot',
          current_price: 7.23,
          price_change_percentage_24h: 1.89,
          market_cap: 9100000000,
          image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png'
        },
        {
          id: 'chainlink',
          name: 'Chainlink',
          symbol: 'link',
          current_price: 14.67,
          price_change_percentage_24h: 4.32,
          market_cap: 8200000000,
          image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png'
        }
      ];

      setCoins(mockCoins);
    } catch (error) {
      console.error('Error fetching coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPortfolio = (coin: Coin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };

  const handleModalAdd = (coinData: { coin: Coin; amount: number; purchasePrice: number }) => {
    onAddToPortfolio(coinData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Market Overview</h2>
        <button
          onClick={fetchCoins}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coins.map(coin => (
          <CoinCard
            key={coin.id}
            coin={coin}
            onAddToPortfolio={handleAddToPortfolio}
          />
        ))}
      </div>

      <AddCoinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coin={selectedCoin}
        onAdd={handleModalAdd}
      />
    </div>
  );
}