import React, { useState } from 'react';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  image: string;
}

interface AddCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: Coin | null;
  onAdd: (coinData: { coin: Coin; amount: number; purchasePrice: number }) => void;
}

export default function AddCoinModal({ isOpen, onClose, coin, onAdd }: AddCoinModalProps) {
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  React.useEffect(() => {
    if (coin && isOpen) {
      setPurchasePrice(coin.current_price.toString());
    }
  }, [coin, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coin || !amount || !purchasePrice) return;

    const amountNum = parseFloat(amount);
    const priceNum = parseFloat(purchasePrice);

    if (amountNum <= 0 || priceNum <= 0) {
      alert('Please enter valid positive numbers');
      return;
    }

    onAdd({
      coin,
      amount: amountNum,
      purchasePrice: priceNum
    });

    setAmount('');
    setPurchasePrice('');
    onClose();
  };

  if (!isOpen || !coin) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Add {coin.name} to Portfolio
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
            <div>
              <p className="font-medium">{coin.name}</p>
              <p className="text-sm text-gray-500">{coin.symbol.toUpperCase()}</p>
            </div>
            <div className="ml-auto">
              <p className="text-sm text-gray-600">Current Price</p>
              <p className="font-semibold">${coin.current_price.toFixed(6)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount ({coin.symbol.toUpperCase()})
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="any"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price (USD)
              </label>
              <input
                type="number"
                id="purchasePrice"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                step="any"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {amount && purchasePrice && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Investment</p>
                <p className="text-lg font-semibold text-blue-600">
                  ${(parseFloat(amount) * parseFloat(purchasePrice)).toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add to Portfolio
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}