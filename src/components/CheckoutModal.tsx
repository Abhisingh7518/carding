import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { CartItem, UserData } from '../types';

interface CheckoutModalProps {
  open: boolean;
  cart: CartItem[];
  total: number;
  currentUser: UserData | null;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ open, cart, total, currentUser, onClose }) => {
  if (!open) return null;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addr1, setAddr1] = useState('');
  const [addr2, setAddr2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [addrError, setAddrError] = useState('');
  const apiBase = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4001';

  const buildAddressString = () => {
    const parts = [
      `Name: ${fullName}`,
      `Phone: ${phone}`,
      `Address1: ${addr1}`,
      addr2 ? `Address2: ${addr2}` : '',
      landmark ? `Landmark: ${landmark}` : '',
      `City: ${city}`,
      `District: ${district}`,
      `State: ${stateName}`,
      `Pincode: ${pincode}`,
    ].filter(Boolean);
    return parts.join(' | ');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen px-4 flex items-center justify-center">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Checkout</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>)
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{total > 50 ? 'FREE' : '$5.99'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Total</span>
                    <span className="text-purple-600">{(total + (total > 50 ? 0 : 5.99)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <div className="space-y-2 mb-4">
                <input value={fullName} onChange={(e)=>setFullName(e.target.value)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Full name" />
                <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Phone" />
                <input value={addr1} onChange={(e)=>setAddr1(e.target.value)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Address line 1" />
                <input value={addr2} onChange={(e)=>setAddr2(e.target.value)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Address line 2 (optional)" />
                <input value={landmark} onChange={(e)=>setLandmark(e.target.value)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Landmark (optional)" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={city} onChange={(e)=>setCity(e.target.value)} className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="City" />
                  <input value={district} onChange={(e)=>setDistrict(e.target.value)} className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="District" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={stateName} onChange={(e)=>setStateName(e.target.value)} className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="State" />
                  <input value={pincode} onChange={(e)=>setPincode(e.target.value)} className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Pincode" />
                </div>
                {addrError && <div className="text-sm text-red-600">{addrError}</div>}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 text-sm mb-3">
                Only Crypto payments are supported here. You will be redirected to a secure invoice page to pay with BTC or USDT-TRC20.
              </div>

              <button
                onClick={async () => {
                  setAddrError('');
                  if (!currentUser) {
                    setAddrError('Please login to continue');
                    return;
                  }
                  if (!fullName || !phone || !addr1 || !city || !district || !stateName || !pincode) {
                    setAddrError('Please fill all required address fields');
                    return;
                  }
                  const addrStr = buildAddressString();
                  try {
                    // 1) Create Order (pending)
                    const orderRes = await fetch(`${apiBase}/api/orders`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        user: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
                        items: cart.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
                        total,
                        address: addrStr,
                        payment: { method: 'crypto', status: 'unpaid' },
                      }),
                    });
                    const orderData = await orderRes.json();
                    if (!orderRes.ok || !orderData?.id) throw new Error(orderData?.error || 'Order creation failed');

                    // 2) Create Crypto Invoice linked to Order
                    const invRes = await fetch(`${apiBase}/api/pay/crypto/create-invoice`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ amount: total, currency: 'USD', meta: { source: 'checkout' }, orderId: orderData.id }),
                    });
                    const invData = await invRes.json();
                    if (!invRes.ok || !invData?.invoiceUrl) throw new Error(invData?.error || 'Failed to start crypto payment');

                    // 3) Redirect to hosted invoice
                    window.location.href = invData.invoiceUrl;
                  } catch (e: any) {
                    setAddrError(e?.message || 'Unable to start crypto payment');
                  }
                }}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition mt-6 flex items-center justify-center"
                title="Pay with Bitcoin or USDT (TRC20)"
              >
                Pay with Crypto (BTC/USDT)
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
