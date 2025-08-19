import React from 'react';
import { Menu, X, Package, Search, ShoppingCart, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserData } from '../types';

interface HeaderProps {
  currentUser: UserData | null;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  cartItemsCount: number;
  onCartClick: () => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  onLogout: () => void;
  onSignIn: () => void;
  onSignUp?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentUser,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  searchTerm,
  setSearchTerm,
  cartItemsCount,
  onCartClick,
  isProfileOpen,
  setIsProfileOpen,
  onLogout,
  onSignIn,
  onSignUp,
}) => {
  const siteName = (import.meta as any).env?.VITE_SITE_NAME || 'CARDHAVI';
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 dark:bg-black/40 border-b border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="ml-4 md:ml-0 flex items-center select-none">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2.5 rounded-xl shadow-sm">
                <Package className="w-8 h-8 text-white" />
              </div>
              <span className="ml-3 text-2xl md:text-3xl font-extrabold tracking-wider gradient-text-animated uppercase">
                {siteName}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8 ml-10">
            <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-purple-600 font-medium">Shop</Link>
            <Link to="/new-arrivals" className="text-gray-700 hover:text-purple-600 font-medium">New Arrivals</Link>
            <Link to="/collections" className="text-gray-700 hover:text-purple-600 font-medium">Collections</Link>
            <Link to="/deals" className="text-gray-700 hover:text-purple-600 font-medium">Deals</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent ml-2 outline-none w-48"
              />
            </div>
            
            <button onClick={onCartClick} className="relative p-2 hover:bg-gray-100 rounded-lg">
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold">{currentUser.name}</p>
                      <p className="text-sm text-gray-600">{currentUser.email}</p>
                    </div>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </button>
                    <Link 
                      to="/orders" 
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Order History
                    </Link>
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onSignIn}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignUp}
                  className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition bg-white"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 dark:bg-black/40 border-t border-black/10 dark:border-white/10">
          <div className="px-4 py-3 space-y-2">
            <Link to="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/shop" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
            <Link to="/new-arrivals" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>New Arrivals</Link>
            <Link to="/collections" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
            <Link to="/deals" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>Deals</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
