import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get('order_id') || '';

  useEffect(() => {
    // Optionally, we could fetch latest order status here
  }, [orderId]);

  return (
    <div className="min-h-screen w-full animated-gradient flex items-center justify-center p-4 auth-fade-in">
      <div className="w-full max-w-xl brand-auth-surface brand-auth-surface--gradient rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold gradient-text mb-2">Payment Successful</h1>
        <p className="text-white/80 mb-6">Thank you! Your payment was received.
          {orderId && (
            <>
              <br />
              <span className="text-white/60">Order Reference: </span>
              <span className="font-semibold">{orderId}</span>
            </>
          )}
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/orders" className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900">View Orders</Link>
          <Link to="/" className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
