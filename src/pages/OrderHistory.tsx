import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle, Truck, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useSEO } from '../utils/seo';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4001';

const OrderHistory: React.FC = () => {
  useSEO({
    title: 'My Orders',
    description: 'View your past orders, statuses, and details on CARDHAVI.',
    path: '/orders',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const currentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('currentUser') || 'null'); } catch { return null; }
  })();
  
  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get current user from sessionStorage
        const userJson = sessionStorage.getItem('currentUser');
        if (!userJson) {
          navigate('/');
          return;
        }
        
        const user = JSON.parse(userJson);
        const response = await fetch(`${API}/api/orders/user/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'packed':
        return <Package className="w-5 h-5 text-indigo-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };
  
  const getStatusText = (status: OrderStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  const getStatusSteps = (status: OrderStatus) => {
    const steps = [
      { id: 'pending', label: 'Order Placed', active: true },
      { id: 'packed', label: 'Packed', active: false },
      { id: 'shipped', label: 'Shipped', active: false },
      { id: 'delivered', label: 'Delivered', active: false },
    ];
    
    if (status === 'cancelled') {
      return steps.map(step => ({
        ...step,
        active: false,
        cancelled: true
      }));
    }
    
    const statusIndex = steps.findIndex(step => step.id === status);
    return steps.map((step, index) => ({
      ...step,
      active: index <= statusIndex
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
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
          onLogout={() => { sessionStorage.removeItem('currentUser'); navigate('/'); }}
          onSignIn={() => { navigate('/'); window.history.pushState({ openLogin: true }, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
          onSignUp={() => { navigate('/'); window.history.pushState({ openSignup: true }, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
        />
        <main className="p-4 flex-1">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...Array(3)].map((_, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-4"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
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
          onLogout={() => { sessionStorage.removeItem('currentUser'); navigate('/'); }}
          onSignIn={() => { navigate('/'); window.history.pushState({ openLogin: true }, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
          onSignUp={() => { navigate('/'); window.history.pushState({ openSignup: true }, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
        />
        <main className="p-4 flex-1">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
        onLogout={() => { sessionStorage.removeItem('currentUser'); navigate('/'); }}
        onSignIn={() => { navigate('/'); window.history.pushState({ openLogin: true }, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
        onSignUp={() => { navigate('/'); window.history.pushState({ openSignup: true }, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
      />
      <main className="p-4 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
            <p className="text-gray-500">Your order history will appear here</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Mobile list (cards) */}
            <div className="space-y-4 md:hidden">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Order</div>
                      <div className="text-base font-semibold">#{order._id?.substring(0,8).toUpperCase()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="text-base font-bold">${order.total.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className="mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                    {getStatusIcon(order.status as OrderStatus)}
                    <span className="ml-1">{getStatusText(order.status as OrderStatus)}</span>
                  </div>
                  <button
                    onClick={() => toggleOrder(order._id)}
                    className="mt-3 w-full border rounded-md py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                  >
                    {expandedOrder === order._id ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" /> Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" /> View details
                      </>
                    )}
                  </button>
                  {expandedOrder === order._id && (
                    <div className="mt-3 border-t pt-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-1 text-sm">
                          <span className="text-gray-700">{item.name} × {item.quantity}</span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleOrder(order._id)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id?.substring(0, 8).toUpperCase()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.total.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(order.status as OrderStatus)}
                            <span className="ml-2 text-sm text-gray-900">{getStatusText(order.status as OrderStatus)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">{expandedOrder === order._id ? (<ChevronUp className="h-5 w-5 text-gray-500" />) : (<ChevronDown className="h-5 w-5 text-gray-500" />)}</td>
                      </tr>
                      {expandedOrder === order._id && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Order Details</h4>
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                ))}
                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                  <p className="text-sm font-medium text-gray-700">Total Amount</p>
                                  <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-3">Order Status</h4>
                              <div className="relative">
                                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                  {getStatusSteps(order.status as OrderStatus).map((step, index, array) => (
                                    <div key={step.id} style={{ width: `${100 / array.length}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${step.active ? (step.id === 'cancelled' ? 'bg-red-500' : 'bg-blue-500') : 'bg-gray-200'}`}></div>
                                  ))}
                                </div>
                                <div className="flex justify-between text-xs text-gray-600 mt-2">
                                  {getStatusSteps(order.status as OrderStatus).map((step, index, array) => (
                                    <div key={step.id} className={`flex flex-col items-center ${index < array.length - 1 ? 'flex-1' : ''}`}>
                                      <span className={`inline-block w-2 h-2 rounded-full ${step.active ? (step.id === 'cancelled' ? 'bg-red-500' : 'bg-blue-500') : 'bg-gray-300'}`}></span>
                                      <span className="mt-1 text-xs">{step.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderHistory;
