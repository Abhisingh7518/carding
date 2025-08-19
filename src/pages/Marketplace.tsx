import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, X, Plus, Minus, CreditCard, Star, Filter, ChevronRight, Package, Shield, Truck, User, LogOut, Eye, EyeOff, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';

interface Card {
  id: number;
  name: string;
  category: string;
  price: number;
  rarity: string;
  rating: number;
  inStock: boolean;
}

interface CartItem extends Card {
  quantity: number;
}

interface UserData {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export default function CardMarketplace() {
  const [currentView, setCurrentView] = useState<'marketplace' | 'login' | 'signup'>('marketplace');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [cards] = useState<Card[]>([
    { id: 1, name: "Lightning Dragon", category: "Mythic", price: 149.99, rarity: "Legendary", rating: 4.8, inStock: true },
    { id: 2, name: "Shadow Assassin", category: "Rare", price: 79.99, rarity: "Rare", rating: 4.6, inStock: true },
    { id: 3, name: "Crystal Phoenix", category: "Mythic", price: 299.99, rarity: "Legendary", rating: 5.0, inStock: true },
    { id: 4, name: "Storm Wizard", category: "Common", price: 29.99, rarity: "Common", rating: 4.2, inStock: true },
    { id: 5, name: "Ancient Golem", category: "Rare", price: 99.99, rarity: "Rare", rating: 4.5, inStock: false },
    { id: 6, name: "Mystic Fairy", category: "Uncommon", price: 49.99, rarity: "Uncommon", rating: 4.3, inStock: true },
    { id: 7, name: "Fire Elemental", category: "Rare", price: 89.99, rarity: "Rare", rating: 4.7, inStock: true },
    { id: 8, name: "Ice Queen", category: "Mythic", price: 199.99, rarity: "Legendary", rating: 4.9, inStock: true },
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState("credit");

  const categories = ["All", "Mythic", "Rare", "Uncommon", "Common"];

  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    const storedCart = sessionStorage.getItem('userCart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('userCart', JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
   
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: UserData) => u.email === loginData.email && u.password === loginData.password);
   
    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentView('marketplace');
      setLoginData({ email: '', password: '' });
    } else {
      setAuthError('Invalid email or password');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
   
    if (signupData.password !== signupData.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
   
    if (signupData.password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
   
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find((u: UserData) => u.email === signupData.email);
   
    if (existingUser) {
      setAuthError('Email already registered');
      return;
    }
   
    const newUser: UserData = {
      id: Date.now().toString(),
      email: signupData.email,
      password: signupData.password,
      name: signupData.name,
      createdAt: new Date().toISOString()
    };
   
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setCurrentUser(newUser);
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    setCurrentView('marketplace');
    setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    setCart([]);
    sessionStorage.removeItem('userCart');
    setIsProfileOpen(false);
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (card: Card) => {
    if (!currentUser) {
      setCurrentView('login');
      return;
    }
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === card.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === card.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...card, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "bg-gradient-to-r from-yellow-400 to-orange-500";
      case "Rare": return "bg-gradient-to-r from-purple-400 to-purple-600";
      case "Uncommon": return "bg-gradient-to-r from-blue-400 to-blue-600";
      default: return "bg-gradient-to-r from-gray-400 to-gray-600";
    }
  };

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 to-blue-600 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <button
            onClick={() => setCurrentView('marketplace')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Store
          </button>
         
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl inline-block mb-4">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Login to your CardHavi account</p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-purple-600" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-purple-600 hover:text-purple-700">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setCurrentView('signup');
                  setAuthError('');
                }}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 to-blue-600 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <button
            onClick={() => setCurrentView('marketplace')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Store
          </button>
         
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl inline-block mb-4">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2">Join CardHavi to start collecting</p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {authError}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={signupData.name}
                  onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" required className="rounded text-purple-600" />
              <span className="ml-2 text-sm text-gray-600">I agree to the Terms and Privacy Policy</span>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setCurrentView('login');
                  setAuthError('');
                }}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="ml-4 md:ml-0 flex items-center">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">CardHavi</span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8 ml-10">
              <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">Shop</a>
              <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">New Arrivals</a>
              <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">Collections</a>
              <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">Deals</a>
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
             
              <button
                onClick={() => {
                  if (currentUser) {
                    setIsCartOpen(true);
                  } else {
                    setCurrentView('login');
                  }
                }}
                className="relative p-2 hover:bg-gray-100 rounded-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {currentUser ? (
                <div className="relative">
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
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Order History
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setCurrentView('login')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-2">
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Shop</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">New Arrivals</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Collections</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Deals</a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-700 to-blue-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {currentUser ? `Welcome back, ${currentUser.name}!` : 'Collect Legendary Cards'}
          </h1>
          <p className="text-xl mb-8 opacity-90">Discover rare and powerful trading cards from around the world</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Browse Collection
            </button>
            {!currentUser && (
              <button
                onClick={() => setCurrentView('signup')}
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-700 transition"
              >
                Join Now
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
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
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Secure Payment</h3>
            <p className="text-gray-600">Safe & encrypted checkout</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile Search */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent ml-2 outline-none w-full"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Trading Cards</h2>
            <button className="flex items-center text-purple-600 hover:text-purple-700">
              <Filter className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === category
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCards.map(card => (
            <div key={card.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-64 rounded-t-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-white bg-opacity-90 rounded-lg p-4">
                      <Package className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">Card Image</span>
                    </div>
                  </div>
                </div>
                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-white text-xs font-semibold ${getRarityColor(card.rarity)}`}>
                  {card.rarity}
                </div>
                {!card.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-xl flex items-center justify-center">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{card.name}</h3>
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(card.rating) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">({card.rating})</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-purple-600">${card.price}</span>
                  <span className="text-sm text-gray-500">{card.category}</span>
                </div>
                <button
                  onClick={() => addToCart(card)}
                  disabled={!card.inStock}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {!currentUser ? 'Sign In to Buy' : card.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Shopping Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
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
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
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
                    <span className="text-xl font-bold text-purple-600">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(true);
                      setIsCartOpen(false);
                    }}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Checkout</h2>
                <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Summary */}
                <div>
                  <h3 className="font-semibold mb-4">Order Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{cartTotal > 50 ? 'FREE' : '$5.99'}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total</span>
                        <span className="text-purple-600">
                          ${(cartTotal + (cartTotal > 50 ? 0 : 5.99)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div>
                  <h3 className="font-semibold mb-4">Payment Method</h3>
                 
                  <div className="space-y-3 mb-4">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="credit"
                        checked={paymentMethod === 'credit'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <CreditCard className="w-5 h-5 mr-2" />
                      <span>Credit/Debit Card</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span>PayPal</span>
                    </label>
                  </div>

                  {paymentMethod === 'credit' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Card Number"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Cardholder Name"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition mt-6 flex items-center justify-center">
                    Complete Purchase
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
