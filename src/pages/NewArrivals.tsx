import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSEO } from '../utils/seo';
import { UserData } from '../types';

const NewArrivals: React.FC = () => {
  useSEO({ title: 'New Arrivals', description: 'See the latest arrivals at CARDHAVI.', path: '/new-arrivals' });
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">New Arrivals</h1>
          <p className="text-xl opacity-90">Fresh drops just added to the store</p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12 flex-1">
        <div className="rounded-xl border bg-white p-8 text-center text-gray-700">
          Products list coming here (hook into your cards data as needed)
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewArrivals;
