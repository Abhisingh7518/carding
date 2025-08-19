import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSEO } from '../utils/seo';
import { UserData } from '../types';

const Shop: React.FC = () => {
  useSEO({ title: 'Shop', description: 'Browse the full CARDHAVI shop with all categories and items.', path: '/shop' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentUser: UserData | null = (() => {
    try { return JSON.parse(sessionStorage.getItem('currentUser') || 'null'); } catch { return null; }
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentUser={currentUser}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartItemsCount={0}
        onCartClick={() => {}}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        onLogout={() => { sessionStorage.removeItem('currentUser'); window.location.href = '/'; }}
        onSignIn={() => { window.history.pushState({ openLogin: true }, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
        onSignUp={() => { window.history.pushState({ openSignup: true }, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
      />

      <section className="animated-gradient text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Shop</h1>
          <p className="text-xl opacity-90">Explore all products across categories</p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a className="p-8 rounded-xl border hover:shadow transition bg-white" href="/new-arrivals">
            <h3 className="text-xl font-semibold mb-2">New Arrivals</h3>
            <p className="text-gray-600">Latest additions to the store</p>
          </a>
          <a className="p-8 rounded-xl border hover:shadow transition bg-white" href="/collections">
            <h3 className="text-xl font-semibold mb-2">Collections</h3>
            <p className="text-gray-600">Curated sets and themes</p>
          </a>
          <a className="p-8 rounded-xl border hover:shadow transition bg-white" href="/deals">
            <h3 className="text-xl font-semibold mb-2">Deals</h3>
            <p className="text-gray-600">Discounts and special offers</p>
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
