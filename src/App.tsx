import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MarketplaceSplit from './pages/MarketplaceSplit';
import OrderHistory from './pages/OrderHistory';
import Shop from './pages/Shop';
import NewArrivals from './pages/NewArrivals';
import Collections from './pages/Collections';
import Deals from './pages/Deals';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MarketplaceSplit />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/new-arrivals" element={<NewArrivals />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
