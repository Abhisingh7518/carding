import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import CardItem from '../components/CardItem';
import CartSidebar from '../components/CartSidebar';
import CheckoutModal from '../components/CheckoutModal';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import Footer from '../components/Footer';
import { Card, CartItem as CartItemType, UserData, Order, OrderStatus } from '../types';
import { Filter, Truck, Shield, CreditCard as CreditCardIcon } from 'lucide-react';
import AdminPanel from './AdminPanel';
import { useSEO } from '../utils/seo';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4001';

const MarketplaceSplit: React.FC = () => {
  useSEO({
    title: 'Collect Legendary Cards',
    description: 'Discover rare and powerful trading cards. Browse categories, filter, add to cart, and checkout securely.',
    path: '/',
  });
  const [currentView, setCurrentView] = useState<'marketplace' | 'login' | 'signup' | 'admin'>('marketplace');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [authError, setAuthError] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [cardsError, setCardsError] = useState('');

  const [cart, setCart] = useState<CartItemType[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  // Payment method selection removed; we route to crypto invoice

  const categories = ['All', 'Mythic', 'Rare', 'Uncommon', 'Common'];

  const location = useLocation();

  // React to navbar navigation intents (open login/signup)
  useEffect(() => {
    const state = (location && (location as any).state) || {};
    if (state?.openLogin) {
      setCurrentView('login');
    } else if (state?.openSignup) {
      setCurrentView('signup');
    }
  }, [location]);

  // Listen for product updates from admin panel
  useEffect(() => {
    const handleProductsUpdated = () => {
      console.log('Products updated event received');
      const savedProducts = localStorage.getItem('products');
      console.log('Saved products from localStorage:', savedProducts);
      if (savedProducts) {
        try {
          const products = JSON.parse(savedProducts);
          console.log('Parsed products:', products);
          
          // Ensure all products have required fields with defaults
          const validatedProducts = products.map((p: any) => ({
            id: p.id || Math.random().toString(36).substr(2, 9),
            name: p.name || 'Unnamed Product',
            category: p.category || 'Uncategorized',
            price: Number(p.price) || 0,
            stock: Number(p.stock) || 0,
            inStock: p.inStock !== undefined ? p.inStock : (Number(p.stock) || 0) > 0,
            rarity: p.rarity || 'Common',
            rating: Number(p.rating) || 0,
            imageUrl: p.imageUrl || '',
            description: p.description || '',
            promoActive: Boolean(p.promoActive),
            promoBuyQty: Number(p.promoBuyQty) || 0,
            promoGetQty: Number(p.promoGetQty) || 0,
            promoGetAmount: Number(p.promoGetAmount) || 0,
          }));
          
          console.log('Setting cards state with validated products:', validatedProducts);
          setCards(validatedProducts);
        } catch (e) {
          console.error('Error parsing products:', e);
        }
      }
    };

    window.addEventListener('productsUpdated', handleProductsUpdated);
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, []);

  // Load cards from API or localStorage
  useEffect(() => {
    async function loadCards() {
      try {
        setLoadingCards(true);
        setCardsError('');
        console.log('Starting to load cards...');
        
        // First try to load from localStorage
        console.log('Checking localStorage for products...');
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
          try {
            const products = JSON.parse(savedProducts);
            console.log('Successfully loaded products from localStorage:', products);
            
            // Ensure all products have required fields with defaults
            const validatedProducts = products.map((p: any) => ({
              id: p.id || Math.random().toString(36).substr(2, 9),
              name: p.name || 'Unnamed Product',
              category: p.category || 'Uncategorized',
              price: Number(p.price) || 0,
              stock: Number(p.stock) || 0,
              inStock: p.inStock !== undefined ? p.inStock : (Number(p.stock) || 0) > 0,
              rarity: p.rarity || 'Common',
              rating: Number(p.rating) || 0,
              imageUrl: p.imageUrl || '',
              description: p.description || '',
              promoActive: Boolean(p.promoActive),
              promoBuyQty: Number(p.promoBuyQty) || 0,
              promoGetQty: Number(p.promoGetQty) || 0,
              promoGetAmount: Number(p.promoGetAmount) || 0,
            }));
            
            console.log('Setting cards state with:', validatedProducts);
            setCards(validatedProducts);
            return; // Successfully loaded from localStorage
          } catch (e) {
            console.error('Error parsing products from localStorage:', e);
          }
        }
        
        // Fall back to API if localStorage is empty or invalid
        console.log('No valid products in localStorage, trying API...');
        try {
          const res = await fetch(`${API}/api/cards`);
          if (res.ok) {
            const data = await res.json();
            // Map API docs to our Card type
            const mapped: Card[] = (data || []).map((d: any) => ({
              id: d._id || d.id || Math.random().toString(36).substr(2, 9),
              name: d.name || 'Unnamed Product',
              category: d.category || 'Uncategorized',
              price: Number(d.price) || 0,
              stock: Number(d.stock) || 0,
              inStock: d.inStock !== undefined ? d.inStock : (Number(d.stock) || 0) > 0,
              rarity: d.rarity || 'Common',
              rating: Number(d.rating) || 0,
              imageUrl: d.imageUrl || '',
              description: d.description || '',
              promoActive: Boolean(d.promoActive),
              promoBuyQty: Number(d.promoBuyQty) || 0,
              promoGetQty: Number(d.promoGetQty) || 0,
              promoGetAmount: Number(d.promoGetAmount) || 0,
            }));
            console.log('Successfully loaded cards from API:', mapped);
            setCards(mapped);
            try {
              localStorage.setItem('products', JSON.stringify(mapped));
              window.dispatchEvent(new Event('productsUpdated'));
            } catch {}
          } else {
            throw new Error(`API returned ${res.status}`);
          }
        } catch (e) {
          console.error('API fetch failed:', e);
          setCardsError('Failed to load products. Please try again later.');
          setCards([]);
        }
      } catch (e: any) {
        console.error('Error loading cards:', e);
        setCardsError('Failed to load cards. Using local data if available.');
      } finally {
        setLoadingCards(false);
      }
    }
    loadCards();
  }, []);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    const storedCart = sessionStorage.getItem('userCart');
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  // Removed cross-tab sync. Each tab keeps its own session via sessionStorage.

  useEffect(() => {
    if (currentUser) sessionStorage.setItem('userCart', JSON.stringify(cart));
  }, [cart, currentUser]);

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      setAuthError('');
      if (!email || !password) throw new Error('Email and password are required');

      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) throw new Error(data?.error || `Login failed (${res.status})`);

      const user: UserData = {
        id: data.id,
        email: data.email,
        name: data.name,
        createdAt: data.createdAt,
      };
      setCurrentUser(user);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentView('marketplace');
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthError(error?.message || 'Login failed. Please try again.');
    }
  };

  const handleSignupSubmit = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      setAuthError('');
      if (!name || !email || !password || !confirmPassword) throw new Error('All fields are required');
      if (password !== confirmPassword) throw new Error('Passwords do not match');
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      if (!/\S+@\S+\.\S+/.test(email)) throw new Error('Please enter a valid email address');

      const res = await fetch(`${API}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) throw new Error(data?.error || `Signup failed (${res.status})`);

      const newUser: UserData = {
        id: data.id,
        email: data.email,
        name: data.name,
        createdAt: data.createdAt,
      };
      setCurrentUser(newUser);
      sessionStorage.setItem('currentUser', JSON.stringify(newUser));
      setCurrentView('marketplace');
    } catch (error: any) {
      console.error('Signup error:', error);
      setAuthError(error?.message || 'Failed to create account. Please try again.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    setCart([]);
    sessionStorage.removeItem('userCart');
    setIsProfileOpen(false);
  };

  const filteredCards = cards.filter((card) => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (card: Card) => {
    if (!currentUser) {
      setCurrentView('login');
      return;
    }
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === card.id);
      if (existing) return prevCart.map((i) => (i.id === card.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prevCart, { ...card, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string | number, change: number) => {
    setCart((prev) => prev
      .map((i) => (i.id === id ? { ...i, quantity: i.quantity + change } : i))
      .filter((i) => i.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Checkout completion now happens after crypto payment; no immediate order placement here

  // Admin view route
  if (currentView === 'admin') {
    return <AdminPanel onBack={() => setCurrentView('marketplace')} />;
  }

  if (currentView === 'login') {
    return (
      <LoginForm
        onBack={() => setCurrentView('marketplace')}
        onSubmit={handleLoginSubmit}
        error={authError}
        siteName={import.meta.env.VITE_SITE_NAME || 'CARDHAVI'}
        onSwitchToSignup={() => setCurrentView('signup')}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <SignupForm
        onBack={() => setCurrentView('marketplace')}
        onSubmit={handleSignupSubmit}
        error={authError}
        siteName={import.meta.env.VITE_SITE_NAME || 'CARDHAVI'}
        onSwitchToLogin={() => setCurrentView('login')}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        currentUser={currentUser}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartItemsCount={cartItemsCount}
        onCartClick={() => (currentUser ? setIsCartOpen(true) : setCurrentView('login'))}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        onLogout={handleLogout}
        onSignIn={() => setCurrentView('login')}
        onSignUp={() => setCurrentView('signup')}
      />

      <section className="animated-gradient text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {currentUser ? `Welcome back, ${currentUser.name}!` : 'Collect Legendary Cards'}
          </h1>
          <p className="text-xl mb-8 opacity-90">Discover rare and powerful trading cards from around the world</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Browse Collection
            </button>
            {currentUser?.email === 'admin@example.com' && (
              <button
                onClick={() => setCurrentView('admin')}
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-700 transition"
              >
                Admin Panel
              </button>
            )}
            {/* Signup CTA removed as per request; use Navbar for auth actions */}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
            <p className="text-gray-600">On orders over $50</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Authentic Cards</h3>
            <p className="text-gray-600">100% genuine guaranteed</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Secure Payment</h3>
            <p className="text-gray-600">Safe & encrypted checkout</p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Trading Cards</h2>
            <button className="flex items-center text-purple-600 hover:text-purple-700">
              <Filter className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['All', 'Mythic', 'Rare', 'Uncommon', 'Common'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === category ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loadingCards && (
          <div className="py-10 text-center text-gray-600">Loading cards...</div>
        )}
        {cardsError && !loadingCards && (
          <div className="py-10 text-center text-red-600">{cardsError}</div>
        )}
        {!loadingCards && !cardsError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCards.map((card) => (
              <CardItem key={card.id} card={card} isAuthenticated={!!currentUser} onAdd={addToCart} />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <CartSidebar
        open={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        total={cartTotal}
        onCheckout={() => {
          setIsCheckoutOpen(true);
          setIsCartOpen(false);
        }}
      />

      <CheckoutModal
        open={isCheckoutOpen}
        cart={cart}
        total={cartTotal}
        currentUser={currentUser}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
};

export default MarketplaceSplit;
