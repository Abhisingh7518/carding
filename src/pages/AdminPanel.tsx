import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AdminProducts from '../components/AdminProducts';
import { Order, OrderStatus, UserData } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface AdminPanelProps {
  onBack: () => void;
}

const statusOptions: OrderStatus[] = ['pending', 'packed', 'shipped', 'delivered', 'cancelled'];
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4001';

type Tab = 'products' | 'orders';

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Header-related minimal state
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Load orders when Orders tab is active
  useEffect(() => {
    const loadOrders = async () => {
      if (activeTab !== 'orders') return;
      try {
        setOrdersLoading(true);
        setOrdersError('');
        const res = await fetch(`${API}/api/orders`);
        if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
        const data = await res.json();
        setOrders(data || []);
      } catch (e: any) {
        console.error('Load orders error:', e);
        setOrdersError(e?.message || 'Failed to load orders');
      } finally {
        setOrdersLoading(false);
      }
    };
    loadOrders();
  }, [activeTab]);

  // Load currentUser from sessionStorage for Header display
  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    onBack();
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    } catch (e: any) {
      alert(e?.message || 'Failed to update order status');
    }
  };

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
        onLogout={handleLogout}
        onSignIn={onBack}
        onSignUp={onBack}
      />

      <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-white rounded-lg shadow hover:bg-gray-50">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-6 font-medium text-sm ${activeTab === 'products' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-6 font-medium text-sm ${activeTab === 'orders' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Orders
          </button>
        </div>

        {activeTab === 'products' ? (
          <AdminProducts onBack={onBack} />
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Orders Management</h2>
            {ordersLoading && <div className="text-gray-600">Loading orders...</div>}
            {ordersError && !ordersLoading && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded mb-4">{ordersError}</div>
            )}
            {!ordersLoading && !ordersError && (
              <>
                {/* Mobile cards */}
                <div className="md:hidden space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center text-gray-500">No orders yet.</div>
                  ) : (
                    orders.map((order) => (
                      <div key={order._id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-xs text-gray-500">Order</div>
                            <div className="font-semibold">#{order._id?.substring(0,8).toUpperCase()}</div>
                            <div className="text-sm text-gray-600 mt-1">{order.user?.name || order.user?.email}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Total</div>
                            <div className="font-semibold">${order.total?.toFixed(2)}</div>
                            <div className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div className="text-gray-600">Items: {order.items?.length || 0}</div>
                          <select
                            value={order.status as OrderStatus}
                            onChange={(e) => updateOrderStatus(order._id!, e.target.value as OrderStatus)}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No orders yet.</td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id?.substring(0,8).toUpperCase()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.user?.name || order.user?.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items?.length || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${order.total?.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={order.status as OrderStatus}
                                onChange={(e) => updateOrderStatus(order._id!, e.target.value as OrderStatus)}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                {statusOptions.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPanel;
