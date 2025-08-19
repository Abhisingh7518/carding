import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSEO } from '../utils/seo';
import { UserData } from '../types';

const Collections: React.FC = () => {
  useSEO({ title: 'Collections', description: 'Discover curated collections at CARDHAVI.', path: '/collections' });
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Collections</h1>
          <p className="text-xl opacity-90">Curated themes and sets for enthusiasts</p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12 flex-1">
        <div className="rounded-xl border bg-white p-8 text-center text-gray-700">
          Collections grid coming here (connect with categories or tags)
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Collections;
