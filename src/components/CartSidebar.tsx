import React from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';

interface CartSidebarProps {
  open: boolean;
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string | number, change: number) => void;
  total: number;
  onCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ open, cart, onClose, onUpdateQuantity, total, onCheckout }) => {
  // All crypto payments should go through CheckoutModal to collect address and link an Order
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Shopping Cart</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-gray-50 p-3 rounded-lg">
                    <div className="bg-gray-200 w-20 h-20 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t p-4">
              <div className="flex justify-between mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-purple-600">${total.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={onCheckout}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={onCheckout}
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
                  title="Pay with Bitcoin or USDT (TRC20 recommended)"
                >
                  Pay with Crypto (BTC/USDT)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
