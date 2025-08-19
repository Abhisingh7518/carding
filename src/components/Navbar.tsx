import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const brand = useMemo(
    () => (import.meta.env.VITE_SITE_NAME as string) || 'CARDHAVI',
    []
  );
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const readUser = () => {
      try {
        const json = sessionStorage.getItem('currentUser');
        setCurrentUser(json ? JSON.parse(json) : null);
      } catch {
        setCurrentUser(null);
      }
    };
    readUser();
    // No cross-tab sync; per-tab sessions via sessionStorage.
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 dark:bg-black/40 border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 select-none">
          <span className="text-xl font-extrabold tracking-wider text-gray-900 dark:text-white">
            {brand.slice(0, Math.ceil(brand.length / 2))}
          </span>
          <span className="text-xl font-extrabold tracking-wider text-red-600">{brand.slice(Math.ceil(brand.length / 2), Math.ceil(brand.length / 2) + 1)}</span>
          <span className="text-xl font-extrabold tracking-wider text-gray-900 dark:text-white">{brand.slice(Math.ceil(brand.length / 2) + 1)}</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            to="/"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                : 'text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-white/10'
            }`}
          >
            Home
          </Link>
          <Link
            to="/orders"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/orders')
                ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                : 'text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-white/10'
            }`}
          >
            Orders
          </Link>
          {/* Auth Controls */}
          {!currentUser ? (
            <>
              <button
                onClick={() => navigate('/', { state: { openLogin: true } })}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-white/10"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/', { state: { openSignup: true } })}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-gray-900 text-white dark:bg-white dark:text-black"
              >
                Sign Up
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                sessionStorage.removeItem('currentUser');
                setCurrentUser(null);
                navigate('/');
              }}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-white/10"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
