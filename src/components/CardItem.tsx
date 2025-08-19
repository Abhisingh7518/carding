import React from 'react';
import { Package, Star } from 'lucide-react';
import { Card } from '../types';

interface CardItemProps {
  card: Card;
  isAuthenticated: boolean;
  onAdd: (card: Card) => void;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Legendary':
      return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    case 'Rare':
      return 'bg-gradient-to-r from-purple-400 to-purple-600';
    case 'Uncommon':
      return 'bg-gradient-to-r from-blue-400 to-blue-600';
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-600';
  }
};

const CardItem: React.FC<CardItemProps> = ({ card, isAuthenticated, onAdd }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
      <div className="relative">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-64 object-cover rounded-t-xl"
            loading="lazy"
          />
        ) : (
          <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-64 rounded-t-xl flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white bg-opacity-90 rounded-lg p-4">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-600">Card Image</span>
              </div>
            </div>
          </div>
        )}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-white text-xs font-semibold ${getRarityColor(card.rarity)}`}>
          {card.rarity}
        </div>
        {card.promoActive && (card.promoBuyQty || 0) > 0 && (card.promoGetQty || 0) > 0 && (
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-green-600 text-white text-[11px] font-semibold shadow">
            Buy {card.promoBuyQty} Get {card.promoGetQty}
          </div>
        )}
        {!card.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-xl flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{card.name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(card.rating) ? 'fill-current' : ''}`} />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">({card.rating})</span>
        </div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-sm uppercase tracking-wide text-gray-800 font-bold">Buy $</span>
            <span className="text-2xl font-bold text-purple-600">${card.price}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm uppercase tracking-wide text-gray-800 font-bold">Get $</span>
            <span className={"text-2xl font-bold " + ((typeof card.promoGetAmount === 'number' && card.promoGetAmount > 0) ? 'text-green-600' : 'text-gray-400')}>
              {typeof card.promoGetAmount === 'number' && card.promoGetAmount > 0 ? `$${card.promoGetAmount.toFixed(2)}` : '—'}
            </span>
          </div>
        </div>
        <button
          onClick={() => onAdd(card)}
          disabled={!card.inStock}
          className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {!isAuthenticated ? 'Sign In to Buy' : card.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default CardItem;
